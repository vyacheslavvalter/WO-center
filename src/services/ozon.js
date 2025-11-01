import axios from 'axios';

export class OzonService {
  constructor() {
    this.clientId = import.meta.env.VITE_OZON_CLIENT_ID;
    this.apiKey = import.meta.env.VITE_OZON_API_KEY;
    
    if (!this.clientId || this.clientId === 'твой_client_id_ozon' || 
        !this.apiKey || this.apiKey === 'твой_api_key_ozon') {
      console.warn('⚠️ Ozon API ключи не настроены! Используем тестовые данные');
      this.useMockData = true;
      return;
    }
    
    this.useMockData = false;
  }

  // Мок-данные для Ozon
  getMockSales() {
    return [
      { 
        id: 1, 
        posting_number: 'OZON-001', 
        product: 'Смартфон', 
        quantity: 1, 
        price: 25000,
        status: 'delivering'
      },
      { 
        id: 2, 
        posting_number: 'OZON-002', 
        product: 'Наушники', 
        quantity: 2, 
        price: 3500,
        status: 'delivered'
      },
      { 
        id: 3, 
        posting_number: 'OZON-003', 
        product: 'Чехол для телефона', 
        quantity: 5, 
        price: 890,
        status: 'cancelled'
      }
    ];
  }

  async makeOzonRequest(method, params = {}) {
    if (this.useMockData) {
      console.log('📋 Используем тестовые данные Ozon');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { result: this.getMockSales() };
    }

    try {
      console.log('🔄 Делаем реальный запрос к Ozon...');
      const response = await axios.post('https://api-seller.ozon.ru/' + method, params, {
        headers: {
          'Client-Id': this.clientId,
          'Api-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('❌ Ошибка Ozon API:', error);
      console.log('📋 Переключаемся на тестовые данные');
      return { result: this.getMockSales() };
    }
  }

  async getSales(fromDate, toDate) {
    const result = await this.makeOzonRequest('v2/posting/fbo/list', {
      filter: {
        since: fromDate,
        to: toDate
      },
      limit: 50
    });
    return result.result || [];
  }
}