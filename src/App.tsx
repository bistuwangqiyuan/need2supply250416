import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DemandList from './pages/DemandList';
import DemandCreate from './pages/DemandCreate';
import DemandDetail from './pages/DemandDetail';
import ResourceList from './pages/ResourceList';
import ResourceCreate from './pages/ResourceCreate';
import ResourceDetail from './pages/ResourceDetail';
import UserProfile from './pages/UserProfile';
import './styles/App.css';

const { Content, Footer } = Layout;

function App() {
  return (
    <Router>
      <Layout className="layout">
        <Header />
        <Content className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/demands" element={<DemandList />} />
            <Route path="/demands/create" element={<DemandCreate />} />
            <Route path="/demands/:id" element={<DemandDetail />} />
            <Route path="/resources" element={<ResourceList />} />
            <Route path="/resources/create" element={<ResourceCreate />} />
            <Route path="/resources/:id" element={<ResourceDetail />} />
            <Route path="/profile" element={<UserProfile />} />
          </Routes>
        </Content>
        <Footer className="footer">
          供需双方需求对接平台 ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Router>
  );
}

export default App; 