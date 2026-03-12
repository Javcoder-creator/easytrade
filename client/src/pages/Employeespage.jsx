import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, Users, Shield, User } from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ROLES = [
  { id: 'admin',   label: 'Admin',   color: 'bg-red-50 text-red-600',     icon: '👑' },
  { id: 'manager', label: 'Menejer', color: 'bg-blue-50 text-blue-600',   icon: '📊' },
  { id: 'cashier', label: 'Kassir',  color: 'bg-green-50 text-green-600', icon: '💰' },
];

function EmployeeModal({ employee, onClose, onSaved }) {
  const [form, setForm] = useState(
    employee || { name: '', email: '', password: '', role: 'cashier', phone: '' }
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (employee) {
        const updateData = { ...form };
        if (!updateData.password) delete updateData.password;
        await api.put(`/employees/${employee.id}`, updateData);
        toast.success('Xodim yangilandi ✅');
      } else {
        await api.post('/employees', form);
        toast.success('Xodim qo\'shildi ✅');
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
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold">{employee ? 'Xodimni tahrirlash' : 'Yangi xodim qo\'shish'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {[
            ['Ism-sharif *',  'name',  'text',  true,  'Aziz Karimov'],
            ['Email *',       'email', 'email', true,  'aziz@easytrade.uz'],
            ['Telefon',       'phone', 'tel',   false, '+998 90 123 45 67'],
          ].map(([label, key, type, req, ph]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                value={form[key] || ''}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={req}
                placeholder={ph}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parol {employee ? '(o\'zgartirish uchun kiriting)' : '*'}
            </label>
            <input
              type="password"
              value={form.password || ''}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!employee}
              placeholder="Kamida 6 ta belgi"
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lavozim *</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(({ id, label, icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setForm({ ...form, role: id })}
                  className={`py-2.5 rounded-xl text-sm font-medium border-2 transition ${
                    form.role === id
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-100 bg-gray-50 text-gray-500'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
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

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [filterRole, setFilterRole] = useState('');
  const { user: currentUser } = useSelector((s) => s.auth);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterRole ? `?role=${filterRole}` : '';
      const { data } = await api.get(`/employees${params}`);
      setEmployees(data.data || []);
    } catch {
      toast.error('Xodimlarni yuklashda xato');
    } finally {
      setLoading(false);
    }
  }, [filterRole]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleDelete = async (id, name) => {
    if (id === currentUser?.id) { toast.error('O\'zingizni o\'chira olmaysiz!'); return; }
    if (!confirm(`"${name}" ni o'chirmoqchimisiz?`)) return;
    try {
      await api.delete(`/employees/${id}`);
      toast.success('Xodim o\'chirildi');
      fetchEmployees();
    } catch {
      toast.error('O\'chirishda xato');
    }
  };

  const getRoleBadge = (role) => {
    const r = ROLES.find((r) => r.id === role);
    return r ? (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.color}`}>
        {r.icon} {r.label}
      </span>
    ) : null;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Xodimlar</h1>
          <p className="text-gray-500 text-sm">{employees.length} ta xodim</p>
        </div>
        <button
          onClick={() => setModal('new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
        >
          <Plus size={16} /> Yangi xodim
        </button>
      </div>

      {/* Role filterlari */}
      <div className="flex gap-2 mb-4">
        {[{ id: '', label: 'Barchasi' }, ...ROLES].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilterRole(id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filterRole === id
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Kartochkalar */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">⏳ Yuklanmoqda...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <div key={emp.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {emp.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {emp.name}
                      {emp.id === currentUser?.id && (
                        <span className="ml-1 text-xs text-blue-500">(siz)</span>
                      )}
                    </p>
                    {getRoleBadge(emp.role)}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setModal(emp)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(emp.id, emp.name)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="space-y-1 text-sm text-gray-500">
                <p>📧 {emp.email}</p>
                {emp.phone && <p>📞 {emp.phone}</p>}
                <p className="text-xs text-gray-400">
                  Qo'shilgan: {new Date(emp.created_at).toLocaleDateString('uz-UZ')}
                </p>
              </div>
            </div>
          ))}

          {employees.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <Users size={48} className="mx-auto mb-3 opacity-30" />
              <p>Xodim topilmadi</p>
            </div>
          )}
        </div>
      )}

      {modal && (
        <EmployeeModal
          employee={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchEmployees}
        />
      )}
    </div>
  );
}