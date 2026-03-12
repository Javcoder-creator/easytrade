// src/components/BarcodeScanner.jsx
// Kamera orqali barkod o'qish

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { X, Camera, AlertCircle } from 'lucide-react';

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(true);
  const [lastCode, setLastCode] = useState('');

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    reader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
      if (result) {
        const code = result.getText();
        if (code !== lastCode) {
          setLastCode(code);
          setScanning(false);
          // Vibrate (mobil qurilmalarda)
          if (navigator.vibrate) navigator.vibrate(100);
          onDetected(code);
          // 2 soniyadan keyin qayta skanerlash
          setTimeout(() => { setLastCode(''); setScanning(true); }, 2000);
        }
      }
      if (err && err.name !== 'NotFoundException') {
        // NotFoundException normal — kod topilmadi degani
      }
    }).catch((e) => {
      setError('Kameraga ruxsat berilmadi. Brauzer sozlamalarini tekshiring.');
    });

    return () => {
      reader.reset();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold flex items-center gap-2">
            <Camera size={18} className="text-blue-600" />
            Barkod skaner
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Kamera */}
        <div className="relative bg-black" style={{ aspectRatio: '4/3' }}>
          <video ref={videoRef} className="w-full h-full object-cover" />

          {/* Scan chizig'i animatsiya */}
          {scanning && !error && (
            <>
              {/* To'rtburchak ramka */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-48 h-48">
                  {/* Burchaklar */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />
                  {/* Scan chizig'i */}
                  <div
                    className="absolute left-0 right-0 h-0.5 bg-blue-400 opacity-80"
                    style={{
                      animation: 'scan 2s linear infinite',
                      top: '50%',
                      boxShadow: '0 0 8px #60a5fa',
                    }}
                  />
                </div>
              </div>
              <style>{`
                @keyframes scan {
                  0% { transform: translateY(-60px); }
                  50% { transform: translateY(60px); }
                  100% { transform: translateY(-60px); }
                }
              `}</style>
            </>
          )}

          {/* Muvaffaqiyatli skanerlandi */}
          {!scanning && (
            <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
              <div className="bg-green-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                ✅ Topildi!
              </div>
            </div>
          )}

          {/* Xato */}
          {error && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4">
              <div className="text-center text-white">
                <AlertCircle size={40} className="mx-auto mb-2 text-red-400" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Pastki qism */}
        <div className="p-4 text-center">
          <p className="text-sm text-gray-500">
            {error
              ? 'Kameraga ruxsat bering va qayta urinib ko\'ring'
              : scanning
              ? 'Barkodni kamera oldiga tuting'
              : 'Skanerlandi! ✅'}
          </p>
          <button
            onClick={onClose}
            className="mt-3 px-6 py-2 border border-gray-300 rounded-xl text-sm text-gray-500 hover:bg-gray-50"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}