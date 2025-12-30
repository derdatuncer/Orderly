import { useState, useEffect } from 'react';
import { Card, App, Tag, Row, Col } from 'antd';
import { getTickets, getTicketItems } from '../../services/api';

const KitchenReady = () => {
  const { message } = App.useApp();
  const [preparingTickets, setPreparingTickets] = useState([]);
  const [readyTickets, setReadyTickets] = useState([]);
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
      // Tüm açık ve yazdırılmış adisyonları getir
      const allTickets = await getTickets('open');
      
      // Meal ready olmayan ve olan adisyonları ayır
      const preparing = allTickets.filter(t => 
        (t.status === 'open' || t.status === 'printed') && !t.mealReady
      );
      
      const ready = allTickets.filter(t => 
        (t.status === 'open' || t.status === 'printed') && t.mealReady
      );
      
      setPreparingTickets(preparing);
      setReadyTickets(ready);
      
      // Her adisyon için ürünleri yükle
      const allActiveTickets = [...preparing, ...ready];
      for (const ticket of allActiveTickets) {
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

  const renderTicketCard = (ticket, isReady = false) => {
    const items = itemsCache[ticket.ticketId] || [];
    
    return (
      <Card
        key={ticket.ticketId}
        style={{
          border: isReady ? '2px solid #52c41a' : '2px solid #d9d9d9',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: 12,
        }}
        bodyStyle={{ padding: 12 }}
      >
        {/* Adisyon Başlığı */}
        <div style={{ marginBottom: 12, borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#262626' }}>
                Adisyon #{ticket.ticketId} - {ticket.tableCode || '(Silinmiş Masa)'}
              </div>
            </div>
            <Tag color={isReady ? 'success' : getStatusColor(ticket.status)} style={{ fontSize: 11, padding: '2px 8px' }}>
              {isReady ? 'Hazır' : getStatusText(ticket.status)}
            </Tag>
          </div>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            {formatDateTime(ticket.openedAt)}
          </div>
        </div>

        {/* Ürünler */}
        <div style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, marginBottom: 8, fontWeight: 'bold' }}>Ürünler:</h3>
          {items.length === 0 ? (
            <div style={{ padding: 8, textAlign: 'center', color: '#999', fontSize: 12 }}>
              Ürün yükleniyor...
            </div>
          ) : (
            <div>
              {items.map((item, index) => (
                <div key={item.orderItemId || index} style={{ marginBottom: 6, padding: 8, backgroundColor: '#fafafa', borderRadius: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 2 }}>
                    {item.quantity}x {item.itemName || '(Silinmiş Ürün)'}
                  </div>
                  
                  {/* Opsiyonlar */}
                  {item.options && item.options.length > 0 && (
                    <div style={{ marginTop: 4, fontSize: 12, color: '#595959' }}>
                      {item.options.map((opt, optIdx) => (
                        <div key={optIdx} style={{ marginBottom: 2, paddingLeft: 8 }}>
                          <span style={{ fontWeight: 'bold' }}>{opt.optionName}:</span>{' '}
                          {opt.valueName || opt.customText || '-'}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Özel Notlar */}
                  {item.specialInstructions && (
                    <div style={{ marginTop: 4, fontSize: 12, fontStyle: 'italic', color: '#1890ff', paddingLeft: 8 }}>
                      📝 {item.specialInstructions}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div style={{ padding: '16px', maxWidth: '100%', overflow: 'auto' }}>
      <h1 style={{ marginBottom: 20, fontSize: 24, fontWeight: 'bold' }}>Takip</h1>
      
      <Row gutter={16}>
        {/* Sol Panel - Hazırlanıyor */}
        <Col xs={24} lg={12}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#1890ff' }}>
              Hazırlanıyor ({preparingTickets.length})
            </h2>
            {preparingTickets.length === 0 ? (
              <Card>
                <div style={{ textAlign: 'center', padding: 48, fontSize: 16, color: '#999' }}>
                  Hazırlanan adisyon yok
                </div>
              </Card>
            ) : (
              <div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                {preparingTickets.map(ticket => renderTicketCard(ticket, false))}
              </div>
            )}
          </div>
        </Col>

        {/* Sağ Panel - Hazır */}
        <Col xs={24} lg={12}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#52c41a' }}>
              Hazır ({readyTickets.length})
            </h2>
            {readyTickets.length === 0 ? (
              <Card>
                <div style={{ textAlign: 'center', padding: 48, fontSize: 16, color: '#999' }}>
                  Hazır adisyon yok
                </div>
              </Card>
            ) : (
              <div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                {readyTickets.map(ticket => renderTicketCard(ticket, true))}
              </div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default KitchenReady;
