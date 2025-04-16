import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Space, Tag, Button, message, Badge, Descriptions, Modal } from 'antd';
import { supabase } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';
import styled from 'styled-components';

const { Title, Text, Link } = Typography;

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const StyledCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

interface Resource {
  id: string;
  user_id: string;
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

const categories = {
  development: '技术开发',
  design: '设计创意',
  marketing: '市场营销',
  operation: '运营服务',
  others: '其他服务',
};

const availabilityStatus = {
  available: { text: '随时可用', status: 'success' },
  busy: { text: '部分时间可用', status: 'warning' },
  unavailable: { text: '暂时不可用', status: 'error' },
};

const priceTypes = {
  fixed: '固定价格',
  hourly: '按小时计费',
  negotiable: '面议',
};

const ResourceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    fetchResource();
  }, [id]);

  const fetchResource = async () => {
    try {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setResource(data);
    } catch (error) {
      console.error('获取资源详情失败:', error);
      message.error('获取资源详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!resource) return;

      const { error } = await supabase
        .from('resources')
        .update({ status: 'deleted' })
        .eq('id', resource.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      message.success('资源已删除');
      navigate('/resources');
    } catch (error) {
      console.error('删除资源失败:', error);
      message.error('删除资源失败');
    }
  };

  const formatPrice = (price: number | null, price_type: string) => {
    if (price_type === 'negotiable') return '面议';
    if (price_type === 'hourly') return `￥${price}/小时`;
    return `￥${price}`;
  };

  if (loading) return null;
  if (!resource) return <Container><Text>资源不存在</Text></Container>;

  const isOwner = user?.id === resource.user_id;

  return (
    <Container>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <StyledCard>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Title level={2} style={{ margin: 0 }}>{resource.title}</Title>
              <Text style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {formatPrice(resource.price, resource.price_type)}
              </Text>
            </Space>

            <Space>
              <Badge 
                status={availabilityStatus[resource.availability as keyof typeof availabilityStatus].status as "success" | "warning" | "error"}
                text={availabilityStatus[resource.availability as keyof typeof availabilityStatus].text}
              />
              <Text type="secondary">·</Text>
              <Text>{resource.experience_years} 年经验</Text>
              <Text type="secondary">·</Text>
              <Text>{categories[resource.category as keyof typeof categories]}</Text>
            </Space>

            <Descriptions column={1}>
              <Descriptions.Item label="资源描述">
                {resource.description}
              </Descriptions.Item>
              <Descriptions.Item label="技能标签">
                <Space wrap>
                  {resource.skills.map((skill) => (
                    <Tag key={skill}>{skill}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              {resource.portfolio_links.length > 0 && (
                <Descriptions.Item label="作品集">
                  <Space direction="vertical">
                    {resource.portfolio_links.map((link, index) => (
                      <Link key={index} href={link} target="_blank">
                        {link}
                      </Link>
                    ))}
                  </Space>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="价格类型">
                {priceTypes[resource.price_type as keyof typeof priceTypes]}
              </Descriptions.Item>
              <Descriptions.Item label="联系方式">
                {resource.contact}
              </Descriptions.Item>
              <Descriptions.Item label="发布时间">
                {new Date(resource.created_at).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            {isOwner && (
              <Space>
                <Button type="primary" onClick={() => navigate(`/resources/edit/${resource.id}`)}>
                  编辑资源
                </Button>
                <Button danger onClick={() => setDeleteModalVisible(true)}>
                  删除资源
                </Button>
              </Space>
            )}
          </Space>
        </StyledCard>
      </Space>

      <Modal
        title="确认删除"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="确认"
        cancelText="取消"
      >
        <p>确定要删除这个资源吗？此操作不可恢复。</p>
      </Modal>
    </Container>
  );
};

export default ResourceDetail; 