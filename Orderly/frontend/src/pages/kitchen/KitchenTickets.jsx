import { useState, useEffect } from 'react';
import { Card, Button, Space, App, Tag, Divider } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { getTickets, getTicketItems, markMealReady } from '../../services/api';
import { useLocation } from 'react-router-dom';

const KitchenTickets = () => {
  const { message } = App.useApp();
  const location = useLocation();
  const isKitchen = location.pathname.startsWith('/kitchen');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [itemsCache, setItemsCache] = useState({});

  useEffect(() => {
    loadTickets();
    
    // SSE ile gerçek zamanlı yenileme
    const eventSource = new EventSource(`${window.location.origin}/api/events`);
    
    const handleTablesUpdated = (event) => {
      loadTickets();
    };
    
    eventSource.addEventListener('tables-updated', handleTablesUpdated);
    
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
    };
    
    return () => {
      eventSource.removeEventListener('tables-updated', handleTablesUpdated);
      eventSource.close();
    };
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      // Sadece açık ve yazdırılmış adisyonları getir (meal ready olmayanlar)
      const allTickets = await getTickets('open');
      
      // Meal ready olmayan aktif adisyonları filtrele
      const activeTickets = allTickets.filter(t => 
        (t.status === 'open' || t.status === 'printed') && !t.mealReady
      );
      
      setTickets(activeTickets);
      
      // Her adisyon için ürünleri yükle
      for (const ticket of activeTickets) {
        if (!itemsCache[ticket.ticketId]) {
          try {
            const items = await getTicketItems(ticket.ticketId);
            setItemsCache(prev => ({ ...prev, [ticket.ticketId]: items }));
          } catch (error) {
            console.error(`Items load error for ticket ${ticket.ticketId}:`, error);
          }
        }
      }
    } catch (error) {
      message.error("Adisyonlar yüklenirken bir hata oluştu");
      console.error("Tickets load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReady = async (ticketId) => {
    try {
      await markMealReady(ticketId);
      message.success("Adisyon hazır olarak işaretlendi");
      await loadTickets();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Adisyon hazır olarak işaretlenirken bir hata oluştu";
      message.error(errorMessage);
      console.error("Mark ready error:", error);
      console.error("Error response:", error.response);
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
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    if (status === 'open') return 'blue';
    if (status === 'printed') return 'red';
    return 'default';
  };

  const getStatusText = (status) => {
    if (status === 'open') return 'Açık';
    if (status === 'printed') return 'Yazdırıldı';
    return status;
  };

  return (
    <div style={{ padding: '16px', maxWidth: '100%', overflow: 'auto' }}>
      <h1 style={{ marginBottom: 20, fontSize: 24, fontWeight: 'bold' }}>Hazırlanıyor</h1>
      
      {tickets.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 48, fontSize: 16, color: '#999' }}>
            Şu anda hazırlanacak adisyon yok
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
          {tickets.map((ticket) => {
            const items = itemsCache[ticket.ticketId] || [];
            
            return (
              <Card
                key={ticket.ticketId}
                style={{
                  border: '2px solid #d9d9d9',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
                bodyStyle={{ padding: 16 }}
              >
                {/* Adisyon Başlığı */}
                <div style={{ marginBottom: 16, borderBottom: '2px solid #f0f0f0', paddingBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 'bold', color: '#262626' }}>
                        Adisyon #{ticket.ticketId}
                      </div>
                      <div style={{ fontSize: 16, color: '#595959', marginTop: 4 }}>
                        Masa: {ticket.tableCode || '(Silinmiş Masa)'}
                      </div>
                    </div>
                    <Tag color={getStatusColor(ticket.status)} style={{ fontSize: 12, padding: '4px 12px' }}>
                      {getStatusText(ticket.status)}
                    </Tag>
                  </div>
                  <div style={{ fontSize: 13, color: '#8c8c8c' }}>
                    Açılış: {formatDateTime(ticket.openedAt)}
                  </div>
                </div>

                {/* Ürünler */}
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, marginBottom: 12, fontWeight: 'bold' }}>Ürünler:</h3>
                  {items.length === 0 ? (
                    <div style={{ padding: 12, textAlign: 'center', color: '#999', fontSize: 14 }}>
                      Ürün yükleniyor...
                    </div>
                  ) : (
                    <div>
                      {items.map((item, index) => (
                        <div key={item.orderItemId || index} style={{ marginBottom: 12, padding: 12, backgroundColor: '#fafafa', borderRadius: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
                                {item.itemName || '(Silinmiş Ürün)'}
                              </div>
                              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#1890ff' }}>
                                Adet: {item.quantity}
                              </div>
                            </div>
                          </div>
                          
                          {/* Opsiyonlar */}
                          {item.options && item.options.length > 0 && (
                            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #e8e8e8' }}>
                              <div style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 6, color: '#595959' }}>
                                Opsiyonlar:
                              </div>
                              {item.options.map((opt, optIdx) => (
                                <div key={optIdx} style={{ fontSize: 13, marginBottom: 3, paddingLeft: 8 }}>
                                  <span style={{ fontWeight: 'bold' }}>{opt.optionName}:</span>{' '}
                                  {opt.valueName || opt.customText || '-'}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Özel Notlar */}
                          {item.specialInstructions && (
                            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #e8e8e8' }}>
                              <div style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 6, color: '#595959' }}>
                                Özel Not:
                              </div>
                              <div style={{ fontSize: 13, fontStyle: 'italic', color: '#1890ff', paddingLeft: 8 }}>
                                📝 {item.specialInstructions}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>


                {/* Hazır Butonu */}
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  block
                  onClick={() => handleMarkReady(ticket.ticketId)}
                  style={{
                    height: 48,
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}
                >
                  Hazır
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KitchenTickets;
