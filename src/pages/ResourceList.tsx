import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Tag, Space, Select, Input, Button, Typography, Badge } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { supabase } from '../config/supabase';
import styled from 'styled-components';

const { Title, Text } = Typography;

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

const ResourceCard = styled(Card)`
  margin-bottom: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  price_type: string;
  price: number | null;
  availability: string;
  skills: string[];
  experience_years: number;
  portfolio_links: string[];
  contact: string;
  status: string;
  created_at: string;
}

const categories = [
  { label: '全部类别', value: '' },
  { label: '技术开发', value: 'development' },
  { label: '设计创意', value: 'design' },
  { label: '市场营销', value: 'marketing' },
  { label: '运营服务', value: 'operation' },
  { label: '其他服务', value: 'others' },
];

const availabilityOptions = [
  { label: '全部状态', value: '' },
  { label: '随时可用', value: 'available' },
  { label: '部分时间可用', value: 'busy' },
  { label: '暂时不可用', value: 'unavailable' },
];

const ResourceList: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [availability, setAvailability] = useState('');
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  const fetchResources = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('resources')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }
      if (availability) {
        query = query.eq('availability', availability);
      }
      if (searchText) {
        query = query.or(`title.ilike.%${searchText}%,description.ilike.%${searchText}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('获取资源列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [category, availability, searchText]);

  const getAvailabilityBadge = (availability: string) => {
    const colors: Record<string, "success" | "warning" | "error"> = {
      available: 'success',
      busy: 'warning',
      unavailable: 'error',
    };
    const texts = {
      available: '随时可用',
      busy: '部分时间可用',
      unavailable: '暂时不可用',
    };
    return <Badge status={colors[availability]} text={texts[availability as keyof typeof texts]} />;
  };

  const formatPrice = (price: number | null, price_type: string) => {
    if (price_type === 'negotiable') return '面议';
    if (price_type === 'hourly') return `￥${price}/小时`;
    return `￥${price}`;
  };

  return (
    <Container>
      <Title level={2}>资源列表</Title>
      
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
            <Select
              style={{ width: 200 }}
              placeholder="可用状态"
              options={availabilityOptions}
              value={availability}
              onChange={setAvailability}
            />
            <Input
              style={{ width: 300 }}
              placeholder="搜索资源标题或描述"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Space>
          <Button type="primary" onClick={() => navigate('/resources/create')}>
            发布资源
          </Button>
        </Space>
      </FilterContainer>

      <List
        loading={loading}
        dataSource={resources}
        renderItem={(resource) => (
          <ResourceCard onClick={() => navigate(`/resources/${resource.id}`)}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                <Title level={4} style={{ margin: 0 }}>{resource.title}</Title>
                <Text type="secondary">
                  {formatPrice(resource.price, resource.price_type)}
                </Text>
              </Space>
              
              <Space>
                {getAvailabilityBadge(resource.availability)}
                <Text type="secondary">·</Text>
                <Text>{resource.experience_years} 年经验</Text>
              </Space>

              <Text>{resource.description}</Text>

              <Space wrap>
                {resource.skills.map((skill) => (
                  <Tag key={skill}>{skill}</Tag>
                ))}
              </Space>

              <Space split={<Text type="secondary">·</Text>}>
                <Text type="secondary">
                  {new Date(resource.created_at).toLocaleDateString()}
                </Text>
                <Text type="secondary">
                  {categories.find(c => c.value === resource.category)?.label}
                </Text>
              </Space>
            </Space>
          </ResourceCard>
        )}
      />
    </Container>
  );
};

export default ResourceList; 