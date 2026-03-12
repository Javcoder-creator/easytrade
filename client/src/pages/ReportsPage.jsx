import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, ShoppingBag, DollarSign, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#e11d48'];
const PAYMENT_NAMES = {
  cash: '💵 Naqd', card: '💳 Karta',
  uzcard: '💳 UzCard', humo: '💳 Humo', transfer: "🏦 O'tkazma",
};

function fmt(n) { return new Intl.NumberFormat('uz-UZ').format(Math.round(n || 0)); }

function KPICard({ label, value, icon: Icon, positive = true, sub }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <Icon size={20} className="text-blue-600" />
        {sub && (
          <span className={`text-xs font-medium flex items-center gap-1 ${positive ? 'text-green-500' : 'text-red-400'}`}>
            {positive ? <TrendingUp size={12}/> : <TrendingDown size={12}/>} {sub}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-gray-500 text-sm mt-1">{label}</p>
    </div>
  );
}

function Empty() {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-gray-300">
      <ShoppingBag size={40} className="mb-2 opacity-40" />
      <p className="text-sm">Hali sotuv yo'q</p>
    </div>
  );
}

export default function ReportsPage() {
  const [loading, setLoading]         = useState(true);
  const [summary, setSummary]         = useState(null);
  const [weekly, setWeekly]           = useState([]);
  const [monthly, setMonthly]         = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [payMethods, setPayMethods]   = useState([]);
  const [cashierStats, setCashierStats] = useState([]);
  const [tab, setTab] = useState('weekly');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, w, m, t, p, c] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/reports/weekly'),
        api.get('/reports/monthly'),
        api.get('/reports/top-products'),
        api.get('/reports/payment-methods'),
        api.get('/reports/cashier-stats'),
      ]);
      setSummary(s.data.data);
      setWeekly(w.data.data || []);
      setMonthly(m.data.data || []);
      setTopProducts(t.data.data || []);
      setPayMethods(p.data.data || []);
      setCashierStats(c.data.data || []);
    } catch {
      toast.error("Ma'lumotlarni yuklashda xato");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const chartData = tab === 'weekly' ? weekly : monthly;
  const hasData = chartData.some((d) => (d.sotuv || d.daromad || 0) > 0);
  const totalRevenue = monthly.reduce((s, m) => s + (m.daromad || 0), 0);
  const totalProfit  = monthly.reduce((s, m) => s + (m.foyda || 0), 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh] text-gray-400">
      <div className="text-center">
        <div className="text-4xl animate-spin mb-3">⏳</div>
        <p>Yuklanmoqda...</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Hisobotlar</h1>
        <button onClick={loadAll}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50">
          <RefreshCw size={14} /> Yangilash
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard label="Bugungi sotuv"     value={`${fmt(summary?.today_revenue)} so'm`} icon={DollarSign} sub={`${summary?.today_sales || 0} ta`} />
        <KPICard label="Jami tovarlar"     value={`${summary?.total_products || 0} ta`}  icon={ShoppingBag} />
        <KPICard label="6 oylik daromad"   value={`${fmt(totalRevenue)} so'm`}            icon={TrendingUp}  positive={totalRevenue > 0} />
        <KPICard label="6 oylik foyda"     value={`${fmt(totalProfit)} so'm`}             icon={TrendingUp}  positive={totalProfit > 0} />
      </div>

      {/* Asosiy grafik */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-800">Sotuv grafigi</h2>
          <div className="flex gap-2">
            {[['weekly','Haftalik'],['monthly','Oylik']].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  tab === id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {!hasData ? <Empty /> : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barSize={tab === 'weekly' ? 28 : 18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={tab === 'weekly' ? 'kun' : 'oy'} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }}
                tickFormatter={(v) => v === 0 ? '0' : (v/1000000).toFixed(1)+'M'} />
              <Tooltip
                formatter={(v, n) => [fmt(v)+' so\'m', n]}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              {tab === 'weekly' ? (
                <Bar dataKey="sotuv" fill="#2563eb" radius={[6,6,0,0]} name="Sotuv" />
              ) : (
                <>
                  <Bar dataKey="daromad" fill="#2563eb" radius={[4,4,0,0]} name="Daromad" />
                  <Bar dataKey="xarajat" fill="#e2e8f0" radius={[4,4,0,0]} name="Xarajat" />
                  <Bar dataKey="foyda"   fill="#059669" radius={[4,4,0,0]} name="Foyda" />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Quyi 3 ta blok */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Top tovarlar */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">🏆 Eng ko'p sotiladigan</h2>
          {topProducts.length === 0 ? <Empty /> : (
            <div className="space-y-3">
              {topProducts.slice(0, 7).map((p, i) => {
                const pct = Math.round((p.total_qty / (topProducts[0]?.total_qty || 1)) * 100);
                return (
                  <div key={p.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 truncate flex-1 mr-2">
                        <span className="text-gray-400 mr-1">#{i+1}</span>{p.name}
                      </span>
                      <span className="text-gray-500 flex-shrink-0">{fmt(p.total_qty)} ta</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* To'lov usullari */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">💳 To'lov usullari</h2>
          {payMethods.length === 0 ? <Empty /> : (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={payMethods} dataKey="count" nameKey="payment_method"
                    cx="50%" cy="50%" innerRadius={40} outerRadius={65}>
                    {payMethods.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    formatter={(v, n) => [v+' ta', PAYMENT_NAMES[n] || n]}
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-1">
                {payMethods.map((p, i) => (
                  <div key={p.payment_method} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600">{PAYMENT_NAMES[p.payment_method] || p.payment_method}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-800">{p.count} ta</span>
                      <span className="text-gray-400 text-xs ml-1">{fmt(p.total)} so'm</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Kassirlar */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">👤 Kassirlar reytingi</h2>
          {cashierStats.length === 0 ? <Empty /> : (
            <div className="space-y-3">
              {cashierStats.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-orange-400'
                  }`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : c.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.sales_count} ta sotuv</p>
                  </div>
                  <p className="text-sm font-bold text-green-600 flex-shrink-0">
                    {fmt(c.total_revenue)} so'm
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}