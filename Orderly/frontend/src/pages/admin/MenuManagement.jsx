import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  App,
  Popconfirm,
  Collapse,
  Select,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createItem,
  updateItem,
  deleteItem,
  getMenu,
} from '../../services/api';

const { Panel } = Collapse;

const MenuManagement = () => {
  const { message } = App.useApp();
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [itemForm] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const menuData = await getMenu();
      setMenu(menuData);
    } catch (error) {
      message.error("Menü yüklenirken bir hata oluştu");
      console.error("Menu load error:",error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    form.resetFields();
    setCategoryModalVisible(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      categoryName: category.categoryName,
      sortOrder: category.sortOrder,
    });
    setCategoryModalVisible(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      loadData();
    } catch (error) {
      message.error("Kategori silinirken bir hata oluştu");
      console.error("Category delete error:",error);
    }
  };

  const handleCategoryModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingCategory) {
        await updateCategory(
          editingCategory.categoryId,
          values.categoryName,
          values.sortOrder
        );
      } else {
        await createCategory(values.categoryName, values.sortOrder || 0);
      }
      setCategoryModalVisible(false);
      loadData();
    } catch (error) {
      message.error("Kategori kaydedilirken bir hata oluştu");
      console.error("Category save error:",error);
    }
  };

  const handleAddItem = (categoryId) => {
    setEditingItem(null);
    itemForm.resetFields();
    itemForm.setFieldsValue({ categoryId });
    setItemModalVisible(true);
  };

  const handleEditItem = (item, categoryId) => {
    setEditingItem(item);
    itemForm.setFieldsValue({
      categoryId: categoryId,
      itemName: item.itemName,
      price: item.price,
    });
    setItemModalVisible(true);
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteItem(itemId);
      loadData();
    } catch (error) {
      message.error("Ürün silinirken bir hata oluştu");
      console.error("Item delete error:",error);
    }
  };

  const handleItemModalOk = async () => {
    try {
      const values = await itemForm.validateFields();
      if (editingItem) {
        await updateItem(
          editingItem.itemId,
          values.categoryId,
          values.itemName,
          values.price
        );
      } else {
        await createItem(
          values.categoryId,
          values.itemName,
          values.price
        );
      }
      setItemModalVisible(false);
      loadData();
    } catch (error) {
      // Silent fail
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Menü Yönetimi</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddCategory}
        >
          Kategori Ekle
        </Button>
      </div>

      <Card>
        {menu.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            Henüz kategori yok. Yeni kategori ekleyerek başlayın.
          </div>
        ) : (
          <Collapse>
            {menu.map((category) => (
              <Panel
                header={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span>
                      <ShoppingOutlined style={{ marginRight: 8 }} />
                      {category.categoryName} ({category.items?.length || 0} ürün)
                    </span>
                    <Space onClick={(e) => e.stopPropagation()}>
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditCategory(category)}
                      >
                        Düzenle
                      </Button>
                      <Popconfirm
                        title="Bu kategoriyi silmek istediğinize emin misiniz?"
                        onConfirm={() => handleDeleteCategory(category.categoryId)}
                        okText="Evet"
                        cancelText="Hayır"
                      >
                        <Button type="text" danger icon={<DeleteOutlined />}>
                          Sil
                        </Button>
                      </Popconfirm>
                    </Space>
                  </div>
                }
                key={category.categoryId}
              >
                <div style={{ marginBottom: 16 }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleAddItem(category.categoryId)}
                  >
                    Ürün Ekle
                  </Button>
                </div>
                <Table
                  dataSource={category.items || []}
                  rowKey="itemId"
                  columns={[
                    {
                      title: 'Ürün Adı',
                      dataIndex: 'itemName',
                      key: 'itemName',
                    },
                    {
                      title: 'Fiyat',
                      dataIndex: 'price',
                      key: 'price',
                      width: 120,
                      align: 'right',
                      render: (price) => <strong>{parseFloat(price).toFixed(2)} ₺</strong>,
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
                            onClick={() => handleEditItem(record, category.categoryId)}
                          >
                            Düzenle
                          </Button>
                          <Popconfirm
                            title="Bu ürünü silmek istediğinize emin misiniz?"
                            onConfirm={() => handleDeleteItem(record.itemId)}
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
                  ]}
                  pagination={false}
                  locale={{ emptyText: 'Bu kategoride ürün yok. Ürün eklemek için "Ürün Ekle" butonunu kullanın.' }}
                />
              </Panel>
            ))}
          </Collapse>
        )}
      </Card>

      {/* Kategori Modal */}
      <Modal
        title={editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
        open={categoryModalVisible}
        onOk={handleCategoryModalOk}
        onCancel={() => setCategoryModalVisible(false)}
        okText="Kaydet"
        cancelText="İptal"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="categoryName"
            label="Kategori Adı"
            rules={[
              { required: true, message: 'Kategori adı gerekli' },
              { max: 100, message: 'Kategori adı en fazla 100 karakter olabilir' },
            ]}
          >
            <Input placeholder="Örn: Ana Yemekler" />
          </Form.Item>
          <Form.Item
            name="sortOrder"
            label="Sıralama"
            rules={[{ type: 'number', min: 0, message: 'Sıralama 0 veya pozitif olmalı' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Ürün Modal */}
      <Modal
        title={editingItem ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
        open={itemModalVisible}
        onOk={handleItemModalOk}
        onCancel={() => setItemModalVisible(false)}
        okText="Kaydet"
        cancelText="İptal"
      >
        <Form form={itemForm} layout="vertical">
          <Form.Item
            name="categoryId"
            label="Kategori"
            rules={[{ required: true, message: 'Kategori seçiniz' }]}
          >
            <Select
              placeholder="Kategori seçiniz"
              disabled={!!editingItem}
            >
              {menu.map((cat) => (
                <Select.Option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="itemName"
            label="Ürün Adı"
            rules={[
              { required: true, message: 'Ürün adı gerekli' },
              { max: 120, message: 'Ürün adı en fazla 120 karakter olabilir' },
            ]}
          >
            <Input placeholder="Örn: Izgara Tavuk" />
          </Form.Item>
          <Form.Item
            name="price"
            label="Fiyat (₺)"
            rules={[
              { required: true, message: 'Fiyat gerekli' },
              { type: 'number', min: 0, message: 'Fiyat 0 veya pozitif olmalı' },
            ]}
          >
            <InputNumber
              min={0}
              step={0.01}
              precision={2}
              style={{ width: '100%' }}
              placeholder="0.00"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MenuManagement;
