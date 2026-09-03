const prisma = require('../config/prisma');

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// GET /dashboard/stats - ringkasan hari ini
exports.getStats = async (req, res) => {
  try {
    const userId = req.userId;
    const todayStart = startOfDay(new Date());
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const [todaysTransactions, productCount, debts] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          user_id: userId,
          transaction_date: { gte: todayStart, lt: tomorrowStart },
        },
      }),
      prisma.product.count({ where: { user_id: userId } }),
      prisma.debt.findMany({ where: { user_id: userId } }),
    ]);

    const totalPenjualanHariIni = todaysTransactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalTransaksiHariIni = todaysTransactions.length;
    const hutangPelanggan = debts.reduce(
      (acc, d) => acc + (d.total_debt - d.paid_amount),
      0,
    );

    res.json({
      totalPenjualanHariIni,
      totalTransaksiHariIni,
      stokProduk: productCount,
      hutangPelanggan,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET /dashboard/graph - pemasukan & pengeluaran 7 hari terakhir
exports.getGraphData = async (req, res) => {
  try {
    const userId = req.userId;
    const days = 7;
    const rangeStart = startOfDay(new Date());
    rangeStart.setDate(rangeStart.getDate() - (days - 1));

    const transactions = await prisma.transaction.findMany({
      where: { user_id: userId, transaction_date: { gte: rangeStart } },
    });

    const buckets = [];
    for (let i = 0; i < days; i++) {
      const day = new Date(rangeStart);
      day.setDate(day.getDate() + i);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayTransactions = transactions.filter(
        (t) => t.transaction_date >= day && t.transaction_date < nextDay,
      );
      buckets.push({
        date: day.toISOString().slice(0, 10),
        income: dayTransactions
          .filter((t) => t.type === 'income')
          .reduce((acc, t) => acc + t.amount, 0),
        expense: dayTransactions
          .filter((t) => t.type === 'expense')
          .reduce((acc, t) => acc + t.amount, 0),
      });
    }

    res.json(buckets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET /dashboard/stock - produk dengan stok teratas
exports.getStockData = async (req, res) => {
  try {
    const userId = req.userId;
    const products = await prisma.product.findMany({
      where: { user_id: userId },
      orderBy: { stock: 'desc' },
      take: 5,
      select: { id: true, name: true, stock: true, unit: true },
    });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET /dashboard/recent - transaksi terbaru
exports.getRecentTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const transactions = await prisma.transaction.findMany({
      where: { user_id: userId },
      include: { category: true },
      orderBy: { transaction_date: 'desc' },
      take: 5,
    });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
