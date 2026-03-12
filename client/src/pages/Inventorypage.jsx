import { useEffect, useState, useCallback } from 'react';
import { Search, Plus, AlertTriangle, Warehouse, PackagePlus } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

// Kirim modal
function AddStockModal({ onClose, onSaved }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ product_id: '', quantity: '', note: '' });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/products?limit=200').then(({ data }) => setProducts(data.data || []));
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product_id || !form.quantity) { toast.error('Tovar va miqdorni kiriting'); return; }
    setLoading(true);
    try {
      await api.post('/inventory/add', form);
      toast.success('Kirim muvaffaqiyatli amalga oshirildi ✅');
      onSaved(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xato yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <PackagePlus size={20} className="text-blue-600" /> Ombor kirim
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Tovar qidirish */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tovar *</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tovar nomini qidiring..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            <select
              value={form.product_id}
              onChange={(e) => setForm({ ...form, product_id: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              size={5}
            >
              <option value="">— Tanlang —</option>
              {filtered.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.unit}) — {new Intl.NumberFormat('uz-UZ').format(p.cost_price)} so'm
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Miqdor *</label>
            <input
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required min={0.01} step={0.01}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Izoh (ixtiyoriy)</label>
            <input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Masalan: Ta'minotchi nomidan"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50">
              Bekor
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
              {loading ? 'Saqlanmoqda...' : '✅ Kirim qilish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fmt = (n) => new Intl.NumberFormat('uz-UZ').format(Math.round(n));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [stockRes, statsRes] = await Promise.all([
        api.get(`/inventory?search=${search}&low_stock=${lowStock}&limit=100`),
        api.get('/inventory/stats'),
      ]);
      setItems(stockRes.data.data || []);
      setStats(statsRes.data.data);
    } catch {
      toast.error('Ma\'lumotlarni yuklashda xato');
    } finally {
      setLoading(false);
    }
  }, [search, lowStock]);

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ombor</h1>
          <p className="text-gray-500 text-sm">{items.length} ta tovar qoldig'i</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
        >
          <Plus size={16} /> Kirim qilish
        </button>
      </div>

      {/* Statistika */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Jami tovarlar',     value: fmt(stats.total_products) + ' ta', color: 'bg-blue-50 text-blue-600' },
            { label: 'Ombor qiymati',     value: fmt(stats.total_value) + ' so\'m', color: 'bg-green-50 text-green-600' },
            { label: 'Kam qolgan',        value: fmt(stats.low_stock_count) + ' ta', color: 'bg-red-50 text-red-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-gray-500 text-sm mb-1">{label}</p>
              <p className={`text-xl font-bold ${color.split(' ')[1]}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filtrlar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tovar nomini qidiring..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <button
          onClick={() => setLowStock(!lowStock)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition ${
            lowStock ? 'border-red-400 bg-red-50 text-red-500' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
          }`}
        >
          <AlertTriangle size={14} />
          Kam qolganlar
        </button>
      </div>

      {/* Jadval */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">⏳ Yuklanmoqda...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Warehouse size={48} className="mx-auto mb-3 opacity-30" />
            <p>Ma'lumot topilmadi</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['#', 'Tovar', 'Kategoriya', 'Birlik', 'Qoldiq', 'Min. zaxira', 'Narxi', 'Holat'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item, i) => {
                  const isLow = item.quantity <= item.min_quantity;
                  return (
                    <tr key={item.id} className={`hover:bg-gray-50 transition ${isLow ? 'bg-red-50/30' : ''}`}>
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{item.name}</p>
                        {item.barcode && <p className="text-xs text-gray-400 font-mono">{item.barcode}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{item.category_name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">{item.unit}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold text-base ${isLow ? 'text-red-500' : 'text-gray-800'}`}>
                          {fmt(item.quantity)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{fmt(item.min_quantity)}</td>
                      <td className="px-4 py-3 text-green-600 font-medium">{fmt(item.sale_price)} so'm</td>
                      <td className="px-4 py-3">
                        {isLow ? (
                          <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-500 rounded-full text-xs font-medium">
                            <AlertTriangle size={10} /> Kam
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">Yetarli</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <AddStockModal onClose={() => setShowModal(false)} onSaved={fetchData} />}
    </div>
  );
}
