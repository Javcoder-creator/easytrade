import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import {
  LayoutDashboard, ShoppingCart, Package,
  BarChart2, Settings, LogOut, Warehouse,
  ClipboardList, ChevronRight, UserCog
} from 'lucide-react';

const NAV = [
  { to: '/',          label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/pos',       label: 'Kassa (POS)',     icon: ShoppingCart },
  { to: '/sales',     label: 'Sotuvlar tarixi', icon: ClipboardList },
  { to: '/inventory', label: 'Ombor',           icon: Warehouse },
  { to: '/products',  label: 'Tovarlar',        icon: Package },
  { to: '/employees', label: 'Xodimlar',        icon: UserCog, adminOnly: true },
  { to: '/reports',   label: 'Hisobotlar',      icon: BarChart2 },
  { to: '/settings',  label: 'Sozlamalar',      icon: Settings },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };
  const visibleNav = NAV.filter((item) => !item.adminOnly || user?.role === 'admin');

  return (
    <aside className="fixed left-0 top-0 h-screen w-[250px] bg-gray-900 text-white flex flex-col z-50">
      <div className="flex items-center gap-3 p-5 border-b border-gray-700">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl">🛒</div>
        <div>
          <h1 className="font-bold text-lg leading-tight">EasyTrade</h1>
          <p className="text-gray-400 text-xs">v1.0.0</p>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {visibleNav.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                <span className="flex-1">{label}</span>
                <ChevronRight size={14} className="opacity-40" />
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-3 border-t border-gray-700">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut size={18} /> Chiqish
        </button>
      </div>
    </aside>
  );
}
