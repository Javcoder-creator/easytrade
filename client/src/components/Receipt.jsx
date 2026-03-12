// src/components/Receipt.jsx
// Chek komponenti — print uchun optimallashtirilgan

import { forwardRef } from 'react';

function fmt(n) { return new Intl.NumberFormat('uz-UZ').format(Math.round(n)); }

const PAYMENT_LABELS = {
  cash: 'Naqd pul', card: 'Karta',
  uzcard: 'UzCard', humo: 'Humo', transfer: "O'tkazma",
};

const Receipt = forwardRef(({ sale, shopName = "EasyTrade Do'kon" }, ref) => {
  const now = new Date();
  const subtotal = sale.items.reduce((s, i) => s + i.sale_price * i.qty, 0);

  return (
    <div
      ref={ref}
      style={{
        width: '80mm',
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#000',
        backgroundColor: '#fff',
        padding: '8px',
        lineHeight: '1.5',
      }}
    >
      {/* Do'kon nomi */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>🛒 {shopName}</div>
        <div style={{ fontSize: '10px' }}>Do'kon boshqaruv tizimi</div>
        <div style={{ fontSize: '10px' }}>Tel: +998 71 123 45 67</div>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />

      {/* Chek ma'lumotlari */}
      <div style={{ marginBottom: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Chek #:</span><span>{sale.id || Math.floor(Math.random() * 10000)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Kassir:</span><span>{sale.cashierName || 'Kassir'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Sana:</span>
          <span>{now.toLocaleDateString('uz-UZ')} {now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        {sale.customerName && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Mijoz:</span><span>{sale.customerName}</span>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />

      {/* Tovarlar */}
      <div style={{ marginBottom: '6px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>TOVARLAR:</div>
        {sale.items.map((item, i) => (
          <div key={i} style={{ marginBottom: '4px' }}>
            <div>{item.name}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '8px' }}>
              <span>{item.qty} {item.unit || 'dona'} × {fmt(item.sale_price)}</span>
              <span style={{ fontWeight: 'bold' }}>{fmt(item.sale_price * item.qty)}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />

      {/* Jami */}
      <div style={{ marginBottom: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Jami:</span><span>{fmt(subtotal)} so'm</span>
        </div>
        {sale.discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Chegirma ({sale.discount}%):</span>
            <span>-{fmt(subtotal * sale.discount / 100)} so'm</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
          <span>TO'LOV:</span><span>{fmt(sale.total)} so'm</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Usul:</span><span>{PAYMENT_LABELS[sale.paymentMethod] || sale.paymentMethod}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />

      {/* Pastki qism */}
      <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '8px' }}>
        <div>Xarid uchun rahmat! 🙏</div>
        <div>Qaytib keling!</div>
        <div style={{ marginTop: '4px' }}>* * * * * * * * * * * * *</div>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';
export default Receipt;