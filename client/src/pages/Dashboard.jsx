import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingCart, Package, Users, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

function fmt(n) { return new Intl.NumberFormat('uz-UZ').format(Math.round(n)); }

function StatCard({ title, value, icon: Icon, color, sub, to }) {
  const content = (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
        {sub && (
          <span className="flex items-center gap-1 text-green-500 text-sm font-medium">
            <ArrowUpRight size={14} /> {sub}
          </span>
        )}
      </div>
      <p className="text-gray-500 text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

export default function Dashboard() {
  const { user } = useSelector((s) => s.auth);
  const [stats, setStats] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/summary').catch(() => ({ data: { data: null } })),
      api.get('/reports/weekly').catch(() => ({ data: { data: [] } })),
    ]).then(([summaryRes, weeklyRes]) => {
      setStats(summaryRes.data.data);
      setWeekly(weeklyRes.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Xush kelibsiz, {user?.name}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Statistika kartochkalar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Bugungi sotuv"
          value={loading ? '...' : `${fmt(stats?.today_revenue || 0)} so'm`}
          icon={TrendingUp} color="bg-blue-500"
          sub={`${stats?.today_sales || 0} ta`}
          to="/sales"
        />
        <StatCard
          title="Jami tovarlar"
          value={loading ? '...' : (stats?.total_products || 0)}
          icon={Package} color="bg-purple-500"
          to="/products"
        />
        <StatCard
          title="Mijozlar"
          value={loading ? '...' : (stats?.total_customers || 0)}
          icon={Users} color="bg-green-500"
          to="/customers"
        />
        <StatCard
          title="Kam qolgan"
          value={loading ? '...' : (stats?.low_stock_count || 0)}
          icon={AlertTriangle}
          color={stats?.low_stock_count > 0 ? 'bg-red-500' : 'bg-gray-400'}
          to="/inventory"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Haftalik grafik */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-800">Haftalik sotuvlar</h2>
            <Link to="/reports" className="text-xs text-blue-600 hover:underline">Batafsil →</Link>
          </div>
          {weekly.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-gray-300 text-sm">
              Hali sotuv yo'q
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weekly} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="kun" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }}
                  tickFormatter={(v) => v === 0 ? '0' : (v / 1000000).toFixed(1) + 'M'} />
                <Tooltip
                  formatter={(v) => [fmt(v) + ' so\'m', 'Sotuv']}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="sotuv" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Tezkor amallar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Tezkor amallar</h2>
          <div className="space-y-3">
            {[
              { label: '🛒  Yangi sotuv',     to: '/pos',       color: 'bg-blue-600' },
              { label: '📦  Ombor kirim',      to: '/inventory', color: 'bg-purple-600' },
              { label: '👤  Mijoz qo\'shish',  to: '/customers', color: 'bg-green-600' },
              { label: '📊  Hisobotlar',        to: '/reports',   color: 'bg-orange-600' },
            ].map(({ label, to, color }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 w-full px-4 py-3 ${color} text-white rounded-xl text-sm font-medium hover:opacity-90 transition`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Kam qolgan tovarlar ogohlantirish */}
      {stats?.low_stock_count > 0 && (
        <Link to="/inventory?low_stock=true">
          <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 hover:bg-red-100 transition">
            <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
            <p className="text-red-600 text-sm font-medium">
              ⚠️ {stats.low_stock_count} ta tovar kam qolgan — omborni to'ldiring!
            </p>
          </div>
        </Link>
      )}
    </div>
  );
}
