// Модели данных основанные на вашем ТЗ
export const DataModels = {
  // Модель заказа (из вашего ТЗ - "Заказы")
  ORDER: {
    fields: [
      'id', 'date', 'sku', 'product_name', 'quantity', 'price', 
      'commission', 'logistics', 'cost_price', 'margin', 'status',
      'marketplace', 'warehouse'
    ]
  },
  
  // Модель продажи (из вашего ТЗ - "Продажи")
  SALE: {
    fields: [
      'id', 'sale_date', 'sku', 'product_name', 'quantity', 'sale_price',
      'commission_total', 'logistics_cost', 'cost_price', 'net_profit',
      'margin_percent', 'marketplace'
    ]
  },
  
  // Модель остатков (из вашего ТЗ - "Остатки")
  STOCK: {
    fields: [
      'sku', 'product_name', 'current_stock', 'reserved_stock', 'available_stock',
      'warehouse', 'days_of_supply', 'reorder_point', 'marketplace'
    ]
  },
  
  // Финансовая аналитика (из вашего ТЗ)
  FINANCE: {
    fields: [
      'period', 'revenue', 'cost_of_goods', 'gross_profit', 'commission_total',
      'logistics_total', 'other_costs', 'net_profit', 'margin_percent',
      'roi', 'marketplace'
    ]
  }
};

// Функции для расчета метрик из вашего ТЗ
export const Calculations = {
  // Расчет маржи (из ТЗ "unit-экономика")
  calculateMargin: (revenue, cost) => {
    return ((revenue - cost) / revenue * 100).toFixed(1);
  },
  
  // Расчет ROI (из ТЗ "ABC-анализ")
  calculateROI: (profit, investment) => {
    return ((profit / investment) * 100).toFixed(1);
  },
  
  // ABC-анализ (из вашего ТЗ)
  abcAnalysis: (products) => {
    // A - 80% выручки, B - 15%, C - 5%
    const sorted = products.sort((a, b) => b.revenue - a.revenue);
    let cumulativeRevenue = 0;
    const totalRevenue = sorted.reduce((sum, p) => sum + p.revenue, 0);
    
    return sorted.map(product => {
      cumulativeRevenue += product.revenue;
      const percentage = (cumulativeRevenue / totalRevenue) * 100;
      
      let category = 'C';
      if (percentage <= 80) category = 'A';
      else if (percentage <= 95) category = 'B';
      
      return { ...product, abc_category: category };
    });
  }
};