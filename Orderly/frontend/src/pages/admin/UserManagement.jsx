import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  App,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../../services/api';

const { Option } = Select;

const UserManagement = () => {
  const { message } = App.useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      message.error("Kullanıcılar yüklenirken bir hata oluştu");
      console.error("Users load error:",error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      role: user.role,
      password: '', // Şifre boş bırakılır, değiştirilmek istenirse girilir
    });
    setModalVisible(true);
  };

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId);
      loadUsers();
    } catch (error) {
      message.error("Kullanıcı silinirken bir hata oluştu");
      console.error("User delete error:",error);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await updateUser(
          editingUser.userId,
          values.username,
          values.password || undefined,
          values.role
        );
      } else {
        if (!values.password) {
          return;
        }
        await createUser(values.username, values.password, values.role);
      }
      setModalVisible(false);
      loadUsers();
    } catch (error) {
      message.error("Kullanıcı kaydedilirken bir hata oluştu");
      console.error("User save error:",error);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';
    const date = new Date(dateTime);
    date.setHours(date.getHours() + 3); // UTC+3 (Türkiye saati)
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleLabel = (role) => {
    const roleLabels = {
      admin: 'Yönetici',
      waiter: 'Garson',
      kitchen: 'Mutfak',
    };
    return roleLabels[role] || role;
  };

  const getRoleColor = (role) => {
    const roleColors = {
      admin: '#ff4d4f',
      waiter: '#1890ff',
      kitchen: '#52c41a',
    };
    return roleColors[role] || '#999';
  };

  const columns = [
    {
      title: 'Kullanıcı Adı',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      render: (role) => (
        <span style={{ color: getRoleColor(role), fontWeight: 'bold' }}>
          {getRoleLabel(role)}
        </span>
      ),
    },
    {
      title: 'Oluşturulma Tarihi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (dateTime) => formatDateTime(dateTime),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Düzenle
          </Button>
          <Popconfirm
            title="Bu kullanıcıyı silmek istediğinize emin misiniz?"
            onConfirm={() => handleDelete(record.userId)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Sil
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Kullanıcı Yönetimi</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Kullanıcı Ekle
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="userId"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} kullanıcı`,
          }}
        />
      </Card>

      {/* Kullanıcı Modal */}
      <Modal
        title={editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        okText="Kaydet"
        cancelText="İptal"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="Kullanıcı Adı"
            rules={[
              { required: true, message: 'Kullanıcı adı gerekli' },
              { max: 100, message: 'Kullanıcı adı en fazla 100 karakter olabilir' },
            ]}
          >
            <Input placeholder="Örn: admin" prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item
            name="password"
            label={editingUser ? 'Yeni Şifre (Değiştirmek istemiyorsanız boş bırakın)' : 'Şifre'}
            rules={editingUser ? [] : [
              { required: true, message: 'Şifre gerekli' },
              { min: 3, message: 'Şifre en az 3 karakter olmalı' },
            ]}
          >
            <Input.Password placeholder="Şifre giriniz" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Rol"
            rules={[{ required: true, message: 'Rol seçiniz' }]}
          >
            <Select placeholder="Rol seçiniz">
              <Option value="admin">Yönetici</Option>
              <Option value="waiter">Garson</Option>
              <Option value="kitchen">Mutfak</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
