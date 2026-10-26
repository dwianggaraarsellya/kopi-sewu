import { db } from '../db/database.js';

export function getFinancialSummary(filter = {}) {
  const database = db.get();
  let orders = [...database.orders];
  let expenses = [...database.expenses];

  const now = new Date();
  let start = new Date(0);
  let end = new Date(now.getTime() + 86400000); // end of current day

  if (filter.period === 'today') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  } else if (filter.period === 'this_week') {
    const day = now.getDay() || 7;
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1, 0, 0, 0);
  } else if (filter.period === 'this_month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  } else if (filter.period === 'this_year') {
    start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
  } else if (filter.period === 'custom' && filter.startDate && filter.endDate) {
    start = new Date(`${filter.startDate}T00:00:00`);
    end = new Date(`${filter.endDate}T23:59:59`);
  }

  // Filter by date
  orders = orders.filter((o) => {
    const d = new Date(o.createdAt);
    return d >= start && d <= end;
  });

  expenses = expenses.filter((e) => {
    const d = new Date(e.createdAt);
    return d >= start && d <= end;
  });

  // Filter by outlet if specified
  if (filter.outletId && filter.outletId !== 'all') {
    orders = orders.filter((o) => o.outletId === filter.outletId);
    expenses = expenses.filter((e) => e.outletId === filter.outletId);
  }

  // Calculations
  let grossSales = 0;
  let discounts = 0;
  let cancelledAmount = 0;
  let cogs = 0;

  const ordersCount = {
    total: orders.length,
    completed: 0,
    cancelled: 0,
    inProgress: 0
  };

  orders.forEach((o) => {
    if (o.status === 'cancelled') {
      ordersCount.cancelled++;
      cancelledAmount += o.totalAmount;
    } else {
      grossSales += o.subtotal;
      discounts += o.discount;

      if (o.status === 'completed') {
        ordersCount.completed++;
      } else {
        ordersCount.inProgress++;
      }

      // Calculate HPP based on items
      o.items.forEach((item) => {
        cogs += (item.costPrice || (item.price * 0.4)) * item.quantity;
      });
    }
  });

  const netSales = Math.max(0, grossSales - discounts);
  const grossProfit = Math.max(0, netSales - cogs);
  const grossProfitMargin = netSales > 0 ? Number(((grossProfit / netSales) * 100).toFixed(1)) : 0;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netOperatingProfit = grossProfit - totalExpenses;
  const netProfitMargin = netSales > 0 ? Number(((netOperatingProfit / netSales) * 100).toFixed(1)) : 0;

  // Expenses grouped by category
  const expenseCatMap = {};
  expenses.forEach((e) => {
    if (!expenseCatMap[e.category]) {
      expenseCatMap[e.category] = { label: e.categoryLabel, amount: 0 };
    }
    expenseCatMap[e.category].amount += e.amount;
  });

  const expensesByCategory = Object.entries(expenseCatMap).map(([category, val]) => ({
    category,
    label: val.label,
    totalAmount: val.amount,
    percentage: totalExpenses > 0 ? Number(((val.amount / totalExpenses) * 100).toFixed(1)) : 0
  })).sort((a, b) => b.totalAmount - a.totalAmount);

  // Recent combined transactions
  const combinedTx = [];

  orders.slice(0, 15).forEach((o) => {
    combinedTx.push({
      id: o.id,
      date: o.createdAt,
      type: 'sale',
      title: `Pesanan ${o.id} - ${o.customerName} (${o.items.length} menu)`,
      outletName: o.outletName,
      amount: o.totalAmount,
      status: o.status
    });
  });

  expenses.slice(0, 10).forEach((e) => {
    combinedTx.push({
      id: e.id,
      date: e.createdAt,
      type: 'expense',
      title: `[${e.categoryLabel}] ${e.description}`,
      outletName: e.outletName,
      amount: -e.amount,
      status: 'tercatat'
    });
  });

  combinedTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const outletMatch = filter.outletId ? database.outlets.find((o) => o.id === filter.outletId) : undefined;

  return {
    period: filter.period || 'this_month',
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    outletId: filter.outletId,
    outletName: outletMatch?.name,
    grossSales,
    discounts,
    cancelledAmount,
    netSales,
    cogs,
    grossProfit,
    grossProfitMarginPercent: grossProfitMargin,
    totalExpenses,
    netOperatingProfit,
    netProfitMarginPercent: netProfitMargin,
    ordersCount,
    expensesByCategory,
    recentTransactions: combinedTx.slice(0, 20)
  };
}
