import React, { useRef, useState, useEffect } from 'react';
import { Pen, Type, Upload, RotateCcw, Check } from 'lucide-react';

interface SignaturePadProps {
  onSignatureReady: (dataUrl: string) => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSignatureReady }) => {
  const [tab, setTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedName, setTypedName] = useState('');
  const [penColor, setPenColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState<'cursive' | 'serif' | 'sans-serif'>('cursive');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (tab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.strokeStyle = penColor;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [tab, penColor]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e) {
      e.preventDefault();
    }
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e) {
      e.preventDefault();
    }
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      onSignatureReady(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSignatureReady('');
  };

  const handleApplyTyped = () => {
    if (!typedName.trim()) return;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 160;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = penColor;
    ctx.font = `italic 36px ${fontFamily === 'cursive' ? 'Brush Script MT, cursive' : fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);

    onSignatureReady(canvas.toDataURL('image/png'));
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onSignatureReady(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 mb-4 max-w-sm">
        <button
          type="button"
          onClick={() => setTab('draw')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            tab === 'draw' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Pen className="w-3.5 h-3.5" />
          <span>Draw</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('type')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            tab === 'type' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Type</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('upload')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            tab === 'upload' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload</span>
        </button>
      </div>

      {/* Draw Tab */}
      {tab === 'draw' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Sign with finger or mouse:</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {['#000000', '#1d4ed8', '#dc2626'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setPenColor(color)}
                    className={`w-5 h-5 rounded-full border-2 ${
                      penColor === color ? 'border-slate-800 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={clearCanvas}
                className="flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-red-600 bg-white rounded border border-slate-200"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          <div className="relative bg-white border border-slate-300 rounded-xl overflow-hidden shadow-inner touch-none">
            <canvas
              ref={canvasRef}
              width={420}
              height={140}
              className="w-full h-36 cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            <div className="absolute bottom-4 left-6 right-6 border-b border-dashed border-slate-300 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Type Tab */}
      {tab === 'type' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Enter your name:</label>
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-red-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Style:</span>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value as any)}
                className="text-xs border border-slate-200 bg-white rounded-lg p-1"
              >
                <option value="cursive">Signature Script</option>
                <option value="serif">Formal Serif</option>
                <option value="sans-serif">Modern Sans</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleApplyTyped}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Use Signature</span>
            </button>
          </div>

          {typedName && (
            <div className="p-4 bg-white border border-slate-200 rounded-xl text-center">
              <span
                style={{
                  fontFamily: fontFamily === 'cursive' ? 'Brush Script MT, cursive' : fontFamily,
                  fontSize: '28px',
                  color: penColor,
                  fontStyle: 'italic',
                }}
              >
                {typedName}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Upload Tab */}
      {tab === 'upload' && (
        <div className="text-center py-4">
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:border-red-400 rounded-xl text-xs font-bold text-slate-700 shadow-xs">
            <Upload className="w-4 h-4 text-red-600" />
            <span>Upload Signature Image (PNG / JPG)</span>
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
          <p className="mt-2 text-[11px] text-slate-400">
            For best results, use an image with a transparent background.
          </p>
        </div>
      )}
    </div>
  );
};
