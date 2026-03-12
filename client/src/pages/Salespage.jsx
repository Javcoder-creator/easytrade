import { useEffect, useState, useCallback } from 'react';
import { ShoppingBag, Eye, X, Calendar } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const PAYMENT_LABELS = {
  cash: '💵 Naqd', card: '💳 Karta',
  uzcard: '💳 UzCard', humo: '💳 Humo', transfer: '🏦 O\'tkazma',
};

function SaleDetailModal({ saleId, onClose }) {
  const [sale, setSale] = useState(null);
  const fmt = (n) => new Intl.NumberFormat('uz-UZ').format(Math.round(n));

  useEffect(() => {
    api.get(`/sales/${saleId}`).then(({ data }) => setSale(data.data));
  }, [saleId]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
          <h2 className="font-semibold text-gray-800">Sotuv #{saleId} tafsiloti</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {!sale ? (
          <div className="text-center py-12 text-gray-400">⏳ Yuklanmoqda...</div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Asosiy info */}
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Kassir', sale.cashier_name],
                ['Mijoz', sale.customer_name || 'Anonim'],
                ['To\'lov usuli', PAYMENT_LABELS[sale.payment_method] || sale.payment_method],
                ['Sana', new Date(sale.created_at).toLocaleString('uz-UZ')],
              ].map(([label, value]) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-gray-800">{value}</p>
                </div>
              ))}
            </div>

            {/* Tovarlar */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Tovarlar ro'yxati
              </div>
              <div className="divide-y divide-gray-50">
                {sale.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.quantity} {item.unit} × {fmt(item.price)} so'm</p>
                    </div>
                    <p className="font-bold text-gray-800 text-sm">{fmt(item.quantity * item.price)} so'm</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Jami */}
            <div className="border-t-2 border-gray-100 pt-3 space-y-2">
              {sale.discount > 0 && (
                <div className="flex justify-between text-sm text-red-400">
                  <span>Chegirma:</span><span>-{fmt(sale.discount)} so'm</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span>Jami:</span>
                <span className="text-blue-600">{fmt(sale.total)} so'm</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fmt = (n) => new Intl.NumberFormat('uz-UZ').format(Math.round(n));

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (fromDate) params.append('from_date', fromDate);
      if (toDate) params.append('to_date', toDate);
      const { data } = await api.get(`/sales?${params}`);
      setSales(data.data || []);
    } catch {
      toast.error('Sotuvlarni yuklashda xato');
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const totalRevenue = sales.reduce((s, sale) => s + parseFloat(sale.total), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sotuvlar tarixi</h1>
          <p className="text-gray-500 text-sm">{sales.length} ta sotuv · Jami: {fmt(totalRevenue)} so'm</p>
        </div>
      </div>

      {/* Sana filtr */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-xs text-gray-400">Dan:</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-xs text-gray-400">Gacha:</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="text-sm outline-none"
          />
        </div>
        {(fromDate || toDate) && (
          <button
            onClick={() => { setFromDate(''); setToDate(''); }}
            className="px-4 py-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
          >
            Tozalash ✕
          </button>
        )}
      </div>

      {/* Jadval */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">⏳ Yuklanmoqda...</div>
        ) : sales.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShoppingBag size={48} className="mx-auto mb-3 opacity-30" />
            <p>Sotuvlar topilmadi</p>
            <a href="/pos" className="mt-2 inline-block text-blue-600 text-sm hover:underline">Kassaga o'tish →</a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['#', 'Sana', 'Kassir', 'Mijoz', 'To\'lov', 'Summa', 'Status', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sales.map((sale, i) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {new Date(sale.created_at).toLocaleString('uz-UZ')}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{sale.cashier_name}</td>
                    <td className="px-4 py-3 text-gray-500">{sale.customer_name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs">
                        {PAYMENT_LABELS[sale.payment_method] || sale.payment_method}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-green-600">{fmt(sale.total)} so'm</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sale.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                      }`}>
                        {sale.status === 'completed' ? '✅ Bajarildi' : '↩️ Qaytarildi'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedSale(sale.id)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedSale && <SaleDetailModal saleId={selectedSale} onClose={() => setSelectedSale(null)} />}
    </div>
  );
}