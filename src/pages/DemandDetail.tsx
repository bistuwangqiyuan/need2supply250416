import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Tag, Space, Button, Descriptions, message } from 'antd';
import { supabase } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';

const { Title, Paragraph } = Typography;

interface Demand {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: string;
  contact: string;
  status: string;
  user_id: string;
  created_at: string;
}

const categoryMap = {
  development: '技术开发',
  design: '设计创意',
  marketing: '市场营销',
  operation: '运营服务',
  others: '其他服务',
};

const DemandDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [demand, setDemand] = useState<Demand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDemand();
  }, [id]);

  const fetchDemand = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('demands')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setDemand(data);
    } catch (error) {
      console.error('Error fetching demand:', error);
      message.error('获取需求详情失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!demand) {
    return <div>需求不存在</div>;
  }

  const isOwner = user?.id === demand.user_id;

  return (
    <div className="container">
      <Card loading={loading}>
        <div className="page-header">
          <Space align="center" style={{ marginBottom: 16 }}>
            <Title level={2}>{demand.title}</Title>
            <Tag color="blue">{categoryMap[demand.category as keyof typeof categoryMap]}</Tag>
          </Space>
        </div>

        <Descriptions bordered column={2}>
          <Descriptions.Item label="预算金额">¥{demand.budget}</Descriptions.Item>
          <Descriptions.Item label="截止日期">
            {new Date(demand.deadline).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="发布时间">
            {new Date(demand.created_at).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="当前状态">
            <Tag color={demand.status === 'open' ? 'green' : 'red'}>
              {demand.status === 'open' ? '进行中' : '已结束'}
            </Tag>
          </Descriptions.Item>
          {(isOwner || user?.id) && (
            <Descriptions.Item label="联系方式" span={2}>
              {demand.contact}
            </Descriptions.Item>
          )}
        </Descriptions>

        <Card title="需求描述" style={{ marginTop: 24 }}>
          <Paragraph>{demand.description}</Paragraph>
        </Card>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          {isOwner ? (
            <Space>
              <Button type="primary" onClick={() => navigate(`/demands/${id}/edit`)}>
                编辑需求
              </Button>
              <Button danger>关闭需求</Button>
            </Space>
          ) : (
            <Button type="primary" onClick={() => navigate(`/demands/${id}/apply`)}>
              申请对接
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DemandDetail; 