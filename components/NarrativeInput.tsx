import React, { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';

interface NarrativeInputProps {
  onGenerate: (narrative: string) => void;
  isProcessing: boolean;
}

const NarrativeInput: React.FC<NarrativeInputProps> = ({ onGenerate, isProcessing }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onGenerate(text);
    }
  };

  return (
    <div className="w-full bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        1. Masukkan Cerita Anda
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <textarea
            className="w-full h-40 bg-slate-900 text-slate-200 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all placeholder-slate-600"
            placeholder="Contoh: Di sebuah hutan futuristik yang dipenuhi tanaman bercahaya neon, seorang penjelajah siber menemukan reruntuhan kuno. Hujan turun rintik-rintik memantulkan cahaya hologram dari pelindung lengannya..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isProcessing}
          />
          <div className="absolute bottom-3 right-3 text-xs text-slate-500">
            {text.length} karakter
          </div>
        </div>
        <button
          type="submit"
          disabled={!text.trim() || isProcessing}
          className={`
            flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium transition-all transform active:scale-95
            ${!text.trim() || isProcessing 
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25'}
          `}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Menganalisa Cerita...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              <span>Generate Visual Prompts</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default NarrativeInput;