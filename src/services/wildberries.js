import axios from 'axios';

export class WildberriesService {
  constructor(apiKey) {
    this.apiKey = apiKey || import.meta.env.VITE_WB_API_KEY;
    this.baseURL = 'https://statistics-api.wildberries.ru/api/v1/';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': this.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  // 🔹 ЗАКАЗЫ - из вашего Google Script
  async getOrders(dateFrom, dateTo) {
    try {
      console.log('📥 Получение заказов WB...');
      const response = await this.client.get('supplier/orders', {
        params: {
          dateFrom: this.formatDate(dateFrom),
          dateTo: this.formatDate(dateTo),
          flag: 0
        }
      });
      
      // Трансформация данных по вашему ТЗ
      return response.data.map(order => ({
        id: order.id || order.gNumber,
        date: order.date || order.lastChangeDate,
        sku: order.barcode || order.nmId,
        product_name: order.subject || 'Неизвестный товар',
        quantity: order.quantity || 1,
        price: order.totalPrice || order.priceWithDisc,
        commission: order.commission || 0,
        logistics: order.logistics || 0,
        cost_price: 0, // Будем рассчитывать из ваших данных
        margin: 0,     // Будем рассчитывать
        status: this.mapOrderStatus(order.isCancel),
        marketplace: 'Wildberries',
        warehouse: order.warehouseName || 'Неизвестный склад'
      }));
      
    } catch (error) {
      console.error('❌ Ошибка получения заказов WB:', error);
      throw error;
    }
  }

  // 🔹 ПРОДАЖИ - из вашего Google Script
  async getSales(dateFrom, dateTo) {
    try {
      console.log('💰 Получение продаж WB...');
      const response = await this.client.get('supplier/sales', {
        params: {
          dateFrom: this.formatDate(dateFrom),
          dateTo: this.formatDate(dateTo),
          flag: 0
        }
      });
      
      return response.data.map(sale => ({
        id: sale.id || sale.gNumber,
        sale_date: sale.date || sale.lastChangeDate,
        sku: sale.barcode || sale.nmId,
        product_name: sale.subject || 'Неизвестный товар',
        quantity: sale.quantity || 1,
        sale_price: sale.totalPrice || sale.forPay,
        commission_total: sale.commission || 0,
        logistics_cost: sale.logistics || 0,
        cost_price: 0, // Из ваших данных по себестоимости
        net_profit: this.calculateNetProfit(sale),
        margin_percent: this.calculateMargin(sale),
        marketplace: 'Wildberries'
      }));
      
    } catch (error) {
      console.error('❌ Ошибка получения продаж WB:', error);
      throw error;
    }
  }

  // 🔹 ОСТАТКИ - из вашего Google Script
  async getStocks() {
    try {
      console.log('📦 Получение остатков WB...');
      const response = await this.client.get('supplier/stocks', {
        params: {
          dateFrom: new Date().toISOString().split('T')[0]
        }
      });
      
      return response.data.map(stock => ({
        sku: stock.barcode,
        product_name: stock.subject,
        current_stock: stock.quantity,
        reserved_stock: stock.inWayToClient + stock.inWayFromClient,
        available_stock: stock.quantity - (stock.inWayToClient + stock.inWayFromClient),
        warehouse: stock.warehouseName,
        days_of_supply: this.calculateDaysOfSupply(stock),
        reorder_point: this.calculateReorderPoint(stock),
        marketplace: 'Wildberries'
      }));
      
    } catch (error) {
      console.error('❌ Ошибка получения остатков WB:', error);
      throw error;
    }
  }

  // 🔹 ФИНАНСЫ - из вашего ТЗ "Финансовая аналитика"
  async getFinanceReport(dateFrom, dateTo) {
    try {
      // Получаем данные для финансового отчета
      const [sales, orders] = await Promise.all([
        this.getSales(dateFrom, dateTo),
        this.getOrders(dateFrom, dateTo)
      ]);
      
      return this.calculateFinanceMetrics(sales, orders);
      
    } catch (error) {
      console.error('❌ Ошибка финансового отчета WB:', error);
      throw error;
    }
  }

  // 🔹 ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ (из ваших скриптов)
  
  formatDate(date) {
    return new Date(date).toISOString().split('T')[0];
  }

  mapOrderStatus(isCancel) {
    return isCancel ? 'Отменен' : 'Активен';
  }

  calculateNetProfit(sale) {
    const revenue = sale.totalPrice || sale.forPay;
    const costs = (sale.commission || 0) + (sale.logistics || 0);
    return revenue - costs;
  }

  calculateMargin(sale) {
    const revenue = sale.totalPrice || sale.forPay;
    const profit = this.calculateNetProfit(sale);
    return revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;
  }

  calculateDaysOfSupply(stock) {
    // Упрощенный расчет - нужно доработать по вашим данным
    const avgDailySales = 10; // Нужны ваши реальные данные
    return avgDailySales > 0 ? Math.floor(stock.quantity / avgDailySales) : 0;
  }

  calculateReorderPoint(stock) {
    // Упрощенный расчет точки заказа
    const leadTime = 7; // Дней на поставку
    const avgDailySales = 10;
    return leadTime * avgDailySales;
  }

  calculateFinanceMetrics(sales, orders) {
    const revenue = sales.reduce((sum, sale) => sum + (sale.sale_price || 0), 0);
    const commissionTotal = sales.reduce((sum, sale) => sum + (sale.commission_total || 0), 0);
    const logisticsTotal = sales.reduce((sum, sale) => sum + (sale.logistics_cost || 0), 0);
    const netProfit = sales.reduce((sum, sale) => sum + (sale.net_profit || 0), 0);
    
    return {
      period: `${this.formatDate(new Date())}`,
      revenue,
      cost_of_goods: 0, // Нужны ваши данные по себестоимости
      gross_profit: revenue,
      commission_total: commissionTotal,
      logistics_total: logisticsTotal,
      other_costs: 0,
      net_profit: netProfit,
      margin_percent: revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : 0,
      roi: 0, // Нужны данные по инвестициям
      marketplace: 'Wildberries'
    };
  }
}