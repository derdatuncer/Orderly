import { Layout, Button } from 'antd';
import { useNavigate, Outlet } from 'react-router-dom';
import { LogoutOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;

const WaiterLayout = () => {
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header
        style={{
          padding: '0 24px',
          background: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 500, color: '#262626' }}>
          Orderly
        </h2>
        <Button
          type="default"
          danger
          size="large"
          icon={<LogoutOutlined style={{ fontSize: 18 }} />}
          onClick={() => navigate('/login')}
          style={{
            fontSize: 16,
            fontWeight: 500,
            padding: '8px 20px',
            height: 'auto',
          }}
        >
          Çıkış
        </Button>
      </Header>
      <Content
        style={{
          margin: '24px 16px',
          padding: 24,
          minHeight: 280,
          background: '#ffffff',
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  );
};

export default WaiterLayout;
