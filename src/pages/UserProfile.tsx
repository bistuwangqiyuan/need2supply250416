import React, { useEffect, useState } from 'react';
import { Card, Tabs, List, Tag, Button, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';

interface Demand {
  id: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
}

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myDemands, setMyDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMyDemands();
  }, [user]);

  const fetchMyDemands = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('demands')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyDemands(data || []);
    } catch (error) {
      console.error('Error fetching demands:', error);
      message.error('获取需求列表失败');
    } finally {
      setLoading(false);
    }
  };

  const categoryMap = {
    development: '技术开发',
    design: '设计创意',
    marketing: '市场营销',
    operation: '运营服务',
    others: '其他服务',
  };

  const items = [
    {
      key: '1',
      label: '我的需求',
      children: (
        <List
          loading={loading}
          itemLayout="horizontal"
          dataSource={myDemands}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="link" onClick={() => navigate(`/demands/${item.id}`)}>
                  查看详情
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={item.title}
                description={
                  <Space>
                    <Tag color="blue">
                      {categoryMap[item.category as keyof typeof categoryMap]}
                    </Tag>
                    <Tag color={item.status === 'open' ? 'green' : 'red'}>
                      {item.status === 'open' ? '进行中' : '已结束'}
                    </Tag>
                    <span>发布时间：{new Date(item.created_at).toLocaleString()}</span>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      ),
    },
    {
      key: '2',
      label: '账户设置',
      children: (
        <Card>
          <p>邮箱：{user?.email}</p>
          <Button type="primary" danger onClick={() => supabase.auth.signOut()}>
            退出登录
          </Button>
        </Card>
      ),
    },
  ];

  return (
    <div className="container">
      <Card title="个人中心" bordered={false}>
        <Tabs items={items} />
      </Card>
    </div>
  );
};

export default UserProfile; 