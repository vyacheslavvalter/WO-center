import React, { useState, useEffect } from 'react';
import { WildberriesService } from '../services/wildberries';
import { OzonService } from '../services/ozon';
import { DataTable } from './DataTable';

export function Dashboard() {
  const [wbData, setWbData] = useState([]);
  const [ozonData, setOzonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: '2024-01-01',
    to: '2024-01-31'
  });

  // Загружаем данные при монтировании
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log('🚀 Начинаем загрузку данных...');
    setLoading(true);
    
    try {
      const wbService = new WildberriesService();
      const ozonService = new OzonService();

      // Загружаем данные параллельно
      const [wbSales, ozonSales] = await Promise.all([
        wbService.getSales(dateRange.from, dateRange.to),
        ozonService.getSales(dateRange.from, dateRange.to)
      ]);

      setWbData(wbSales);
      setOzonData(ozonSales);
      
    } catch (error) {
      console.error('💥 Ошибка загрузки:', error);
      // Данные уже установлены в сервисах через моки
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <h2 style={styles.loadingText}>Загружаем данные с маркетплейсов...</h2>
        <p style={styles.loadingSubtext}>Это может занять несколько секунд</p>
      </div>
    );
  }

  return (
    <div style={styles.dashboard}>
      {/* Хедер */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>W B O Z O N Control Center</h1>
          <p style={styles.subtitle}>Система управления маркетплейсами</p>
        </div>
        <div style={styles.controls}>
          <button 
            onClick={handleRefresh}
            style={styles.refreshButton}
            title="Обновить данные"
          >
            🔄 Обновить
          </button>
        </div>
      </header>

      {/* Статус бар */}
      <div style={styles.statusBar}>
        <div style={styles.statusItem}>
          <span style={styles.statusLabel}>Wildberries:</span>
          <span style={styles.statusValue}>
            {wbData.length} записей
          </span>
        </div>
        <div style={styles.statusItem}>
          <span style={styles.statusLabel}>Ozon:</span>
          <span style={styles.statusValue}>
            {ozonData.length} записей
          </span>
        </div>
        <div style={styles.statusItem}>
          <span style={styles.statusLabel}>Период:</span>
          <span style={styles.statusValue}>
            {dateRange.from} - {dateRange.to}
          </span>
        </div>
      </div>

      {/* Основной контент */}
      <div style={styles.content}>
        <DataTable 
          data={wbData} 
          title="📦 Wildberries - Продажи"
          type="wb"
        />
        
        <DataTable 
          data={ozonData} 
          title="🚚 Ozon - Заказы" 
          type="ozon"
        />
      </div>

      {/* Футер */}
      <footer style={styles.footer}>
        <p>💡 Советы: Настройте API ключи в файле .env для работы с реальными данными</p>
      </footer>
    </div>
  );
}

const styles = {
  dashboard: {
    padding: '20px',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  header: {
    background: 'rgba(255, 255, 255, 0.95)',
    padding: '25px 30px',
    borderRadius: '15px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backdropFilter: 'blur(10px)'
  },
  headerContent: {
    flex: 1
  },
  title: {
    color: '#2c3e50',
    marginBottom: '8px',
    fontSize: '28px',
    fontWeight: '700'
  },
  subtitle: {
    color: '#7f8c8d',
    fontSize: '16px',
    margin: 0
  },
  controls: {
    display: 'flex',
    gap: '10px'
  },
  refreshButton: {
    background: '#3498db',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  statusBar: {
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '15px 20px',
    borderRadius: '10px',
    marginBottom: '20px',
    display: 'flex',
    gap: '30px',
    fontSize: '14px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  statusItem: {
    display: 'flex',
    gap: '8px'
  },
  statusLabel: {
    color: '#7f8c8d',
    fontWeight: '500'
  },
  statusValue: {
    color: '#2c3e50',
    fontWeight: '600'
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px'
  },
  footer: {
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '15px 20px',
    borderRadius: '10px',
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: '14px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(255,255,255,0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  },
  loadingText: {
    fontSize: '24px',
    marginBottom: '10px'
  },
  loadingSubtext: {
    fontSize: '16px',
    opacity: 0.8
  }
};

// Добавляем анимацию спиннера
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);