import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, Trash2, Plus, Minus, ShoppingCart, CreditCard, Banknote, CheckCircle, Camera, Package } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const PAYMENT_METHODS = [
  { id: 'cash',   label: 'Naqd',   icon: '💵' },
  { id: 'card',   label: 'Karta',  icon: '💳' },
  { id: 'uzcard', label: 'UzCard', icon: '💳' },
  { id: 'humo',   label: 'Humo',   icon: '💳' },
];

function fmt(n) { return new Intl.NumberFormat('uz-UZ').format(Math.round(n)); }

// Chek chiqarish — window.print() orqali
function printReceipt(sale, user) {
  const now = new Date();
  const rows = sale.items.map((i) => `
    <tr>
      <td style="padding:3px 0">${i.name}</td>
      <td style="text-align:right;padding:3px 0">${i.qty} × ${fmt(i.sale_price)}</td>
      <td style="text-align:right;padding:3px 0;font-weight:bold">${fmt(i.sale_price * i.qty)}</td>
    </tr>
  `).join('');

  const html = `
    <html><head><title>Chek</title>
    <style>
      body { font-family: monospace; font-size: 12px; width: 80mm; margin: 0 auto; padding: 8px; }
      h2 { text-align:center; margin:4px 0; font-size:16px; }
      .center { text-align:center; }
      .divider { border-top: 1px dashed #000; margin: 6px 0; }
      table { width:100%; border-collapse:collapse; }
      .total { font-size:14px; font-weight:bold; }
      @media print { @page { margin: 0; size: 80mm auto; } }
    </style>
    </head><body>
    <h2>🛒 EasyTrade</h2>
    <p class="center" style="margin:2px 0;font-size:10px">Do'kon boshqaruv tizimi</p>
    <div class="divider"></div>
    <table>
      <tr><td>Chek #:</td><td style="text-align:right">${sale.id || '—'}</td></tr>
      <tr><td>Kassir:</td><td style="text-align:right">${user?.name || '—'}</td></tr>
      <tr><td>Sana:</td><td style="text-align:right">${now.toLocaleDateString('uz-UZ')} ${now.toLocaleTimeString('uz-UZ',{hour:'2-digit',minute:'2-digit'})}</td></tr>
    </table>
    <div class="divider"></div>
    <table>${rows}</table>
    <div class="divider"></div>
    <table>
      <tr><td>Jami:</td><td style="text-align:right">${fmt(sale.subtotal)} so'm</td></tr>
      ${sale.discountAmt > 0 ? `<tr><td>Chegirma:</td><td style="text-align:right">-${fmt(sale.discountAmt)} so'm</td></tr>` : ''}
      <tr class="total"><td>TO'LOV:</td><td style="text-align:right">${fmt(sale.total)} so'm</td></tr>
      <tr><td>Usul:</td><td style="text-align:right">${sale.paymentLabel}</td></tr>
    </table>
    <div class="divider"></div>
    <p class="center">Xarid uchun rahmat! 🙏</p>
    <p class="center">Qaytib keling!</p>
    <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
    </body></html>
  `;

  const win = window.open('', '_blank', 'width=400,height=600');
  win.document.write(html);
  win.document.close();
}

export default function POSPage() {
  const { user } = useSelector((s) => s.auth);
  const [allProducts, setAllProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [successSale, setSuccessSale] = useState(null);

  // Barcha tovarlarni yuklash
  useEffect(() => {
    api.get('/products?limit=200').then(({ data }) => {
      setAllProducts(data.data || []);
    }).catch(() => {});
  }, []);

  // Filterlangan tovarlar
  const filtered = search.trim()
    ? allProducts.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode && p.barcode.includes(search))
      )
    : allProducts;

  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    toast.success(`${product.name} qo'shildi`, { duration: 800, position: 'bottom-center' });
  }, []);

  // Barkod kiritilsa avtomatik qo'shish
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    // 8-13 xonali raqam = barkod
    if (/^\d{8,13}$/.test(val)) {
      const found = allProducts.find((p) => p.barcode === val);
      if (found) {
        addToCart(found);
        setSearch('');
      }
    }
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev.map((i) => i.id === id ? { ...i, qty: Math.max(0.1, parseFloat((i.qty + delta).toFixed(2))) } : i)
        .filter((i) => i.qty > 0)
    );
  };

  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const clearCart  = () => { setCart([]); setDiscount(0); };

  const subtotal    = cart.reduce((s, i) => s + i.sale_price * i.qty, 0);
  const discountAmt = subtotal * (discount / 100);
  const total       = Math.max(0, subtotal - discountAmt);

  const handleSale = async () => {
    if (cart.length === 0) { toast.error('Savatcha bo\'sh!'); return; }
    setProcessing(true);
    try {
      const { data } = await api.post('/sales', {
        items: cart.map((i) => ({ product_id: i.id, quantity: i.qty, price: i.sale_price })),
        payment_method: payMethod,
        discount: discountAmt,
        warehouse_id: 1,
      });
      const payLabel = PAYMENT_METHODS.find((m) => m.id === payMethod)?.label || payMethod;
      setSuccessSale({
        id: data.data?.id,
        items: cart,
        subtotal,
        discountAmt,
        total,
        paymentLabel: payLabel,
      });
      // Tovarlar qoldiqlarini yangilash
      api.get('/products?limit=200').then(({ data }) => setAllProducts(data.data || []));
      clearCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sotuvda xato yuz berdi');
    } finally {
      setProcessing(false);
    }
  };

  // --- Muvaffaqiyatli sotuv ekrani ---
  if (successSale) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-sm w-full">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sotuv muvaffaqiyatli!</h2>
          <p className="text-3xl font-bold text-green-500 mb-1">{fmt(successSale.total)} so'm</p>
          <p className="text-gray-400 text-sm mb-6">{successSale.items.length} ta mahsulot</p>
          <div className="flex gap-3">
            <button
              onClick={() => printReceipt(successSale, user)}
              className="flex-1 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition"
            >
              🖨️ Chek
            </button>
            <button
              onClick={() => setSuccessSale(null)}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
            >
              ✅ Yangi sotuv
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Asosiy POS ekrani ---
  return (
    <div className="flex gap-4 h-[calc(100vh-3rem)]">

      {/* ===== CHAP — Tovarlar ===== */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <h1 className="text-xl font-bold text-gray-800 flex-shrink-0">🛒 Kassa (POS)</h1>

        {/* Qidiruv */}
        <div className="relative flex-shrink-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={handleSearchChange}
            placeholder="Tovar nomi yoki barkodini kiriting / skaner qiling..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Tovarlar grid */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300">
              <Package size={48} className="mb-3" />
              <p className="text-sm">Tovar topilmadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pb-2">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="bg-white rounded-xl p-3 border border-gray-100 hover:border-blue-300 hover:shadow-md text-left transition group"
                >
                  <div className="w-full aspect-square bg-blue-50 rounded-lg flex items-center justify-center text-3xl mb-2 group-hover:bg-blue-100 transition">
                    📦
                  </div>
                  <p className="text-xs font-medium text-gray-800 truncate leading-snug">{p.name}</p>
                  <p className="text-sm font-bold text-blue-600 mt-1">{fmt(p.sale_price)} so'm</p>
                  <p className={`text-xs mt-0.5 ${p.quantity <= 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    Qoldiq: {p.quantity} {p.unit}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== O'NG — Savatcha + To'lov ===== */}
      <div className="w-72 flex flex-col gap-3 flex-shrink-0">

        {/* Savatcha */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-700 flex items-center gap-2">
              <ShoppingCart size={16} /> Savatcha
              {cart.length > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </h2>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-500">
                Tozalash
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 py-8">
                <ShoppingCart size={36} className="mb-2" />
                <p className="text-xs">Tovar tanlang</p>
              </div>
            ) : cart.map((item) => (
              <div key={item.id} className="flex items-center gap-2 px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{fmt(item.sale_price)} so'm</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => updateQty(item.id, -1)}
                    className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200 text-xs">
                    <Minus size={10} />
                  </button>
                  <span className="w-6 text-center text-xs font-bold">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)}
                    className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200">
                    <Plus size={10} />
                  </button>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs font-bold text-gray-700">{fmt(item.sale_price * item.qty)}</p>
                  <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* To'lov paneli */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
          {/* Jami */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Jami:</span><span>{fmt(subtotal)} so'm</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">Chegirma:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-12 px-1.5 py-1 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min={0} max={100}
                />
                <span className="text-gray-400 text-xs">%</span>
              </div>
            </div>
            {discountAmt > 0 && (
              <div className="flex justify-between text-red-400 text-sm">
                <span>Chegirma:</span><span>-{fmt(discountAmt)} so'm</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100">
              <span>TO'LOV:</span>
              <span className="text-blue-600">{fmt(total)} so'm</span>
            </div>
          </div>

          {/* To'lov usuli */}
          <div className="grid grid-cols-2 gap-1.5">
            {PAYMENT_METHODS.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setPayMethod(id)}
                className={`py-2 rounded-lg text-xs font-medium border-2 transition ${
                  payMethod === id
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Sotuv tugmasi */}
          <button
            onClick={handleSale}
            disabled={processing || cart.length === 0}
            className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-200 text-sm"
          >
            {processing ? '⏳ Saqlanmoqda...' : `✅ To'lov: ${fmt(total)} so'm`}
          </button>
        </div>
      </div>
    </div>
  );
}
