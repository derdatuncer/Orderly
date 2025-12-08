import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  DatePicker,
  Select,
  Space,
  App,
  Row,
  Col,
  Statistic,
  Radio,
} from 'antd';
import {
  DollarOutlined,
  ShoppingOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { getDailyRevenue, getRevenueGrowth, getSummary } from '../../services/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Reports = () => {
  const { message } = App.useApp();
  const [reportType, setReportType] = useState('daily-revenue');
  const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);
  const [loading, setLoading] = useState(false);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [revenueGrowth, setRevenueGrowth] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadReport();
  }, [reportType, dateRange]);

  const loadReport = async () => {
    if (!dateRange || dateRange.length !== 2) return;

    setLoading(true);
    try {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');

      if (reportType === 'summary') {
        const data = await getSummary(startDate, endDate);
        setSummary(data);
      } else if (reportType === 'daily-revenue') {
        const data = await getDailyRevenue(startDate, endDate);
        setDailyRevenue(data);
      } else if (reportType === 'revenue-growth') {
        const data = await getRevenueGrowth(startDate, endDate);
        setRevenueGrowth(data);
      }
    } catch (error) {
      message.error('Rapor yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    d.setHours(d.getHours() + 3); // UTC+3
    return d.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `${parseFloat(amount || 0).toFixed(2)} ₺`;
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Raporlar</h1>

      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <strong>Rapor Tipi:</strong>
            <Radio.Group
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{ marginLeft: 16 }}
            >
              <Radio.Button value="summary">Özet Rapor</Radio.Button>
              <Radio.Button value="daily-revenue">Günlük Hasılat</Radio.Button>
              <Radio.Button value="revenue-growth">Hasılat Artışı</Radio.Button>
            </Radio.Group>
          </div>
          <div>
            <strong>Tarih Aralığı:</strong>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates || [dayjs(), dayjs()])}
              format="DD.MM.YYYY"
              style={{ marginLeft: 16 }}
              allowClear={false}
            />
          </div>
        </Space>
      </Card>

      {/* Özet Rapor */}
      {reportType === 'summary' && summary && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Toplam Adisyon"
                value={summary.totalTickets}
                prefix={<ShoppingOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Toplam Hasılat"
                value={formatCurrency(summary.totalRevenue)}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Ortalama Adisyon Değeri"
                value={formatCurrency(summary.avgTicketValue)}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Günlük Hasılat Tablosu */}
      {reportType === 'daily-revenue' && (
        <Card title="Günlük Hasılat Raporu" loading={loading}>
          <Table
            dataSource={dailyRevenue}
            rowKey="date"
            columns={[
              {
                title: 'Tarih',
                dataIndex: 'date',
                key: 'date',
                width: 150,
                render: (date) => formatDate(date),
              },
              {
                title: 'Adisyon Sayısı',
                dataIndex: 'ticketCount',
                key: 'ticketCount',
                width: 120,
                align: 'right',
              },
              {
                title: 'Toplam Hasılat',
                dataIndex: 'totalRevenue',
                key: 'totalRevenue',
                width: 150,
                align: 'right',
                render: (revenue) => <strong>{formatCurrency(revenue)}</strong>,
              },
              {
                title: 'Nakit',
                dataIndex: 'cashRevenue',
                key: 'cashRevenue',
                width: 130,
                align: 'right',
                render: (revenue) => formatCurrency(revenue),
              },
              {
                title: 'Kart',
                dataIndex: 'creditRevenue',
                key: 'creditRevenue',
                width: 130,
                align: 'right',
                render: (revenue) => formatCurrency(revenue),
              },
            ]}
            pagination={false}
            locale={{ emptyText: 'Seçilen tarih aralığında veri bulunamadı' }}
            summary={(pageData) => {
              let totalRevenue = 0;
              let totalTickets = 0;
              let totalCash = 0;
              let totalCredit = 0;

              pageData.forEach(({ totalRevenue: rev, ticketCount, cashRevenue, creditRevenue }) => {
                totalRevenue += parseFloat(rev || 0);
                totalTickets += ticketCount || 0;
                totalCash += parseFloat(cashRevenue || 0);
                totalCredit += parseFloat(creditRevenue || 0);
              });

              return (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}>
                      <strong>TOPLAM</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong>{totalTickets}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="right">
                      <strong>{formatCurrency(totalRevenue)}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="right">
                      <strong>{formatCurrency(totalCash)}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} align="right">
                      <strong>{formatCurrency(totalCredit)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        </Card>
      )}

      {/* Hasılat Artışı Tablosu */}
      {reportType === 'revenue-growth' && (
        <Card title="Hasılat Artışı Raporu" loading={loading}>
          <Table
            dataSource={revenueGrowth}
            rowKey="date"
            columns={[
              {
                title: 'Tarih',
                dataIndex: 'date',
                key: 'date',
                width: 150,
                render: (date) => formatDate(date),
              },
              {
                title: 'Hasılat',
                dataIndex: 'revenue',
                key: 'revenue',
                width: 150,
                align: 'right',
                render: (revenue) => <strong>{formatCurrency(revenue)}</strong>,
              },
              {
                title: 'Önceki Gün',
                dataIndex: 'previousRevenue',
                key: 'previousRevenue',
                width: 150,
                align: 'right',
                render: (revenue) => revenue ? formatCurrency(revenue) : '-',
              },
              {
                title: 'Artış (%)',
                dataIndex: 'growthPercentage',
                key: 'growthPercentage',
                width: 120,
                align: 'right',
                render: (percentage) => {
                  if (percentage === null || percentage === undefined) return '-';
                  const isPositive = percentage >= 0;
                  return (
                    <span style={{ color: isPositive ? '#3f8600' : '#cf1322' }}>
                      {isPositive ? <RiseOutlined /> : <FallOutlined />}
                      {' '}
                      {Math.abs(parseFloat(percentage)).toFixed(2)}%
                    </span>
                  );
                },
              },
            ]}
            pagination={false}
            locale={{ emptyText: 'Seçilen tarih aralığında veri bulunamadı' }}
          />
        </Card>
      )}

      {/* Özet Rapor Tablosu Detay */}
      {reportType === 'summary' && summary && (
        <Card title="Ödeme Yöntemleri Detayı" loading={loading}>
          <Row gutter={16}>
            <Col span={12}>
              <Card size="small" title="Nakit">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Statistic
                    title="Toplam"
                    value={formatCurrency(summary.cashRevenue)}
                    prefix={<DollarOutlined />}
                  />
                  <Statistic
                    title="Adisyon Sayısı"
                    value={summary.cashCount}
                    prefix={<ShoppingOutlined />}
                  />
                </Space>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="Kart">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Statistic
                    title="Toplam"
                    value={formatCurrency(summary.creditRevenue)}
                    prefix={<DollarOutlined />}
                  />
                  <Statistic
                    title="Adisyon Sayısı"
                    value={summary.creditCount}
                    prefix={<ShoppingOutlined />}
                  />
                </Space>
              </Card>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default Reports;
