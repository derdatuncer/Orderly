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
  Divider,
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
  getItemOptions,
  createItemOption,
  updateItemOption,
  deleteItemOption,
  createOptionValue,
  updateOptionValue,
  deleteOptionValue,
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
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [itemOptions, setItemOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [form] = Form.useForm();
  const [itemForm] = Form.useForm();
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionValues, setNewOptionValues] = useState([{ name: '', price: 0 }]);

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

  const handleManageOptions = async (itemId) => {
    setSelectedItemId(itemId);
    setOptionsModalVisible(true);
    await loadItemOptions(itemId);
  };

  const loadItemOptions = async (itemId) => {
    setLoadingOptions(true);
    try {
      const options = await getItemOptions(itemId);
      setItemOptions(options);
    } catch (error) {
      message.error("Opsiyonlar yüklenirken bir hata oluştu");
      console.error("Options load error:", error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleAddOption = async () => {
    if (!newOptionName.trim()) {
      message.error("Opsiyon adı gerekli");
      return;
    }
    if (newOptionValues.length === 0 || newOptionValues.every(v => !v.name.trim())) {
      message.error("En az bir değer eklemelisiniz");
      return;
    }
    try {
      // Önce opsiyonu oluştur
      const optionResult = await createItemOption(selectedItemId, newOptionName.trim(), 'select', 0, true);
      const optionId = optionResult.optionId;
      
      // Sonra değerleri ekle
      for (const value of newOptionValues) {
        if (value.name.trim()) {
          await createOptionValue(optionId, value.name.trim(), value.price || 0, 0, true);
        }
      }
      
      setNewOptionName('');
      setNewOptionValues([{ name: '', price: 0 }]);
      await loadItemOptions(selectedItemId);
      message.success("Opsiyon ve değerler eklendi");
    } catch (error) {
      message.error("Opsiyon eklenirken bir hata oluştu");
      console.error("Option add error:", error);
    }
  };

  const handleAddValueRow = () => {
    setNewOptionValues([...newOptionValues, { name: '', price: 0 }]);
  };

  const handleRemoveValueRow = (index) => {
    const newValues = newOptionValues.filter((_, i) => i !== index);
    if (newValues.length === 0) {
      setNewOptionValues([{ name: '', price: 0 }]);
    } else {
      setNewOptionValues(newValues);
    }
  };

  const handleUpdateValue = (index, field, value) => {
    const newValues = [...newOptionValues];
    newValues[index][field] = value;
    setNewOptionValues(newValues);
  };

  const handleDeleteOption = async (optionId) => {
    try {
      await deleteItemOption(optionId);
      await loadItemOptions(selectedItemId);
      message.success("Opsiyon silindi");
    } catch (error) {
      message.error("Opsiyon silinirken bir hata oluştu");
      console.error("Option delete error:", error);
    }
  };


  const handleDeleteOptionValue = async (valueId) => {
    try {
      await deleteOptionValue(valueId);
      await loadItemOptions(selectedItemId);
      message.success("Değer silindi");
    } catch (error) {
      message.error("Değer silinirken bir hata oluştu");
      console.error("Option value delete error:", error);
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
                      width: 300,
                      render: (_, record) => (
                        <Space>
                          <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => handleEditItem(record, category.categoryId)}
                          >
                            Düzenle
                          </Button>
                          <Button
                            type="link"
                            onClick={() => handleManageOptions(record.itemId)}
                          >
                            Opsiyonlar
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

      {/* Opsiyonlar Modal */}
      <Modal
        title="Ürün Opsiyonları"
        open={optionsModalVisible}
        onCancel={() => {
          setOptionsModalVisible(false);
          setNewOptionName('');
          setNewOptionValues([{ name: '', price: 0 }]);
        }}
        footer={[
          <Button key="close" onClick={() => setOptionsModalVisible(false)}>
            Kapat
          </Button>,
        ]}
        width={700}
      >
        {loadingOptions ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>Yükleniyor...</div>
        ) : (
          <div>
            {/* Yeni Opsiyon Ekleme */}
            <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f5f5f5' }}>
              <div style={{ marginBottom: 12, fontWeight: 'bold' }}>Yeni Opsiyon Ekle</div>
              <Space style={{ width: '100%' }} direction="vertical" size="middle">
                <Input
                  placeholder="Opsiyon adı (örn: Boyut)"
                  value={newOptionName}
                  onChange={(e) => setNewOptionName(e.target.value)}
                  style={{ width: '100%' }}
                />
                <div>
                  <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>Değerler:</div>
                  {newOptionValues.map((value, index) => (
                    <Space key={index} style={{ width: '100%', marginBottom: 8 }}>
                      <Input
                        placeholder="Değer adı (örn: Küçük)"
                        value={value.name}
                        onChange={(e) => handleUpdateValue(index, 'name', e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <InputNumber
                        placeholder="Fiyat"
                        value={value.price}
                        onChange={(val) => handleUpdateValue(index, 'price', val || 0)}
                        step={0.01}
                        precision={2}
                        style={{ width: 120 }}
                      />
                      {newOptionValues.length > 1 && (
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveValueRow(index)}
                        />
                      )}
                    </Space>
                  ))}
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={handleAddValueRow}
                    style={{ marginTop: 8 }}
                  >
                    Değer Ekle
                  </Button>
                </div>
                <Button type="primary" block onClick={handleAddOption}>
                  Opsiyonu Ekle
                </Button>
              </Space>
            </Card>

            {/* Mevcut Opsiyonlar */}
            {itemOptions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                Henüz opsiyon yok. Yukarıdan yeni opsiyon ekleyin.
              </div>
            ) : (
              itemOptions.map((option) => (
                <Card
                  key={option.optionId}
                  size="small"
                  style={{ marginBottom: 12 }}
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{option.optionName}</span>
                      <Popconfirm
                        title="Bu opsiyonu silmek istediğinize emin misiniz?"
                        onConfirm={() => handleDeleteOption(option.optionId)}
                        okText="Evet"
                        cancelText="Hayır"
                      >
                        <Button type="text" size="small" danger icon={<DeleteOutlined />}>
                          Sil
                        </Button>
                      </Popconfirm>
                    </div>
                  }
                >
                  {/* Mevcut Değerler */}
                  {option.values && option.values.length > 0 ? (
                    <div>
                      {option.values.map((val) => (
                        <div
                          key={val.optionValueId}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            marginBottom: 4,
                            backgroundColor: '#fafafa',
                            borderRadius: 4,
                          }}
                        >
                          <span>
                            {val.valueName}
                            {val.priceModifier !== 0 && (
                              <span style={{ marginLeft: 8, color: val.priceModifier > 0 ? '#ff4d4f' : '#52c41a' }}>
                                ({val.priceModifier > 0 ? '+' : ''}{val.priceModifier.toFixed(2)} ₺)
                              </span>
                            )}
                          </span>
                          <Popconfirm
                            title="Bu değeri silmek istediğinize emin misiniz?"
                            onConfirm={() => handleDeleteOptionValue(val.optionValueId)}
                            okText="Evet"
                            cancelText="Hayır"
                          >
                            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                          </Popconfirm>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#999', fontSize: 12, textAlign: 'center', padding: '8px 0' }}>
                      Henüz değer yok
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}
      </Modal>

    </div>
  );
};

export default MenuManagement;
