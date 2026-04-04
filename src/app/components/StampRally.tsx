import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../store';
import { Upload, X, Eye } from 'lucide-react';
import { toast } from 'sonner';

const GRID_SIZE = 30; // 30 stamps per card
const COLS = 6;

export function StampRally() {
  const { stamps, stampCardImage, setStampCardImage } = useAppStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const filledCount = stamps.length;
  const currentPage = Math.floor(filledCount / GRID_SIZE);
  const remainder = filledCount % GRID_SIZE;
  const currentPageStamps = filledCount > 0 && remainder === 0 ? GRID_SIZE : remainder;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (typeof dataUrl === 'string') {
        setStampCardImage(dataUrl);
      }
    };
    reader.onerror = () => toast.error('画像の読み込みに失敗しました');
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sky-900">スタンプラリー</h2>
        <span className="text-sky-500/70" style={{ fontSize: '0.85rem' }}>
          合計 {filledCount} スタンプ
        </span>
      </div>

      {/* Stamp Card */}
      <div className="relative rounded-2xl border border-sky-200 overflow-hidden bg-white">
        {/* Background image */}
        {stampCardImage && (
          <img
            src={stampCardImage}
            alt="カスタムカード"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}

        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sky-600" style={{ fontSize: '0.85rem' }}>
              カード #{currentPage + 1}
            </span>
            <span className="text-sky-400/60" style={{ fontSize: '0.8rem' }}>
              {currentPageStamps} / {GRID_SIZE}
            </span>
          </div>

          {/* Stamp Grid */}
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
          >
            {[...Array(GRID_SIZE)].map((_, i) => {
              const isFilled = i < currentPageStamps;
              return (
                <motion.div
                  key={i}
                  className={`aspect-square rounded-full flex items-center justify-center ${
                    isFilled
                      ? 'bg-sky-100 border-2 border-sky-400'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                  initial={false}
                  animate={isFilled ? { scale: [0.8, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {isFilled && (
                    <div className="w-3/5 h-3/5 rounded-full border-2 border-sky-400 flex items-center justify-center">
                      <div className="w-2/5 h-2/5 rounded-full bg-sky-400" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upload Custom Card */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 border border-sky-200 rounded-lg text-sky-600 hover:bg-sky-50 transition-colors"
            style={{ fontSize: '0.85rem' }}
          >
            <Upload className="w-4 h-4" /> カード画像をアップロード
          </button>
          {stampCardImage && (
            <>
              <button
                aria-label="プレビューを切り替え"
                onClick={() => setPreviewMode(!previewMode)}
                className="p-2 border border-sky-200 rounded-lg text-sky-500 hover:bg-sky-50"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                aria-label="カード画像を削除"
                onClick={() => setStampCardImage(null)}
                className="p-2 border border-red-200 rounded-lg text-red-400 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

        {previewMode && stampCardImage && (
          <div className="rounded-xl border border-sky-200 overflow-hidden">
            <p className="p-3 text-sky-500/70 bg-sky-50" style={{ fontSize: '0.8rem' }}>
              プレビュー: スタンプとの重なり具合を確認
            </p>
            <div className="relative" style={{ height: 300 }}>
              <img src={stampCardImage} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 p-6">
                <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
                  {[...Array(GRID_SIZE)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-full border-2 border-sky-400/50 bg-sky-200/30 flex items-center justify-center"
                    >
                      <div className="w-3/5 h-3/5 rounded-full border-2 border-sky-400/50 flex items-center justify-center">
                        <div className="w-2/5 h-2/5 rounded-full bg-sky-400/50" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Past Cards */}
      {currentPage > 0 && (
        <div className="space-y-2">
          <h3 className="text-sky-700">過去のカード</h3>
          <div className="grid grid-cols-3 gap-2">
            {[...Array(currentPage)].map((_, i) => (
              <div key={i} className="bg-sky-50 rounded-lg p-3 text-center border border-sky-100">
                <p className="text-sky-600" style={{ fontSize: '0.8rem' }}>カード #{i + 1}</p>
                <p className="text-sky-400" style={{ fontSize: '0.75rem' }}>{GRID_SIZE}/{GRID_SIZE} ✓</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
