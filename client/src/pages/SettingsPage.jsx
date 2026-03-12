import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Save, Store, User, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useSelector((s) => s.auth);
  const [shopName, setShopName] = useState("EasyTrade Do'kon");
  const [tab, setTab] = useState('shop');

  const handleSave = () => toast.success('Sozlamalar saqlandi ✅');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Sozlamalar</h1>

      <div className="flex gap-4">
        {/* Tabs */}
        <div className="w-48 space-y-1">
          {[
            { id: 'shop', label: "Do'kon ma'lumoti", icon: Store },
            { id: 'profile', label: 'Profil', icon: User },
            { id: 'security', label: 'Xavfsizlik', icon: Lock },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                tab === id ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          {tab === 'shop' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-800 mb-4">Do'kon ma'lumoti</h2>
              {[
                ["Do'kon nomi", shopName, setShopName, 'text'],
                ['Manzil', 'Toshkent, Uzbekistan', null, 'text'],
                ['Telefon', '+998 71 123 45 67', null, 'tel'],
                ['Soliq raqami', '123456789', null, 'text'],
              ].map(([label, val, setter, type]) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={type}
                    defaultValue={val}
                    onChange={setter ? (e) => setter(e.target.value) : undefined}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valyuta</label>
                <select className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="uzs">UZS — O'zbek so'mi</option>
                  <option value="usd">USD — AQSh dollari</option>
                </select>
              </div>
            </div>
          )}

          {tab === 'profile' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-800 mb-4">Profil ma'lumotlari</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{user?.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{user?.role} · {user?.email}</p>
                </div>
              </div>
              {[['Ism-sharif', user?.name, 'text'], ['Email', user?.email, 'email'], ['Telefon', '', 'tel']].map(([label, val, type]) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={type}
                    defaultValue={val || ''}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-800 mb-4">Parolni o'zgartirish</h2>
              {["Joriy parol", "Yangi parol", "Yangi parolni tasdiqlang"].map((label) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleSave}
            className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
          >
            <Save size={16} /> Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}
