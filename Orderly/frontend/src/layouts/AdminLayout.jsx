import { useState } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  TableOutlined,
  FileTextOutlined,
  BarChartOutlined,
  AppstoreOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/admin/tables',
      icon: <TableOutlined />,
      label: 'Masalar',
    },
    {
      key: '/admin/tickets',
      icon: <FileTextOutlined />,
      label: 'Adisyonlar',
    },
    {
      key: '/admin/reports',
      icon: <BarChartOutlined />,
      label: 'Raporlar',
    },
    {
      key: '/admin/menu',
      icon: <AppstoreOutlined />,
      label: 'Menü Yönetimi',
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Kullanıcı Yönetimi',
    },
    {
      type: 'divider',
    },
    {
      key: '/logout',
      icon: <LogoutOutlined />,
      label: 'Çıkış',
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === '/logout') {
      return;
    }
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={250}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: '#ffffff',
          boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
        }}
      >
        <div
          style={{
            height: 64,
            margin: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#262626',
            fontSize: collapsed ? 16 : 20,
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            borderBottom: '1px solid #f0f0f0',
            paddingBottom: 16,
          }}
        >
          {collapsed ? 'O' : 'Orderly'}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            background: '#ffffff',
            border: 'none',
          }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'all 0.2s', background: '#f5f5f5' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 500, color: '#262626' }}>
            Yönetici Paneli
          </h2>
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
    </Layout>
  );
};

export default AdminLayout;

