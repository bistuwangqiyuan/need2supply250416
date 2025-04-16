import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Tag, Space, Select, Input, Button, Typography, Badge, Modal, message } from 'antd';
import { SearchOutlined, RobotOutlined } from '@ant-design/icons';
import { supabase } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import styled from 'styled-components';

const { Title, Text, Paragraph } = Typography;

const Container = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const FilterContainer = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const DemandCard = styled(Card)`
  margin-bottom: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const RecommendationModal = styled(Modal)`
  .ant-modal-body {
    max-height: 60vh;
    overflow-y: auto;
  }
`;

interface Demand {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: string;
  status: string;
  created_at: string;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  experience_years: number;
}

interface RecommendationItem {
  demand_id: string;
  matching_score: string;
  matching_reasons: string[];
  skill_matches: string[];
  suggestions: string[];
}

interface AIResponse {
  recommendations: RecommendationItem[];
}

interface EnhancedDemand extends Demand {
  matchingScore: number;
  matchingReasons: string[];
  skillMatches: string[];
  suggestions: string[];
}

const categories = [
  { label: '全部类别', value: '' },
  { label: '技术开发', value: 'development' },
  { label: '设计创意', value: 'design' },
  { label: '市场营销', value: 'marketing' },
  { label: '运营服务', value: 'operation' },
  { label: '其他服务', value: 'others' },
];

const DemandList: React.FC = () => {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [searchText, setSearchText] = useState('');
  const [recommendModalVisible, setRecommendModalVisible] = useState(false);
  const [recommendedDemands, setRecommendedDemands] = useState<EnhancedDemand[]>([]);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchDemands = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('demands')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }
      if (searchText) {
        query = query.or(`title.ilike.%${searchText}%,description.ilike.%${searchText}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDemands(data || []);
    } catch (error) {
      console.error('获取需求列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserResources = async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('id, title, description, category, skills, experience_years')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('获取用户资源失败:', error);
      return null;
    }
  };

  const handleRecommend = async () => {
    if (!user) {
      message.error('请先登录');
      return;
    }

    try {
      setRecommendLoading(true);
      const resources = await fetchUserResources();
      
      if (!resources || resources.length === 0) {
        message.error('您还没有发布任何资源，无法进行智能推荐');
        return;
      }

      const response = await axios.post(import.meta.env.VITE_ZHIPUAI_API_URL, {
        prompt: [
          {
            role: 'system',
            content: `你是一个专业的需求匹配专家。你的任务是根据用户的资源特点，从需求列表中推荐最合适的需求。
            请遵循以下规则：
            1. 只推荐与用户资源技能和类别相关的需求
            2. 根据以下因素进行匹配度评分：
               - 技能匹配度：用户的技能是否满足需求要求
               - 类别相关性：资源和需求的类别是否匹配
               - 经验要求：用户的经验是否满足需求
            3. 匹配度评分标准：
               - 90-100分：完全匹配，技能和类别都非常契合
               - 70-89分：良好匹配，大部分技能匹配
               - 50-69分：基本匹配，有相关技能
               - 低于50分：不推荐
            4. 只返回匹配度大于50分的需求
            5. 给出具体的匹配理由和改进建议`
          },
          {
            role: 'user',
            content: `请分析以下资源和需求，并返回推荐结果：

资源信息：
${JSON.stringify(resources, null, 2)}

需求列表：
${JSON.stringify(demands, null, 2)}

请严格按照以下 JSON 格式返回结果：
{
  "recommendations": [
    {
      "demand_id": "需求ID",
      "matching_score": "匹配度分数(0-100)",
      "matching_reasons": [
        "匹配理由1",
        "匹配理由2"
      ],
      "skill_matches": [
        "匹配的技能1",
        "匹配的技能2"
      ],
      "suggestions": [
        "建议1",
        "建议2"
      ]
    }
  ]
}`
          }
        ],
        request_id: Date.now().toString(),
        incremental: false
      }, {
        headers: {
          'Authorization': import.meta.env.VITE_ZHIPUAI_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      let aiResponse: AIResponse;
      try {
        const responseText = response.data.data.content;
        const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
        
        try {
          aiResponse = JSON.parse(cleanedText);
        } catch (e) {
          const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            aiResponse = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('无法从响应中提取JSON数据');
          }
        }

        if (!aiResponse || !Array.isArray(aiResponse.recommendations)) {
          throw new Error('响应格式不正确');
        }

        aiResponse.recommendations.forEach((rec, index) => {
          if (!rec.demand_id || !rec.matching_score || !Array.isArray(rec.matching_reasons) || 
              !Array.isArray(rec.skill_matches) || !Array.isArray(rec.suggestions)) {
            throw new Error(`第 ${index + 1} 个推荐项格式不正确`);
          }
        });
      } catch (parseError: Error | unknown) {
        console.error('解析AI响应失败:', parseError);
        message.error(`解析推荐结果失败: ${parseError instanceof Error ? parseError.message : '未知错误'}`);
        return;
      }

      const recommendedList = aiResponse.recommendations
        .map((rec: RecommendationItem) => {
          const demand = demands.find(d => d.id === rec.demand_id);
          if (!demand) {
            return null;
          }
          return {
            ...demand,
            matchingScore: parseInt(rec.matching_score) || 0,
            matchingReasons: rec.matching_reasons || [],
            skillMatches: rec.skill_matches || [],
            suggestions: rec.suggestions || []
          };
        })
        .filter((item): item is EnhancedDemand => item !== null)
        .sort((a: EnhancedDemand, b: EnhancedDemand) => b.matchingScore - a.matchingScore);

      if (recommendedList.length === 0) {
        message.warning('未找到与您资源匹配的需求');
        return;
      }
      
      setRecommendedDemands(recommendedList);
      setRecommendModalVisible(true);
    } catch (error) {
      console.error('推荐失败:', error);
      message.error('推荐失败，请稍后重试');
    } finally {
      setRecommendLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, [category, searchText]);

  return (
    <Container>
      <Title level={2}>需求列表</Title>
      
      <FilterContainer>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap>
            <Select
              style={{ width: 200 }}
              placeholder="选择类别"
              options={categories}
              value={category}
              onChange={setCategory}
            />
            <Input
              style={{ width: 300 }}
              placeholder="搜索需求标题或描述"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
            {user && (
              <Button 
                type="primary" 
                icon={<RobotOutlined />} 
                onClick={handleRecommend}
                loading={recommendLoading}
              >
                AI智能推荐
              </Button>
            )}
          </Space>
          <Button type="primary" onClick={() => navigate('/demands/create')}>
            发布需求
          </Button>
        </Space>
      </FilterContainer>

      <List
        loading={loading}
        dataSource={demands}
        renderItem={(demand) => (
          <DemandCard onClick={() => navigate(`/demands/${demand.id}`)}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                <Title level={4} style={{ margin: 0 }}>{demand.title}</Title>
                <Text type="secondary">
                  预算：￥{demand.budget}
                </Text>
              </Space>
              
              <Paragraph ellipsis={{ rows: 2 }}>
                {demand.description}
              </Paragraph>

              <Space split={<Text type="secondary">·</Text>}>
                <Text type="secondary">
                  截止日期：{new Date(demand.deadline).toLocaleDateString()}
                </Text>
                <Text type="secondary">
                  {categories.find(c => c.value === demand.category)?.label}
                </Text>
                <Text type="secondary">
                  发布时间：{new Date(demand.created_at).toLocaleDateString()}
                </Text>
              </Space>
            </Space>
          </DemandCard>
        )}
      />

      <RecommendationModal
        title="AI 智能推荐"
        open={recommendModalVisible}
        onCancel={() => setRecommendModalVisible(false)}
        footer={null}
        width={800}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Paragraph>
            根据您的资源特点，为您推荐以下最匹配的需求：
          </Paragraph>
          <List
            dataSource={recommendedDemands}
            renderItem={(demand) => (
              <DemandCard onClick={() => {
                setRecommendModalVisible(false);
                navigate(`/demands/${demand.id}`);
              }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Title level={4} style={{ margin: 0 }}>{demand.title}</Title>
                    <Space>
                      <Tag color="blue">匹配度: {demand.matchingScore}%</Tag>
                      <Text type="secondary">
                        预算：￥{demand.budget}
                      </Text>
                    </Space>
                  </Space>
                  
                  <Paragraph ellipsis={{ rows: 2 }}>
                    {demand.description}
                  </Paragraph>

                  {demand.matchingReasons && (
                    <div>
                      <Text strong>匹配理由：</Text>
                      <ul style={{ margin: '8px 0' }}>
                        {demand.matchingReasons.map((reason, index) => (
                          <li key={index}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {demand.skillMatches && demand.skillMatches.length > 0 && (
                    <div>
                      <Text strong>匹配技能：</Text>
                      <div style={{ marginTop: 8 }}>
                        {demand.skillMatches.map((skill, index) => (
                          <Tag key={index} color="green">{skill}</Tag>
                        ))}
                      </div>
                    </div>
                  )}

                  {demand.suggestions && demand.suggestions.length > 0 && (
                    <div>
                      <Text strong>建议：</Text>
                      <ul style={{ margin: '8px 0' }}>
                        {demand.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Space split={<Text type="secondary">·</Text>}>
                    <Text type="secondary">
                      截止日期：{new Date(demand.deadline).toLocaleDateString()}
                    </Text>
                    <Text type="secondary">
                      {categories.find(c => c.value === demand.category)?.label}
                    </Text>
                  </Space>
                </Space>
              </DemandCard>
            )}
          />
        </Space>
      </RecommendationModal>
    </Container>
  );
};

export default DemandList; 