import { db } from '../db/database.js';

export function calculateBusinessForecast() {
  const database = db.get();
  const orders = database.orders.filter((o) => o.status !== 'cancelled');

  // 1. Group actual sales by day (YYYY-MM-DD)
  const salesByDate = {};

  orders.forEach((order) => {
    const d = new Date(order.createdAt);
    const dateStr = d.toISOString().split('T')[0];

    if (!salesByDate[dateStr]) {
      salesByDate[dateStr] = { totalSales: 0, orderCount: 0, productQuantities: {} };
    }

    salesByDate[dateStr].totalSales += order.totalAmount;
    salesByDate[dateStr].orderCount += 1;

    order.items.forEach((item) => {
      salesByDate[dateStr].productQuantities[item.productId] =
        (salesByDate[dateStr].productQuantities[item.productId] || 0) + item.quantity;
    });
  });

  const sortedDates = Object.keys(salesByDate).sort();
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const historicalData = sortedDates.map((dateStr) => {
    const d = new Date(dateStr);
    return {
      date: dateStr,
      dayName: dayNames[d.getDay()],
      totalSales: salesByDate[dateStr].totalSales,
      orderCount: salesByDate[dateStr].orderCount,
      isForecast: false
    };
  });

  // If data is empty or very small, provide a safe baseline
  const n = historicalData.length;
  if (n === 0) {
    return {
      historicalData: [],
      forecastNext7Days: [],
      forecastNext30DaysSummary: {
        estimatedTotalRevenue: 0,
        estimatedTotalOrders: 0,
        growthVsLast30DaysPercent: 0
      },
      metrics: {
        methodName: 'Exponential Smoothing (Alpha=0.35)',
        historicalDaysCount: 0,
        meanAbsoluteError: 0,
        confidenceScorePercent: 0,
        trendDirection: 'Stabil (Stable)'
      },
      productTrends: [],
      ingredientDemandForecast: {
        coffeeBeansKgNext7Days: 0,
        freshMilkLitersNext7Days: 0,
        sugarArenKgNext7Days: 0
      },
      disclaimer: 'Belum ada data transaksi yang mencukupi untuk menghasilkan proyeksi.'
    };
  }

  // 2. Exponential Smoothing & Weighted Moving Average Forecast
  // Alpha = 0.35 (optimal balance between responsiveness and stability)
  const alpha = 0.35;
  let smoothedSales = historicalData[0].totalSales;
  let smoothedOrders = historicalData[0].orderCount;
  let totalError = 0;

  for (let i = 1; i < n; i++) {
    const error = Math.abs(historicalData[i].totalSales - smoothedSales);
    totalError += error;
    smoothedSales = alpha * historicalData[i].totalSales + (1 - alpha) * smoothedSales;
    smoothedOrders = alpha * historicalData[i].orderCount + (1 - alpha) * smoothedOrders;
  }

  const mae = n > 1 ? Math.round(totalError / (n - 1)) : 0;
  const avgSales = historicalData.reduce((sum, d) => sum + d.totalSales, 0) / n;
  const confidenceScore = Math.max(70, Math.min(96, Math.round(100 - (mae / (avgSales || 1)) * 100)));

  // Calculate overall trend slope
  let trendDirection = 'Stabil (Stable)';
  if (n >= 4) {
    const recentHalf = historicalData.slice(Math.floor(n / 2));
    const previousHalf = historicalData.slice(0, Math.floor(n / 2));
    const avgRecent = recentHalf.reduce((s, x) => s + x.totalSales, 0) / recentHalf.length;
    const avgPrev = previousHalf.reduce((s, x) => s + x.totalSales, 0) / previousHalf.length;
    const ratio = (avgRecent - avgPrev) / (avgPrev || 1);
    if (ratio > 0.05) trendDirection = 'Naik (Upward)';
    else if (ratio < -0.05) trendDirection = 'Menurun (Downward)';
  }

  // Day of week seasonality factors
  const dayTotals = {};
  for (let i = 0; i < 7; i++) dayTotals[i] = { sum: 0, count: 0 };

  historicalData.forEach((d) => {
    const dayOfWeek = new Date(d.date).getDay();
    dayTotals[dayOfWeek].sum += d.totalSales;
    dayTotals[dayOfWeek].count += 1;
  });

  const overallAvgPerDay = avgSales || 1;
  const dayWeights = {};
  for (let i = 0; i < 7; i++) {
    const dayAvg = dayTotals[i].count > 0 ? dayTotals[i].sum / dayTotals[i].count : overallAvgPerDay;
    dayWeights[i] = Math.max(0.7, Math.min(1.4, dayAvg / overallAvgPerDay));
  }

  // Generate 7-day forecast
  const lastDate = new Date(historicalData[n - 1].date);
  const forecastNext7Days = [];
  let next7DaysSalesSum = 0;
  let next7DaysOrdersSum = 0;

  for (let step = 1; step <= 7; step++) {
    const fDate = new Date(lastDate);
    fDate.setDate(fDate.getDate() + step);
    const dayOfWeek = fDate.getDay();
    const weight = dayWeights[dayOfWeek] || 1;

    // Slight growth trend multiplier if upward
    const trendFactor = trendDirection === 'Naik (Upward)' ? 1 + step * 0.008 : trendDirection === 'Menurun (Downward)' ? 1 - step * 0.005 : 1;

    const projectedSales = Math.round(smoothedSales * weight * trendFactor);
    const projectedOrders = Math.max(1, Math.round(smoothedOrders * weight * trendFactor));

    next7DaysSalesSum += projectedSales;
    next7DaysOrdersSum += projectedOrders;

    forecastNext7Days.push({
      date: fDate.toISOString().split('T')[0],
      dayName: dayNames[dayOfWeek],
      totalSales: projectedSales,
      orderCount: projectedOrders,
      isForecast: true
    });
  }

  // 30-day projection
  const estimated30DaysRevenue = Math.round(next7DaysSalesSum * (30 / 7));
  const estimated30DaysOrders = Math.round(next7DaysOrdersSum * (30 / 7));
  const last30DaysActual = historicalData.slice(-30).reduce((sum, d) => sum + d.totalSales, 0) || (avgSales * 30);
  const growthPercent = Math.round(((estimated30DaysRevenue - last30DaysActual) / (last30DaysActual || 1)) * 100);

  // 3. Product-Level Trends & Ingredient Demands
  const productAggregates = {};

  database.products.forEach((p) => {
    productAggregates[p.id] = { name: p.name, category: p.category, qty: 0, revenue: 0, recentQty: 0, prevQty: 0 };
  });

  const midpointIndex = Math.floor(orders.length / 2);

  orders.forEach((o, idx) => {
    o.items.forEach((item) => {
      if (productAggregates[item.productId]) {
        productAggregates[item.productId].qty += item.quantity;
        productAggregates[item.productId].revenue += item.price * item.quantity;
        if (idx >= midpointIndex) {
          productAggregates[item.productId].recentQty += item.quantity;
        } else {
          productAggregates[item.productId].prevQty += item.quantity;
        }
      }
    });
  });

  const productTrends = Object.entries(productAggregates)
    .map(([productId, info]) => {
      const growth = info.prevQty > 0 ? Math.round(((info.recentQty - info.prevQty) / info.prevQty) * 100) : 0;
      let trend = 'stable';
      if (growth > 10) trend = 'up';
      else if (growth < -10) trend = 'down';

      const isCoffee = info.category === 'coffee';
      const usesMilk = info.name.toLowerCase().includes('latte') || info.name.toLowerCase().includes('cappuccino') || info.name.toLowerCase().includes('mocha');

      return {
        productId,
        name: info.name,
        category: info.category,
        totalQuantity: info.qty,
        totalRevenue: info.revenue,
        trend,
        growthRatePercent: growth,
        estimatedIngredientDemand: {
          coffeeBeansKg: isCoffee ? Number((info.qty * 0.018).toFixed(2)) : 0,
          freshMilkLiter: usesMilk ? Number((info.qty * 0.15).toFixed(2)) : 0
        }
      };
    })
    .sort((a, b) => b.totalQuantity - a.totalQuantity);

  // Total ingredient projection for next 7 days based on forecast ratio
  const totalCoffeeCupsHistorical = productTrends.filter((p) => p.category === 'coffee').reduce((sum, p) => sum + p.totalQuantity, 0);
  const totalOrdersHistorical = orders.length || 1;
  const coffeeCupsPerOrder = totalCoffeeCupsHistorical / totalOrdersHistorical;
  const expectedCoffeeCupsNext7Days = Math.round(next7DaysOrdersSum * coffeeCupsPerOrder);

  const ingredientDemandForecast = {
    coffeeBeansKgNext7Days: Number((expectedCoffeeCupsNext7Days * 0.018).toFixed(1)),
    freshMilkLitersNext7Days: Number((expectedCoffeeCupsNext7Days * 0.65 * 0.15).toFixed(1)),
    sugarArenKgNext7Days: Number((expectedCoffeeCupsNext7Days * 0.02).toFixed(1))
  };

  return {
    historicalData,
    forecastNext7Days,
    forecastNext30DaysSummary: {
      estimatedTotalRevenue: estimated30DaysRevenue,
      estimatedTotalOrders: estimated30DaysOrders,
      growthVsLast30DaysPercent: growthPercent
    },
    metrics: {
      methodName: 'Exponential Smoothing (α=0.35) & Weighted Seasonality',
      historicalDaysCount: n,
      meanAbsoluteError: mae,
      confidenceScorePercent: confidenceScore,
      trendDirection
    },
    productTrends: productTrends.slice(0, 10),
    ingredientDemandForecast,
    disclaimer: 'Proyeksi ini adalah estimasi matematis berbasis pola penjualan aktual dan musiman hari Kopi Sewu, bukan jaminan angka pasti.'
  };
}
