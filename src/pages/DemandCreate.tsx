import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Select, InputNumber, DatePicker, Button, Card, message, Spin, Alert } from 'antd';
import { supabase } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import styled from 'styled-components';
import dayjs from 'dayjs';
import type { SelectProps } from 'antd/es/select';
import { FormInstance } from 'antd/es/form';
import { Dayjs } from 'dayjs';

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

interface Category {
  label: string;
  value: string;
}

interface DemandFormData {
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: Dayjs;
  contact: string;
}

interface AnalysisResult {
  complexity: string;
  estimatedDuration: string;
  suggestedPrice: string;
  recommendations: string[];
}

const categories: Category[] = [
  { label: '网站开发', value: '网站开发' },
  { label: '移动应用', value: '移动应用' },
  { label: '小程序开发', value: '小程序开发' },
  { label: 'UI/UX设计', value: 'UI/UX设计' },
  { label: '数据分析', value: '数据分析' },
  { label: '人工智能', value: '人工智能' },
  { label: '其他', value: '其他' }
];

const DemandCreate = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form] = Form.useForm<DemandFormData>();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeDemand = async (values: DemandFormData) => {
    setAnalyzing(true);
    try {
      const response = await axios.post(
        'https://api.deepseek.com/v1/analyze',
        {
          title: values.title,
          description: values.description,
          category: values.category,
          budget: values.budget
        },
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
          }
        }
      );

      setAnalysis(response.data);
    } catch (error) {
      message.error('需求分析失败，请稍后重试');
      console.error('Analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const onFinish = async (values: DemandFormData) => {
    if (!user) {
      message.error('请先登录');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      
      // 调用AI进行需求分析
      await analyzeDemand(values);

      // 保存需求到Supabase
      const { error } = await supabase
        .from('demands')
        .insert([
          {
            user_id: user.id,
            title: values.title,
            description: values.description,
            category: values.category,
            budget: values.budget,
            deadline: values.deadline.toISOString(),
            contact: values.contact,
            analysis: analysis
          },
        ]);

      if (error) throw error;

      message.success('需求发布成功');
      navigate('/demands');
    } catch (error: any) {
      console.error('发布失败:', error);
      message.error(error.message || '发布失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <StyledCard title="发布需求" bordered={false}>
        <Form
          form={form}
          name="demand"
          onFinish={onFinish}
          layout="vertical"
          initialValues={{ category: '其他' }}
        >
          <Form.Item
            label="需求标题"
            name="title"
            rules={[{ required: true, message: '请输入需求标题' }]}
          >
            <Input placeholder="请输入需求标题" />
          </Form.Item>

          <Form.Item
            label="需求描述"
            name="description"
            rules={[{ required: true, message: '请输入需求描述' }]}
          >
            <TextArea rows={6} placeholder="请详细描述您的需求" />
          </Form.Item>

          <Form.Item
            name="category"
            label="需求类别"
            rules={[{ required: true, message: '请选择需求类别' }]}
          >
            <Select
              placeholder="选择需求类别"
              options={categories}
            />
          </Form.Item>

          <Form.Item
            label="预算范围"
            name="budget"
            rules={[{ required: true, message: '请输入预算金额' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="请输入预算金额（元）"
            />
          </Form.Item>

          <Form.Item
            label="截止日期"
            name="deadline"
            rules={[{ required: true, message: '请选择截止日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="联系方式"
            name="contact"
            rules={[{ required: true, message: '请输入联系方式' }]}
          >
            <Input placeholder="请输入您的联系方式（手机号/邮箱）" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              onClick={() => {
                form.validateFields().then(values => {
                  analyzeDemand(values);
                });
              }}
              loading={analyzing}
              style={{ marginRight: 16 }}
            >
              分析需求
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              发布需求
            </Button>
          </Form.Item>
        </Form>

        {analysis && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">需求分析结果</h3>
            <p><strong>复杂度：</strong> {analysis.complexity}</p>
            <p><strong>预计工期：</strong> {analysis.estimatedDuration}</p>
            <p><strong>建议价格：</strong> {analysis.suggestedPrice}</p>
            <div className="mt-2">
              <strong>建议：</strong>
              <ul className="list-disc pl-5">
                {analysis.recommendations.map((rec: string, index: number) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </StyledCard>
    </Container>
  );
};

export default DemandCreate; 