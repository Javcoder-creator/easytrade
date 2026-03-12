import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, Tag, Calendar, Percent } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const TYPE_LABELS = {
  percent: { label: 'Foiz chegirma',  icon: '%',  color: 'bg-blue-50 text-blue-600' },
  fixed:   { label: 'Miqdor chegirma', icon: 'so\'m', color: 'bg-green-50 text-green-600' },
  bogo:    { label: '1 ta olsang 1 ta bepul', icon: '🎁', color: 'bg-purple-50 text-purple-600' },
};

function PromoModal({ promo, onClose, onSaved }) {
  const [form, setForm] = useState(promo || {
    name: '', description: '', type: 'percent',
    value: '', min_amount: 0, starts_at: '', ends_at: '', is_active: true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
      };
      if (promo) {
        await api.put(`/promotions/${promo.id}`, payload);
        toast.success('Aksiya yangilandi ✅');
      } else {
        await api.post('/promotions', payload);
        toast.success('Aksiya qo\'shildi ✅');
      }
      onSaved(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xato yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold">{promo ? 'Aksiyani tahrirlash' : 'Yangi aksiya'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aksiya nomi *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required placeholder="Masalan: Yozgi chegirma 20%"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Aksiya haqida qisqacha..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Aksiya turi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Turi *</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TYPE_LABELS).map(([id, { label, icon }]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setForm({ ...form, type: id })}
                  className={`py-2.5 px-2 rounded-xl text-xs font-medium border-2 transition text-center ${
                    form.type === id
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-100 bg-gray-50 text-gray-500'
                  }`}
                >
                  <div className="text-lg mb-0.5">{icon}</div>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {form.type === 'percent' ? 'Foiz (%)' : 'Miqdor (so\'m)'} *
              </label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                required min={0}
                max={form.type === 'percent' ? 100 : undefined}
                placeholder={form.type === 'percent' ? '20' : '10000'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min. sotuv (so'm)</label>
              <input
                type="number"
                value={form.min_amount}
                onChange={(e) => setForm({ ...form, min_amount: e.target.value })}
                min={0}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Boshlanish</label>
              <input
                type="datetime-local"
                value={form.starts_at || ''}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tugash</label>
              <input
                type="datetime-local"
                value={form.ends_at || ''}
                onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 rounded accent-blue-600"
            />
            <span className="text-sm text-gray-700">Aksiya faol</span>
          </label>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50">
              Bekor
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
              {loading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PromotionsPage() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fmt = (n) => new Intl.NumberFormat('uz-UZ').format(Math.round(n));

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/promotions');
      setPromos(data.data || []);
    } catch {
      toast.error('Aksiyalarni yuklashda xato');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPromos(); }, [fetchPromos]);

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" ni o'chirmoqchimisiz?`)) return;
    try {
      await api.delete(`/promotions/${id}`);
      toast.success('Aksiya o\'chirildi');
      fetchPromos();
    } catch { toast.error('O\'chirishda xato'); }
  };

  const isActive = (promo) => {
    if (!promo.is_active) return false;
    const now = new Date();
    if (promo.starts_at && new Date(promo.starts_at) > now) return false;
    if (promo.ends_at && new Date(promo.ends_at) < now) return false;
    return true;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Aksiyalar</h1>
          <p className="text-gray-500 text-sm">{promos.filter(isActive).length} ta faol aksiya</p>
        </div>
        <button
          onClick={() => setModal('new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
        >
          <Plus size={16} /> Yangi aksiya
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">⏳ Yuklanmoqda...</div>
      ) : promos.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Tag size={48} className="mx-auto mb-3 opacity-30" />
          <p>Aksiyalar yo'q</p>
          <button onClick={() => setModal('new')} className="mt-3 text-blue-600 text-sm hover:underline">
            Birinchi aksiyani qo'shing →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {promos.map((promo) => {
            const active = isActive(promo);
            const typeInfo = TYPE_LABELS[promo.type] || TYPE_LABELS.percent;
            return (
              <div key={promo.id}
                className={`bg-white rounded-2xl p-5 border shadow-sm transition ${
                  active ? 'border-green-200' : 'border-gray-100 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {active ? '🟢 Faol' : '⚫ Nofaol'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800">{promo.name}</h3>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button onClick={() => setModal(promo)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(promo.id, promo.name)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Chegirma qiymati */}
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {promo.type === 'percent' ? `${promo.value}%` :
                   promo.type === 'fixed' ? `${fmt(promo.value)} so'm` : '🎁 1+1'}
                </div>

                {promo.description && (
                  <p className="text-gray-500 text-sm mb-2">{promo.description}</p>
                )}

                <div className="space-y-1 text-xs text-gray-400">
                  {promo.min_amount > 0 && (
                    <p>Min. sotuv: {fmt(promo.min_amount)} so'm</p>
                  )}
                  {promo.starts_at && (
                    <p className="flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(promo.starts_at).toLocaleDateString('uz-UZ')} —
                      {promo.ends_at ? new Date(promo.ends_at).toLocaleDateString('uz-UZ') : '∞'}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <PromoModal
          promo={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchPromos}
        />
      )}
    </div>
  );
}