import { useState, useEffect } from 'react';
import { Card, Button, Drawer, Input, Select, Table, Space, InputNumber, Modal, App, Collapse } from 'antd';
import { PlusOutlined, PrinterOutlined, CloseOutlined, DeleteOutlined, PercentageOutlined, StopOutlined, EditOutlined } from '@ant-design/icons';
import { getTables, createTable, getTableDetails, deleteTable, openTicket, printTicket, closeTicket, cancelTicket, reopenTicket, addItemToTicket, removeItemFromTicket, getMenu, getItemOptions } from '../../services/api';

const { Option } = Select;
const { Panel } = Collapse;

const Tables = () => {
  const { message, modal } = App.useApp();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableDetails, setTableDetails] = useState(null);
  const [newTableCode, setNewTableCode] = useState('');
  const [menu, setMenu] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState([]); 
  const [closeModalVisible, setCloseModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('tl'); // yüzde veya tl
  const [serviceCharge, setServiceCharge] = useState(0);
  const [serviceChargeType, setServiceChargeType] = useState('tl'); // yüzde veya tl
  const [isAdmin] = useState(true); // Geçici: daha sonra kullabıcı girişi yapılacak
  const [addTableModalVisible, setAddTableModalVisible] = useState(false);
  const [addItemModalVisible, setAddItemModalVisible] = useState(false);
  const [selectedItemForAdd, setSelectedItemForAdd] = useState(null);
  const [itemOptions, setItemOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    loadTables();
    loadMenu();
  }, []);

  const loadTables = async () => {
    setLoading(true);
    try {
      const data = await getTables();
      setTables(data);
    } catch (error) {
      message.error("Masalar yüklenirken bir hata oluştu");
      console.error("Tables load error:",error);
    } finally {
      setLoading(false);
    }
  };

  const loadMenu = async () => {
    try {
      const data = await getMenu();
      setMenu(data);
    } catch (error) {
      // Silent fail
    }
  };

  const loadTableDetails = async (tableId) => {
    try {
      const data = await getTableDetails(tableId);
      setTableDetails(data);
      return data;
    } catch (error) {
      return null;
    }
  };

  const handleTableClick = async (table) => {
    setSelectedTable(table);
    const details = await loadTableDetails(table.tableId);
    // Drawer açılırken indirim ve servis ücreti değerlerini sıfırla
    setDiscount(0);
    setServiceCharge(0);
    setDiscountType('tl');
    setServiceChargeType('tl');
    setDrawerVisible(true);
    // Ticket otomatik açılmaz - kullanıcı ürün eklemek istediğinde açılacak
  };

  const handleAddTable = async () => {
    if (!newTableCode || !newTableCode.trim()) {
      return Promise.resolve(false);
    }
    
    setLoading(true);
    try {
      await createTable(newTableCode.trim());
      setNewTableCode('');
      setAddTableModalVisible(false);
      await loadTables();
      setLoading(false);
      return Promise.resolve(true);
    } catch (error) {
      setLoading(false);
      return Promise.resolve(false);
    }
  };

  const handleDeleteTable = async (tableId, tableCode, e) => {
    if (e) {
      e.stopPropagation(); // Masa tıklama eventini engelle
      e.preventDefault();
    }
    
    modal.confirm({
      title: 'Masa Sil',
      content: `"${tableCode}" masasını silmek istediğinizden emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteTable(tableId);
          await loadTables();
        } catch (error) {
          message.error("Masa silinirken bir hata oluştu");
          console.error("Table delete error:",error);
        }
      },
    });
  };

  const handleQuickAddItem = async (item) => {
    let currentTicketId = tableDetails?.ticket?.ticketId;

    // Eğer aktif ticket yoksa, önce ticket aç
    if (!currentTicketId) {
      try {
        const result = await openTicket(selectedTable.tableId);
        if (result.ticketId) {
          const updatedDetails = await loadTableDetails(selectedTable.tableId);
          currentTicketId = updatedDetails?.ticket?.ticketId;
          if (!currentTicketId) {
            return;
          }
        } else {
          return;
        }
      } catch (error) {
        return;
      }
    }

    try {
      await addItemToTicket(
        currentTicketId,
        item.itemId,
        1,
        item.price,
        null,
        null
      );
      await loadTableDetails(selectedTable.tableId);
      loadTables();
      message.success("Ürün eklendi");
    } catch (error) {
      message.error("Ürün eklendiğinde bir hata oluştu");
      console.error("Item add error:",error);
    }
  };

  const handleAddItemClick = async (item, e) => {
    // Eğer ikona tıklandıysa, event'i durdur ve detaylı ekleme modal'ını aç
    if (e && e.target.closest('.item-edit-icon')) {
      e.stopPropagation();
      setSelectedItemForAdd(item);
      setSelectedOptions({});
      setSpecialInstructions('');
      setAddItemModalVisible(true);
      
      // Ürün opsiyonlarını yükle
      setLoadingOptions(true);
      try {
        const options = await getItemOptions(item.itemId);
        setItemOptions(options);
      } catch (error) {
        console.error("Options load error:", error);
        setItemOptions([]);
      } finally {
        setLoadingOptions(false);
      }
    } else {
      // Normal tıklama = hızlı ekleme
      handleQuickAddItem(item);
    }
  };

  const handleAddItem = async () => {
    if (!selectedItemForAdd) return;

    let currentTicketId = tableDetails?.ticket?.ticketId;

    // Eğer aktif ticket yoksa, önce ticket aç
    if (!currentTicketId) {
      try {
        const result = await openTicket(selectedTable.tableId);
        if (result.ticketId) {
          const updatedDetails = await loadTableDetails(selectedTable.tableId);
          currentTicketId = updatedDetails?.ticket?.ticketId;
          if (!currentTicketId) {
            return;
          }
        } else {
          return;
          }
      } catch (error) {
        return;
      }
    }

    try {
      // Seçilen opsiyonları formatla
      const options = [];
      Object.keys(selectedOptions).forEach(optionId => {
        const optionValue = selectedOptions[optionId];
        if (optionValue !== null && optionValue !== undefined && optionValue !== '') {
          options.push({
            optionId: parseInt(optionId),
            optionValueId: parseInt(optionValue),
          });
        }
      });

      await addItemToTicket(
        currentTicketId,
        selectedItemForAdd.itemId,
        1,
        selectedItemForAdd.price,
        options.length > 0 ? options : null,
        specialInstructions.trim() || null
      );
      setAddItemModalVisible(false);
      setSelectedItemForAdd(null);
      setSelectedOptions({});
      setSpecialInstructions('');
      await loadTableDetails(selectedTable.tableId);
      loadTables();
      message.success("Ürün eklendi");
    } catch (error) {
      message.error("Ürün eklendiğinde bir hata oluştu");
      console.error("Item add error:",error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!isAdmin) {
      return;
    }

    try {
      await removeItemFromTicket(itemId);
      await loadTableDetails(selectedTable.tableId);
      loadTables();
    } catch (error) {
      message.error("Ürün silinirken bir hata oluştu");
      console.error("Item remove error:",error);
    }
  };

  const handlePrint = async () => {
    if (!tableDetails?.ticket) return;

    try {
      await printTicket(tableDetails.ticket.ticketId);
      await loadTableDetails(selectedTable.tableId);
      loadTables();
    } catch (error) {
      message.error("Adisyon yazdırılırken bir hata oluştu");
      console.error("Ticket print error:",error);
    }
  };

  const handleCancelTicket = async () => {
    if (!tableDetails?.ticket) return;

    modal.confirm({
      title: 'Adisyonu İptal Et',
      content: 'Bu adisyonu iptal etmek istediğinizden emin misiniz? Tüm ürünler silinecek ve masa boşalacak.',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await cancelTicket(tableDetails.ticket.ticketId);
          await loadTableDetails(selectedTable.tableId);
          loadTables();
        } catch (error) {
          message.error("Adisyon iptal edilirken bir hata oluştu");
          console.error("Ticket cancel error:",error);
        }
      },
    });
  };

  const handleReopenTicket = async () => {
    if (!tableDetails?.ticket) return;

    modal.confirm({
      title: 'Adisyonu Geri Aç',
      content: 'Bu adisyonu tekrar açmak istediğinizden emin misiniz? Yeni ürün ekleyebileceksiniz.',
      okText: 'Geri Aç',
      okType: 'primary',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await reopenTicket(tableDetails.ticket.ticketId);
          await loadTableDetails(selectedTable.tableId);
          loadTables();
        } catch (error) {
          message.error("Adisyon tekrar açılırken bir hata oluştu");
          console.error("Ticket reopen error:",error);
        }
      },
    });
  };

  const handleCloseTable = async () => {
    if (!tableDetails?.ticket) return;

    try {
      await closeTicket(
        tableDetails.ticket.ticketId,
        paymentMethod,
        calculateDiscount(),
        calculateServiceCharge()
      );
      setCloseModalVisible(false);
      setDrawerVisible(false);
      setDiscount(0);
      setServiceCharge(0);
      loadTables();
    } catch (error) {
      message.error("Adisyon kapatılırken bir hata oluştu");
      console.error("Table close error:",error);
    }
  };

  const getTableColor = (status) => {
    if (status === 'printed') return '#ff4d4f'; // Kırmızı
    if (status === 'open') return '#1890ff'; // Mavi
    return '#f0f0f0'; // Gri
  };

  const getTableTextColor = (status) => {
    if (status === 'closed') return '#595959';
    return '#ffffff';
  };

  const itemColumns = [
    {
      title: 'Ürün',
      dataIndex: 'itemName',
      key: 'itemName',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{text}</div>
          {record.options && record.options.length > 0 && (
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              {record.options.map((opt, idx) => (
                <div key={idx} style={{ marginBottom: 2 }}>
                  <span style={{ fontWeight: 'bold' }}>{opt.optionName}:</span>{' '}
                  {opt.valueName || opt.customText || '-'}
                  {opt.priceModifier !== 0 && (
                    <span style={{ marginLeft: 4, color: opt.priceModifier > 0 ? '#ff4d4f' : '#52c41a' }}>
                      ({opt.priceModifier > 0 ? '+' : ''}{opt.priceModifier.toFixed(2)} ₺)
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          {record.specialInstructions && (
            <div style={{ fontSize: 12, color: '#1890ff', marginTop: 4, fontStyle: 'italic' }}>
              📝 {record.specialInstructions}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
    {
      title: 'Adet',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price) => `${price.toFixed(2)} ₺`,
    },
    {
      title: 'Toplam',
      dataIndex: 'lineTotal',
      key: 'lineTotal',
      render: (total) => `${total.toFixed(2)} ₺`,
    },
    {
      title: 'İşlem',
      key: 'action',
      render: (_, record) => (
        isAdmin && (
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveItem(record.orderItemId)}
          >
            Sil
          </Button>
        )
      ),
    },
  ];

  const calculateTotal = () => {
    if (!tableDetails?.items) return 0;
    return tableDetails.items.reduce((sum, item) => sum + parseFloat(item.lineTotal), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateTotal();
    if (discountType === 'percent') {
      return (subtotal * discount / 100);
    }
    return discount;
  };

  const calculateServiceCharge = () => {
    const subtotal = calculateTotal();
    if (serviceChargeType === 'percent') {
      return (subtotal * serviceCharge / 100);
    }
    return serviceCharge;
  };

  const calculateFinalTotal = () => {
    const subtotal = calculateTotal();
    const discountAmount = calculateDiscount();
    const serviceAmount = calculateServiceCharge();
    return subtotal - discountAmount + serviceAmount;
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Masalar</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {tables.map((table) => (
          <Card
            key={table.tableId}
            hoverable
            onClick={() => handleTableClick(table)}
            style={{
              backgroundColor: getTableColor(table.status),
              color: getTableTextColor(table.status),
              cursor: 'pointer',
              textAlign: 'center',
              minHeight: 120,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
            }}
            styles={{ body: { padding: 16 } }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleDeleteTable(table.tableId, table.tableCode, e);
              }}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: getTableTextColor(table.status),
                opacity: 0.7,
                zIndex: 10,
              }}
            />
            <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
              {table.tableCode}
            </div>
            <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>
              {table.status === 'closed' && 'Boş'}
              {table.status === 'open' && 'Aktif'}
              {table.status === 'printed' && 'Yazdırıldı'}
            </div>
            {table.hasActiveTicket && table.openedAt && (
              <>
                <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>
                  {(() => {
                    const date = new Date(table.openedAt);
                    date.setHours(date.getHours() + 3); // UTC+3 (Türkiye saati)
                    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                  })()}
                </div>
                {table.total > 0 && (
                  <div style={{ fontSize: 13, fontWeight: 'bold', marginTop: 4 }}>
                    {parseFloat(table.total).toFixed(2)} ₺
                  </div>
                )}
              </>
            )}
          </Card>
        ))}
        
        {/* Masa Ekle Kartı */}
        <Card
          hoverable
          onClick={() => {
            setNewTableCode('');
            setAddTableModalVisible(true);
          }}
          style={{
            backgroundColor: '#e6f7ff',
            border: '2px dashed #1890ff',
            textAlign: 'center',
            minHeight: 120,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <PlusOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
          <div style={{ fontSize: 14, color: '#1890ff', fontWeight: 'bold' }}>
            Masa Ekle
          </div>
        </Card>
      </div>

      {/* Masa Detay Drawer */}
      <Drawer
        title={`Masa: ${selectedTable?.tableCode || ''}`}
        placement="right"
        width={600}
        onClose={() => {
          setDrawerVisible(false);
          setTableDetails(null);
          setSelectedTable(null);
          setDiscount(0);
          setServiceCharge(0);
          setDiscountType('tl');
          setServiceChargeType('tl');
        }}
        open={drawerVisible}
      >
        {loading && !tableDetails ? (
          <div style={{ textAlign: 'center', padding: 24 }}>Yükleniyor...</div>
        ) : tableDetails ? (
          <>
            {/* Adisyon Bilgileri */}
            {tableDetails.ticket && (
              <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                <div style={{ marginBottom: 8 }}>
                  <strong>Adisyon Durumu:</strong> {
                    tableDetails.ticket.status === 'open' ? 'Açık' :
                    tableDetails.ticket.status === 'printed' ? 'Yazdırıldı' :
                    'Kapalı'
                  }
                </div>
                <div>
                  <strong>Açılış Zamanı:</strong> {
                    tableDetails.ticket.openedAt 
                      ? (() => {
                          const date = new Date(tableDetails.ticket.openedAt);
                          date.setHours(date.getHours() + 3); // UTC+3 (Türkiye saati)
                          return date.toLocaleString('tr-TR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                        })()
                      : '-'
                  }
                </div>
              </div>
            )}

            {/* Mevcut Ürünler - Liste Halinde */}
            {tableDetails.items && tableDetails.items.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3>Adisyon Ürünleri</h3>
                <Table
                  columns={itemColumns.filter(col => col.key !== 'categoryName')}
                  dataSource={tableDetails.items}
                  rowKey="orderItemId"
                  pagination={false}
                  size="small"
                />
                <div style={{ marginTop: 16, textAlign: 'right', fontSize: 14 }}>
                  <div>Ara Toplam: {calculateTotal().toFixed(2)} ₺</div>
                  {tableDetails.ticket?.status === 'printed' && (
                    <>
                      {(discount > 0 || serviceCharge > 0) && (
                        <>
                          {discount > 0 && (
                            <div style={{ color: '#52c41a' }}>
                              İndirim: -{calculateDiscount().toFixed(2)} ₺
                            </div>
                          )}
                          {serviceCharge > 0 && (
                            <div style={{ color: '#ff4d4f' }}>
                              Servis: +{calculateServiceCharge().toFixed(2)} ₺
                            </div>
                          )}
                          <div style={{ fontSize: 16, fontWeight: 'bold', marginTop: 4, paddingTop: 4, borderTop: '1px solid #d9d9d9' }}>
                            Genel Toplam: {calculateFinalTotal().toFixed(2)} ₺
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Menü Ekleme - Ticket yoksa veya status 'open' ise göster */}
            {(!tableDetails.ticket || tableDetails.ticket?.status === 'open') && (
              <div style={{ marginBottom: 24 }}>
                <h3>Ürün Ekle</h3>
                <Collapse>
                  {menu.map((category) => (
                    <Panel header={`${category.categoryName} (${category.items.length} ürün)`} key={category.categoryId}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                        {category.items.map((item) => (
                          <Card
                            key={item.itemId}
                            hoverable
                            onClick={(e) => handleAddItemClick(item, e)}
                            style={{
                              textAlign: 'center',
                              cursor: 'pointer',
                              border: '1px solid #d9d9d9',
                              position: 'relative',
                            }}
                            bodyStyle={{ padding: 12 }}
                          >
                            <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>
                              {item.itemName}
                            </div>
                            <div style={{ fontSize: 16, color: '#1890ff', fontWeight: 'bold' }}>
                              {item.price.toFixed(2)} ₺
                            </div>
                            <EditOutlined
                              className="item-edit-icon"
                              style={{
                                position: 'absolute',
                                bottom: 8,
                                right: 8,
                                fontSize: 14,
                                color: '#1890ff',
                                cursor: 'pointer',
                                padding: '2px 4px',
                                borderRadius: 4,
                                backgroundColor: 'rgba(24, 144, 255, 0.1)',
                                zIndex: 10,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddItemClick(item, e);
                              }}
                            />
                          </Card>
                        ))}
                      </div>
                    </Panel>
                  ))}
                </Collapse>
              </div>
            )}

            {tableDetails.ticket?.status === 'printed' && (
              <>
                <Button
                  type="default"
                  icon={<PlusOutlined />}
                  block
                  onClick={handleReopenTicket}
                  style={{ marginBottom: 24 }}
                >
                  Adisyonu Geri Aç
                </Button>
              </>
            )}

            {/* İşlem Butonları */}
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {tableDetails.ticket?.status === 'open' && (
                <>
                  <Button
                    type="primary"
                    icon={<PrinterOutlined />}
                    block
                    onClick={handlePrint}
                  >
                    Yazdır
                  </Button>
                  <Button
                    type="default"
                    danger
                    icon={<StopOutlined />}
                    block
                    onClick={handleCancelTicket}
                  >
                    Adisyonu İptal Et
                  </Button>
                </>
              )}
              
              {tableDetails.ticket && tableDetails.ticket.status === 'printed' && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <h4>İndirim</h4>
                    <Space style={{ width: '100%' }} direction="vertical">
                      <Select
                        value={discountType}
                        onChange={setDiscountType}
                        style={{ width: '100%' }}
                      >
                        <Option value="tl">TL Olarak</Option>
                        <Option value="percent">Yüzde Olarak</Option>
                      </Select>
                      <InputNumber
                        min={0}
                        max={discountType === 'percent' ? 100 : calculateTotal()}
                        value={discount || 0}
                        onChange={(value) => setDiscount(value || 0)}
                        style={{ width: '100%' }}
                        addonAfter={discountType === 'percent' ? '%' : '₺'}
                        placeholder={discountType === 'percent' ? 'İndirim yüzdesi' : 'İndirim tutarı'}
                      />
                    </Space>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <h4>Servis Ücreti</h4>
                    <Space style={{ width: '100%' }} direction="vertical">
                      <Select
                        value={serviceChargeType}
                        onChange={setServiceChargeType}
                        style={{ width: '100%' }}
                      >
                        <Option value="tl">TL Olarak</Option>
                        <Option value="percent">Yüzde Olarak</Option>
                      </Select>
                      <InputNumber
                        min={0}
                        value={serviceCharge || 0}
                        onChange={(value) => setServiceCharge(value || 0)}
                        style={{ width: '100%' }}
                        addonAfter={serviceChargeType === 'percent' ? '%' : '₺'}
                        placeholder={serviceChargeType === 'percent' ? 'Servis ücreti yüzdesi' : 'Servis ücreti tutarı'}
                      />
                    </Space>
                  </div>

                  <Select
                    value={paymentMethod}
                    onChange={setPaymentMethod}
                    style={{ width: '100%', marginBottom: 16 }}
                  >
                    <Option value="cash">Nakit</Option>
                    <Option value="credit">Kart</Option>
                  </Select>
                  <Button
                    type="primary"
                    danger
                    icon={<CloseOutlined />}
                    block
                    onClick={() => setCloseModalVisible(true)}
                  >
                    Masa Kapat ({paymentMethod === 'cash' ? 'Nakit' : 'Kart'})
                  </Button>
                </>
              )}
            </Space>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 24 }}>
            Masa bilgileri yüklenemedi
          </div>
        )}
      </Drawer>

      {/* Kapatma Onay Modal */}
      <Modal
        title="Masa Kapat"
        open={closeModalVisible}
        onOk={handleCloseTable}
        onCancel={() => {
          setCloseModalVisible(false);
          setDiscount(0);
          setServiceCharge(0);
        }}
        okText="Kapat"
        cancelText="İptal"
      >
        <p>Bu masayı kapatmak istediğinizden emin misiniz?</p>
        <div style={{ marginTop: 16 }}>
          <p><strong>Ara Toplam:</strong> {calculateTotal().toFixed(2)} ₺</p>
          <p><strong>İndirim:</strong> -{calculateDiscount().toFixed(2)} ₺ 
            {discountType === 'percent' && ` (${discount}%)`}
          </p>
          <p><strong>Servis Ücreti:</strong> +{calculateServiceCharge().toFixed(2)} ₺
            {serviceChargeType === 'percent' && ` (${serviceCharge}%)`}
          </p>
          <p style={{ fontSize: 18, fontWeight: 'bold', marginTop: 8, paddingTop: 8, borderTop: '1px solid #d9d9d9' }}>
            <strong>Genel Toplam:</strong> {calculateFinalTotal().toFixed(2)} ₺
          </p>
          <p style={{ marginTop: 8 }}><strong>Ödeme:</strong> {paymentMethod === 'cash' ? 'Nakit' : 'Kart'}</p>
        </div>
      </Modal>

      {/* Ürün Ekleme Modal */}
      <Modal
        title={selectedItemForAdd ? `Ürün Ekle: ${selectedItemForAdd.itemName}` : 'Ürün Ekle'}
        open={addItemModalVisible}
        onOk={handleAddItem}
        onCancel={() => {
          setAddItemModalVisible(false);
          setSelectedItemForAdd(null);
          setSelectedOptions({});
          setSpecialInstructions('');
        }}
        okText="Ekle"
        cancelText="İptal"
        width={600}
      >
        {selectedItemForAdd && (
          <div>
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
              <div><strong>Ürün:</strong> {selectedItemForAdd.itemName}</div>
              <div><strong>Fiyat:</strong> {selectedItemForAdd.price.toFixed(2)} ₺</div>
            </div>

            {loadingOptions ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>Opsiyonlar yükleniyor...</div>
            ) : itemOptions.length > 0 ? (
              <div style={{ marginBottom: 16 }}>
                <h4>Opsiyonlar</h4>
                {itemOptions
                  .filter(option => option.optionType === 'select' && option.values && option.values.length > 0)
                  .map((option) => (
                    <div key={option.optionId} style={{ marginBottom: 16 }}>
                      <div style={{ marginBottom: 8, fontWeight: 'bold' }}>
                        {option.optionName}
                      </div>
                      <Select
                        style={{ width: '100%' }}
                        placeholder={`${option.optionName} seçiniz`}
                        value={selectedOptions[option.optionId] || undefined}
                        onChange={(value) => {
                          setSelectedOptions({
                            ...selectedOptions,
                            [option.optionId]: value,
                          });
                        }}
                      >
                        {option.values.map((val) => (
                          <Option key={val.optionValueId} value={val.optionValueId}>
                            {val.valueName}
                            {val.priceModifier !== 0 && (
                              <span style={{ marginLeft: 8, color: val.priceModifier > 0 ? '#ff4d4f' : '#52c41a' }}>
                                ({val.priceModifier > 0 ? '+' : ''}{val.priceModifier.toFixed(2)} ₺)
                              </span>
                            )}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  ))}
              </div>
            ) : null}

            <div style={{ marginBottom: 16 }}>
              <h4>Özel Not / Detay</h4>
              <Input.TextArea
                rows={3}
                placeholder="Örn: Domates içinde olmasın, Az pişmiş olsun..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                maxLength={500}
                showCount
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Masa Ekleme Modal */}
      <Modal
        title="Yeni Masa Ekle"
        open={addTableModalVisible}
        onOk={handleAddTable}
        onCancel={() => {
          setAddTableModalVisible(false);
          setNewTableCode('');
        }}
        okText="Ekle"
        cancelText="İptal"
        maskClosable={false}
        okButtonProps={{ loading: loading }}
        destroyOnHidden
      >
        <Input
          placeholder="Masa kodu (örn: X1, Y2, Z3)"
          value={newTableCode}
          onChange={(e) => setNewTableCode(e.target.value)}
          onPressEnter={() => {
            if (newTableCode && newTableCode.trim()) {
              handleAddTable();
            }
          }}
          autoFocus
        />
      </Modal>
    </div>
  );
};

export default Tables;
