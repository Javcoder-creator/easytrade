import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Package, AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

function ProductModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState(
    product || { name: '', barcode: '', category_id: 1, unit: 'dona', cost_price: '', sale_price: '', min_quantity: 5, initial_quantity: 0 }
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (product) {
        await api.put(`/products/${product.id}`, form);
        toast.success('Tovar yangilandi ✅');
      } else {
        await api.post('/products', form);
        toast.success('Tovar qo\'shildi ✅');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xato yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const inp = (label, key, type = 'text', extra = {}) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        {...extra}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold text-gray-800">{product ? 'Tovarni tahrirlash' : 'Yangi tovar qo\'shish'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {inp('Tovar nomi *', 'name', 'text', { required: true, placeholder: 'Masalan: Cola 0.5L' })}
          {inp('Barkod', 'barcode', 'text', { placeholder: '4600000000001' })}
          <div className="grid grid-cols-2 gap-3">
            {inp('Tannarx (so\'m) *', 'cost_price', 'number', { required: true, min: 0, step: 100 })}
            {inp('Sotuv narxi (so\'m) *', 'sale_price', 'number', { required: true, min: 0, step: 100 })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">O'lchov birligi</label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {['dona', 'kg', 'litr', 'metr', 'juft'].map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
          <div className="grid grid-cols-2 gap-3">
            {inp('Min. zaxira *', 'min_quantity', 'number', { min: 0 })}
            {!product && inp('Boshlang\'ich miqdor', 'initial_quantity', 'number', { min: 0, step: 0.01, placeholder: '0' })}
          </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50">
              Bekor qilish
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
              {loading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'new' | product object

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products?search=${search}&limit=50`);
      setProducts(data.data || []);
    } catch {
      toast.error('Tovarlarni yuklashda xato');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" ni o'chirmoqchimisiz?`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Tovar o\'chirildi');
      fetchProducts();
    } catch {
      toast.error('O\'chirishda xato');
    }
  };

  const fmt = (n) => new Intl.NumberFormat('uz-UZ').format(n);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tovarlar</h1>
          <p className="text-gray-500 text-sm">{products.length} ta tovar topildi</p>
        </div>
        <button
          onClick={() => setModal('new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
        >
          <Plus size={16} /> Yangi tovar
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tovar nomi yoki barkod bo'yicha qidiring..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="animate-spin text-3xl mb-3">⏳</div>
            <p>Yuklanmoqda...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Tovar topilmadi</p>
            <button onClick={() => setModal('new')} className="mt-3 text-blue-600 text-sm hover:underline">
              Yangi tovar qo'shing →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['#', 'Nomi', 'Barkod', 'Narxi', 'Tannarx', 'Birlik', 'Status', 'Amallar'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p, i) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-gray-500 text-xs">{p.barcode || '—'}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">{fmt(p.sale_price)} so'm</td>
                    <td className="px-4 py-3 text-gray-500">{fmt(p.cost_price)} so'm</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">{p.unit}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                      }`}>
                        {p.is_active ? 'Faol' : 'Nofaol'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModal(p)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <ProductModal
          product={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchProducts}
        />
      )}
    </div>
  );
}
