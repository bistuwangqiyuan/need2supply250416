import React from 'react';
import { Typography, Card, Row, Col, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <Row gutter={[24, 24]} className="mt-20">
        <Col span={24}>
          <Typography className="text-center">
            <Title level={1}>供需双方需求对接平台</Title>
            <Paragraph>
              高效、便捷的需求发布与对接平台，助力供需双方快速达成合作
            </Paragraph>
          </Typography>
        </Col>
      </Row>

      <Row gutter={[24, 24]} className="mt-20">
        <Col xs={24} sm={8}>
          <Card title="发布需求" bordered={false}>
            <Paragraph>
              快速发布您的需求，让更多合作伙伴了解您的项目
            </Paragraph>
            <Button type="primary" onClick={() => navigate('/demands/create')} block>
              立即发布
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card title="浏览需求" bordered={false}>
            <Paragraph>
              浏览最新的需求信息，寻找合适的合作机会
            </Paragraph>
            <Button type="primary" onClick={() => navigate('/demands')} block>
              查看需求
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card title="智能匹配" bordered={false}>
            <Paragraph>
              基于AI技术的智能需求分析和匹配推荐
            </Paragraph>
            <Button type="primary" onClick={() => navigate('/demands')} block>
              开始匹配
            </Button>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} className="mt-20">
        <Col span={24}>
          <Card title="平台优势" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card type="inner" title="高效对接">
                  快速精准的需求匹配，节省沟通成本
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card type="inner" title="智能分析">
                  AI驱动的需求分析，提供专业建议
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card type="inner" title="安全可靠">
                  完善的用户认证和信息保护机制
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card type="inner" title="全程跟踪">
                  需求对接全过程监控和管理
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home; 