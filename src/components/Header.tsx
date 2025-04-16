import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Button } from 'antd';
import { useAuth } from '../hooks/useAuth';

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const menuItems = [
    { key: 'home', label: '首页', onClick: () => navigate('/') },
    { key: 'demands', label: '需求列表', onClick: () => navigate('/demands') },
    { key: 'resources', label: '资源列表', onClick: () => navigate('/resources') },
    user ? { key: 'create-demand', label: '发布需求', onClick: () => navigate('/demands/create') } : null,
    user ? { key: 'create-resource', label: '发布资源', onClick: () => navigate('/resources/create') } : null,
  ].filter(Boolean);

  const userMenuItems = user ? [
    { key: 'profile', label: '个人中心', onClick: () => navigate('/profile') },
    { key: 'logout', label: '退出登录', onClick: signOut },
  ] : [
    { key: 'login', label: '登录', onClick: () => navigate('/login') },
    { key: 'register', label: '注册', onClick: () => navigate('/register') },
  ];

  return (
    <AntHeader style={{ background: '#fff', padding: '0 50px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="logo" style={{ width: 150, float: 'left' }}>
          供需对接平台
        </div>
        <Menu
          mode="horizontal"
          items={menuItems}
          style={{ flex: 1, minWidth: 0 }}
        />
        <Menu
          mode="horizontal"
          items={userMenuItems}
          style={{ minWidth: 150 }}
        />
      </div>
    </AntHeader>
  );
};

export default Header; 