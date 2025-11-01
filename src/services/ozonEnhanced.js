import axios from 'axios';

export class OzonService {
  constructor(clientId, apiKey) {
    this.clientId = clientId || import.meta.env.VITE_OZON_CLIENT_ID;
    this.apiKey = apiKey || import.meta.env.VITE_OZON_API_KEY;
  }

  async makeOzonRequest(method, params = {}) {
    try {
      const response = await axios.post(`https://api-seller.ozon.ru/${method}`, params, {
        headers: {
          'Client-Id': this.clientId,
          'Api-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Ozon API Error (${method}):`, error);
      throw error;
    }
  }

  // 🔹 ЗАКАЗЫ OZON - по аналогии с вашими скриптами
  async getOrders(dateFrom, dateTo) {
    const result = await this.makeOzonRequest('v2/posting/fbo/list', {
      filter: {
        since: dateFrom,
        to: dateTo
      },
      limit: 1000
    });

    return result.result?.map(order => ({
      id: order.posting_number,
      date: order.in_process_at,
      sku: order.products?.[0]?.sku || 'Unknown',
      product_name: order.products?.[0]?.name || 'Неизвестный товар',
      quantity: order.products?.reduce((sum, p) => sum + p.quantity, 0) || 1,
      price: order.products?.reduce((sum, p) => sum + (p.price || 0), 0) || 0,
      commission: this.calculateOzonCommission(order),
      logistics: order.analytics_data?.logistics || 0,
      cost_price: 0,
      margin: 0,
      status: this.mapOzonStatus(order.status),
      marketplace: 'Ozon',
      warehouse: order.analytics_data?.warehouse || 'Неизвестный склад'
    })) || [];
  }

  // 🔹 ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ для Ozon
  calculateOzonCommission(order) {
    // Логика расчета комиссии Ozon из ваших данных
    const price = order.products?.reduce((sum, p) => sum + (p.price || 0), 0) || 0;
    return price * 0.08; // Примерная комиссия 8%
  }

  mapOzonStatus(status) {
    const statusMap = {
      'awaiting_packaging': 'Ожидает упаковки',
      'awaiting_deliver': 'Ожидает доставки',
      'delivering': 'Доставляется',
      'delivered': 'Доставлен',
      'cancelled': 'Отменен'
    };
    return statusMap[status] || status;
  }

  // 🔹 ОСТАТКИ OZON
  async getStocks() {
    const result = await this.makeOzonRequest('v2/products/stocks', {
      filter: {},
      limit: 1000
    });

    return result.result?.map(stock => ({
      sku: stock.sku,
      product_name: stock.name || 'Неизвестный товар',
      current_stock: stock.stock || 0,
      reserved_stock: stock.reserved || 0,
      available_stock: (stock.stock || 0) - (stock.reserved || 0),
      warehouse: stock.warehouse || 'Основной склад',
      days_of_supply: 0, // Нужна логика расчета
      reorder_point: 0,  // Нужна логика расчета
      marketplace: 'Ozon'
    })) || [];
  }
}