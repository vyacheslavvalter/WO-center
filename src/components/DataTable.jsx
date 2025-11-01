import React from 'react';

export function DataTable({ data, title, type = 'wb' }) {
  if (!data || data.length === 0) {
    return (
      <div style={styles.card}>
        <h3 style={styles.title}>{title}</h3>
        <div style={styles.empty}>Нет данных для отображения</div>
      </div>
    );
  }

  // Определяем колонки в зависимости от типа данных
  const columns = type === 'wb' ? [
    { key: 'date', label: 'Дата', width: '120px' },
    { key: 'product', label: 'Товар', width: '200px' },
    { key: 'quantity', label: 'Кол-во', width: '80px' },
    { key: 'price', label: 'Цена', width: '100px' },
    { key: 'status', label: 'Статус', width: '100px' }
  ] : [
    { key: 'posting_number', label: 'Номер отправления', width: '150px' },
    { key: 'product', label: 'Товар', width: '200px' },
    { key: 'quantity', label: 'Кол-во', width: '80px' },
    { key: 'price', label: 'Цена', width: '100px' },
    { key: 'status', label: 'Статус', width: '120px' }
  ];

  // Функция для форматирования статуса
  const formatStatus = (status) => {
    const statusMap = {
      'Продажа': { text: '✅ Продажа', color: '#27ae60' },
      'Возврат': { text: '↩️ Возврат', color: '#e74c3c' },
      'delivering': { text: '🚚 Доставляется', color: '#f39c12' },
      'delivered': { text: '✅ Доставлен', color: '#27ae60' },
      'cancelled': { text: '❌ Отменен', color: '#e74c3c' }
    };
    
    const statusInfo = statusMap[status] || { text: status, color: '#666' };
    return <span style={{ color: statusInfo.color, fontWeight: 'bold' }}>{statusInfo.text}</span>;
  };

  // Функция для форматирования цены
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', { 
      style: 'currency', 
      currency: 'RUB',
      minimumFractionDigits: 0 
    }).format(price);
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{title}</h3>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column.key} style={{ ...styles.th, width: column.width }}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={row.id || index} style={styles.tr}>
                {columns.map(column => (
                  <td key={column.key} style={styles.td}>
                    {column.key === 'price' ? formatPrice(row[column.key]) : 
                     column.key === 'status' ? formatStatus(row[column.key]) : 
                     row[column.key] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={styles.footer}>
        Всего записей: {data.length}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    height: 'fit-content'
  },
  title: {
    color: '#2c3e50',
    marginBottom: '15px',
    borderBottom: '3px solid #3498db',
    paddingBottom: '8px',
    fontSize: '18px',
    fontWeight: '600'
  },
  tableContainer: {
    maxHeight: '400px',
    overflowY: 'auto',
    border: '1px solid #ecf0f1',
    borderRadius: '8px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px'
  },
  th: {
    background: '#f8f9fa',
    padding: '12px 8px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#2c3e50',
    borderBottom: '2px solid #3498db',
    position: 'sticky',
    top: 0
  },
  tr: {
    borderBottom: '1px solid #ecf0f1',
    transition: 'background-color 0.2s'
  },
  td: {
    padding: '10px 8px',
    borderBottom: '1px solid #f8f9fa'
  },
  footer: {
    marginTop: '10px',
    fontSize: '12px',
    color: '#7f8c8d',
    textAlign: 'right'
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#7f8c8d',
    fontSize: '16px'
  }
};