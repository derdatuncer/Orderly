import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import trTR from 'antd/locale/tr_TR';
import AdminLayout from './layouts/AdminLayout';
import WaiterLayout from './layouts/WaiterLayout';
import KitchenLayout from './layouts/KitchenLayout';
import Login from './pages/Login';
import Tables from './pages/admin/Tables';
import Tickets from './pages/admin/Tickets';
import Reports from './pages/admin/Reports';
import MenuManagement from './pages/admin/MenuManagement';
import UserManagement from './pages/admin/UserManagement';
import KitchenTickets from './pages/kitchen/KitchenTickets';
import KitchenReady from './pages/kitchen/KitchenReady';
import './App.css';

function App() {
  return (
    <ConfigProvider 
      locale={trTR}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          colorBgContainer: '#ffffff',
          colorText: '#262626',
          colorBorder: '#d9d9d9',
          borderRadius: 6,
        },
        components: {
          Menu: {
            itemSelectedBg: '#e6f7ff',
            itemSelectedColor: '#1890ff',
            itemHoverBg: '#f5f5f5',
            itemHoverColor: '#262626',
            itemActiveBg: '#e6f7ff',
          },
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/tables" replace />} />
            <Route path="tables" element={<Tables />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="reports" element={<Reports />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="users" element={<UserManagement />} />
          </Route>
          <Route path="/waiter" element={<WaiterLayout />}>
            <Route index element={<Navigate to="/waiter/tables" replace />} />
            <Route path="tables" element={<Tables />} />
          </Route>
          <Route path="/kitchen" element={<KitchenLayout />}>
            <Route index element={<Navigate to="/kitchen/tickets" replace />} />
            <Route path="tickets" element={<KitchenTickets />} />
            <Route path="ready" element={<KitchenReady />} />
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}

export default App
