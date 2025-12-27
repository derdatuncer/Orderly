import { useState, useEffect } from 'react';
import { Card, Table, Space, DatePicker, Radio, App } from 'antd';
import { getTickets, getTicketItems } from '../../services/api';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

const Tickets = () => {
  const { message } = App.useApp();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ticketStatus, setTicketStatus] = useState('open'); // 'open' veya 'closed'
  const [selectedDate, setSelectedDate] = useState(dayjs()); // Bugün
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [itemsCache, setItemsCache] = useState({}); // ticketId -> items mapping
  const [loadingItems, setLoadingItems] = useState({});

  useEffect(() => {
    loadTickets();
  }, [ticketStatus, selectedDate]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const data = await getTickets(ticketStatus, dateStr);
      setTickets(data);
    } catch (error) {
      message.error("Adisyonlar yüklenirken bir hata oluştu");
      console.error("Tickets load error:",error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';
    const date = new Date(dateTime);
    date.setHours(date.getHours() + 3); 
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExpand = async (expanded, record) => {
    if (expanded) {
      // Satır genişletildiğinde ürünleri yükle
      if (!itemsCache[record.ticketId]) {
        setLoadingItems(prev => ({ ...prev, [record.ticketId]: true }));
        try {
          const items = await getTicketItems(record.ticketId);
          setItemsCache(prev => ({ ...prev, [record.ticketId]: items }));
        } catch (error) {
          message.error("Ürünler yüklenirken bir hata oluştu");
          console.error("Items load error:",error);
        } finally {
          setLoadingItems(prev => ({ ...prev, [record.ticketId]: false }));
        }
      }
      setExpandedRowKeys(prev => [...prev, record.ticketId]);
    } else {
      setExpandedRowKeys(prev => prev.filter(key => key !== record.ticketId));
    }
  };

  const columns = [
    {
      title: 'Adisyon No',
      dataIndex: 'ticketId',
      key: 'ticketId',
      width: 100,
    },
    {
      title: 'Masa',
      dataIndex: 'tableCode',
      key: 'tableCode',
      width: 100,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        if (status === 'open') return <span style={{ color: '#1890ff' }}>Açık</span>;
        if (status === 'printed') return <span style={{ color: '#ff4d4f' }}>Yazdırıldı</span>;
        if (status === 'closed') return <span style={{ color: '#52c41a' }}>Kapalı</span>;
        return status;
      },
    },
    {
      title: 'Açılış Zamanı',
      dataIndex: 'openedAt',
      key: 'openedAt',
      width: 150,
      render: (dateTime) => formatDateTime(dateTime),
    },
    {
      title: 'Kapanış Zamanı',
      dataIndex: 'closedAt',
      key: 'closedAt',
      width: 150,
      render: (dateTime) => formatDateTime(dateTime),
    },
    {
      title: 'Toplam',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      align: 'right',
      render: (total, record) => {
        if (record.status === 'closed' && record.closedTotal != null) {
          return <strong>{parseFloat(record.closedTotal).toFixed(2)} ₺</strong>;
        }
        return <strong>{parseFloat(total).toFixed(2)} ₺</strong>;
      },
    },
    {
      title: 'Ödeme',
      dataIndex: 'closedPaymentMethod',
      key: 'closedPaymentMethod',
      width: 100,
      render: (method) => {
        if (!method) return '-';
        return method === 'cash' ? 'Nakit' : 'Kart';
      },
    },
    {
      title: 'Açan',
      dataIndex: 'openedBy',
      key: 'openedBy',
      width: 120,
    },
    {
      title: 'Kapatan',
      dataIndex: 'closedBy',
      key: 'closedBy',
      width: 120,
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Adisyonlar</h1>

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <strong>Durum:</strong>
            <Radio.Group
              value={ticketStatus}
              onChange={(e) => setTicketStatus(e.target.value)}
              style={{ marginLeft: 16 }}
            >
              <Radio.Button value="open">Açık</Radio.Button>
              <Radio.Button value="closed">Kapalı</Radio.Button>
            </Radio.Group>
          </div>
          <div>
            <strong>Tarih:</strong>
            <DatePicker
              value={selectedDate}
              onChange={(date) => setSelectedDate(date || dayjs())}
              format="DD.MM.YYYY"
              style={{ marginLeft: 16 }}
              allowClear={false}
            />
          </div>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={tickets}
          rowKey="ticketId"
          loading={loading}
          expandedRowKeys={expandedRowKeys}
          onExpand={handleExpand}
          expandable={{
            expandedRowRender: (record) => {
              const items = itemsCache[record.ticketId] || [];
              const isLoading = loadingItems[record.ticketId];

              if (isLoading) {
                return <div style={{ padding: '16px', textAlign: 'center' }}>Yükleniyor...</div>;
              }

              if (items.length === 0) {
                return <div style={{ padding: '16px', color: '#999' }}>Bu adisyonda ürün bulunmamaktadır.</div>;
              }

              return (
                <Table
                  dataSource={items}
                  rowKey="orderItemId"
                  columns={[
                    {
                      title: 'Ürün Adı',
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
                      width: 150,
                    },
                    {
                      title: 'Adet',
                      dataIndex: 'quantity',
                      key: 'quantity',
                      width: 100,
                      align: 'right',
                      render: (qty) => parseFloat(qty).toFixed(2),
                    },
                    {
                      title: 'Birim Fiyat',
                      dataIndex: 'unitPrice',
                      key: 'unitPrice',
                      width: 120,
                      align: 'right',
                      render: (price) => `${parseFloat(price).toFixed(2)} ₺`,
                    },
                    {
                      title: 'Toplam',
                      dataIndex: 'lineTotal',
                      key: 'lineTotal',
                      width: 120,
                      align: 'right',
                      render: (total) => <strong>{parseFloat(total).toFixed(2)} ₺</strong>,
                    },
                  ]}
                  pagination={false}
                  size="small"
                />
              );
            },
            rowExpandable: () => true,
          }}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} adisyon`,
          }}
        />
      </Card>
    </div>
  );
};

export default Tickets;
