import React, { useState } from 'react';
import { Image as ImageIcon, Loader2, RefreshCw, Check, Copy, Youtube } from 'lucide-react';

interface ThumbnailCardProps {
  prompt: string;
  onGenerateImage: (prompt: string) => Promise<void>;
  imageUrl?: string;
  isGenerating: boolean;
  error?: string;
}

const ThumbnailCard: React.FC<ThumbnailCardProps> = ({ prompt, onGenerateImage, imageUrl, isGenerating, error }) => {
  const [localPrompt, setLocalPrompt] = useState(prompt);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(localPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleGenerateClick = () => {
    onGenerateImage(localPrompt);
  };

  return (
    <div className="flex flex-col gap-6 bg-gradient-to-br from-indigo-900/40 to-slate-800 rounded-2xl p-6 border border-indigo-500/50 shadow-lg relative overflow-hidden">
      
      {/* Badge */}
      <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 z-10">
        <Youtube className="w-3 h-3" />
        THUMBNAIL
      </div>

      <div className="flex flex-col lg:flex-row gap-6 relative z-0">
        {/* Left Side: Prompt Editor */}
        <div className="flex-1 flex flex-col gap-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            Clickbait Thumbnail
          </h3>
          <p className="text-slate-400 text-sm">
            Prompt ini didesain khusus agar dramatis, ekspresif, dan menarik perhatian (High CTR), merangkum inti cerita.
          </p>

          <div className="flex-1 flex flex-col gap-2">
             <div className="flex items-center justify-between">
               <span className="text-xs uppercase tracking-wider text-indigo-400 font-semibold">Thumbnail Prompt</span>
               <button 
                 onClick={handleCopy}
                 className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
               >
                 {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                 {copied ? "Copied" : "Copy"}
               </button>
             </div>
             
             <textarea 
               className="w-full flex-1 min-h-[100px] bg-slate-900/80 border border-indigo-500/30 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-y shadow-inner"
               value={localPrompt}
               onChange={(e) => setLocalPrompt(e.target.value)}
             />
          </div>

          <button
            onClick={handleGenerateClick}
            disabled={isGenerating}
            className={`
              self-start flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg
              ${isGenerating 
                ? 'bg-slate-700 text-slate-400 cursor-wait' 
                : 'bg-red-600 hover:bg-red-500 text-white hover:shadow-red-600/25'}
            `}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Thumbnail...</span>
              </>
            ) : (
              <>
                {imageUrl ? <RefreshCw className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                <span>{imageUrl ? 'Regenerate Thumbnail' : 'Generate Thumbnail'}</span>
              </>
            )}
          </button>

          {error && (
              <p className="text-red-400 text-xs mt-1">{error}</p>
          )}
        </div>

        {/* Right Side: Large Preview (16:9) */}
        <div className="w-full lg:w-[480px] aspect-video flex-shrink-0 bg-black rounded-xl overflow-hidden border-2 border-slate-700 relative group shadow-2xl">
          {imageUrl ? (
            <>
              <img 
                src={imageUrl} 
                alt="Generated Thumbnail" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                <a 
                  href={imageUrl} 
                  download="thumbnail.png"
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-2 rounded-lg text-sm font-bold border border-white/20 shadow-xl"
                >
                  Download HD Thumbnail
                </a>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-3 bg-slate-900/50">
              {isGenerating ? (
                  <div className="relative">
                       <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
                       <Loader2 className="w-10 h-10 animate-spin text-red-500 relative z-10" />
                  </div>
              ) : (
                  <>
                      <Youtube className="w-16 h-16 opacity-30" />
                      <span className="text-sm font-medium">Thumbnail Preview Area</span>
                  </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThumbnailCard;