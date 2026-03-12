import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: 'admin@easytrade.uz', password: 'admin123' });

  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <span className="text-3xl">🛒</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">EasyTrade</h1>
          <p className="text-gray-500 text-sm mt-1">Do'kon boshqaruv tizimi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="email@easytrade.uz"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parol</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Kirish...' : 'Kirish'}
          </button>
        </form>

        {/* Demo foydalanuvchilar */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs font-medium text-gray-500 mb-2">Demo foydalanuvchilar:</p>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between"><span>👑 Admin:</span><span>admin@easytrade.uz / admin123</span></div>
            <div className="flex justify-between"><span>📊 Menejer:</span><span>manager@easytrade.uz / manager123</span></div>
            <div className="flex justify-between"><span>💰 Kassir:</span><span>cashier@easytrade.uz / cashier123</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
