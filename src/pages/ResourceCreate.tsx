import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Select, InputNumber, Button, Card, message, Space, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { supabase } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';
import styled from 'styled-components';

const { TextArea } = Input;

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const StyledCard = styled(Card)`
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  
  .ant-card-head-title {
    font-size: 1.5rem;
    font-weight: 600;
  }
`;

interface ResourceForm {
  title: string;
  description: string;
  category: string;
  price_type: string;
  price: number;
  availability: string;
  skills: string[];
  experience_years: number;
  portfolio_links: string[];
  contact: string;
}

const categories = [
  { label: '技术开发', value: 'development' },
  { label: '设计创意', value: 'design' },
  { label: '市场营销', value: 'marketing' },
  { label: '运营服务', value: 'operation' },
  { label: '其他服务', value: 'others' },
];

const priceTypes = [
  { label: '固定价格', value: 'fixed' },
  { label: '按小时计费', value: 'hourly' },
  { label: '面议', value: 'negotiable' },
];

const availabilityOptions = [
  { label: '随时可用', value: 'available' },
  { label: '部分时间可用', value: 'busy' },
  { label: '暂时不可用', value: 'unavailable' },
];

const ResourceCreate: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [inputSkill, setInputSkill] = useState('');
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>([]);
  const [inputLink, setInputLink] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form] = Form.useForm();

  const handleSkillInputConfirm = () => {
    if (inputSkill && !skills.includes(inputSkill)) {
      setSkills([...skills, inputSkill]);
      setInputSkill('');
    }
  };

  const handleLinkInputConfirm = () => {
    if (inputLink && !portfolioLinks.includes(inputLink)) {
      setPortfolioLinks([...portfolioLinks, inputLink]);
      setInputLink('');
    }
  };

  const removeSkill = (removedSkill: string) => {
    setSkills(skills.filter(skill => skill !== removedSkill));
  };

  const removeLink = (removedLink: string) => {
    setPortfolioLinks(portfolioLinks.filter(link => link !== removedLink));
  };

  const onFinish = async (values: ResourceForm) => {
    if (!user) {
      message.error('请先登录');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('resources')
        .insert([
          {
            user_id: user.id,
            title: values.title,
            description: values.description,
            category: values.category,
            price_type: values.price_type,
            price: values.price_type === 'negotiable' ? null : values.price,
            availability: values.availability,
            skills: skills,
            experience_years: values.experience_years,
            portfolio_links: portfolioLinks,
            contact: values.contact,
            status: 'active',
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

      message.success('资源发布成功');
      navigate('/resources');
    } catch (error: any) {
      console.error('发布失败:', error);
      message.error(error.message || '发布失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <StyledCard title="发布资源" bordered={false}>
        <Form
          form={form}
          name="resource"
          onFinish={onFinish}
          layout="vertical"
          initialValues={{ category: 'others', price_type: 'negotiable', availability: 'available' }}
        >
          <Form.Item
            label="资源标题"
            name="title"
            rules={[{ required: true, message: '请输入资源标题' }]}
          >
            <Input placeholder="请输入资源标题" />
          </Form.Item>

          <Form.Item
            label="资源描述"
            name="description"
            rules={[{ required: true, message: '请输入资源描述' }]}
          >
            <TextArea rows={6} placeholder="请详细描述您的资源，包括特点、优势等" />
          </Form.Item>

          <Form.Item
            label="资源类别"
            name="category"
            rules={[{ required: true, message: '请选择资源类别' }]}
          >
            <Select options={categories} />
          </Form.Item>

          <Form.Item
            label="价格类型"
            name="price_type"
            rules={[{ required: true, message: '请选择价格类型' }]}
          >
            <Select options={priceTypes} />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.price_type !== currentValues.price_type}
          >
            {({ getFieldValue }) => 
              getFieldValue('price_type') !== 'negotiable' && (
                <Form.Item
                  label="价格"
                  name="price"
                  rules={[{ required: true, message: '请输入价格' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder={`请输入${getFieldValue('price_type') === 'hourly' ? '每小时' : ''}价格（元）`}
                  />
                </Form.Item>
              )
            }
          </Form.Item>

          <Form.Item
            label="可用状态"
            name="availability"
            rules={[{ required: true, message: '请选择可用状态' }]}
          >
            <Select options={availabilityOptions} />
          </Form.Item>

          <Form.Item
            label="技能标签"
            required
            rules={[{ required: true, message: '请至少添加一个技能标签' }]}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space wrap>
                {skills.map((skill) => (
                  <Tag key={skill} closable onClose={() => removeSkill(skill)}>
                    {skill}
                  </Tag>
                ))}
              </Space>
              <Input
                placeholder="输入技能标签后按回车添加"
                value={inputSkill}
                onChange={(e) => setInputSkill(e.target.value)}
                onPressEnter={handleSkillInputConfirm}
                suffix={<PlusOutlined onClick={handleSkillInputConfirm} />}
              />
            </Space>
          </Form.Item>

          <Form.Item
            label="工作经验（年）"
            name="experience_years"
            rules={[{ required: true, message: '请输入工作经验年限' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入工作经验年限" />
          </Form.Item>

          <Form.Item label="作品集链接">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space wrap>
                {portfolioLinks.map((link) => (
                  <Tag key={link} closable onClose={() => removeLink(link)}>
                    {link}
                  </Tag>
                ))}
              </Space>
              <Input
                placeholder="输入作品集链接后按回车添加"
                value={inputLink}
                onChange={(e) => setInputLink(e.target.value)}
                onPressEnter={handleLinkInputConfirm}
                suffix={<PlusOutlined onClick={handleLinkInputConfirm} />}
              />
            </Space>
          </Form.Item>

          <Form.Item
            label="联系方式"
            name="contact"
            rules={[{ required: true, message: '请输入联系方式' }]}
          >
            <Input placeholder="请输入您的联系方式（手机号/邮箱）" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              发布资源
            </Button>
          </Form.Item>
        </Form>
      </StyledCard>
    </Container>
  );
};

export default ResourceCreate; 