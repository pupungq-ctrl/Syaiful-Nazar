import React, { useState } from 'react';
import { Scene } from '../types';
import { Image as ImageIcon, Loader2, RefreshCw, Check, Copy } from 'lucide-react';

interface SceneCardProps {
  scene: Scene;
  onGenerateImage: (id: string, prompt: string) => void;
  onUpdatePrompt: (id: string, newPrompt: string) => void;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, onGenerateImage, onUpdatePrompt }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localPrompt, setLocalPrompt] = useState(scene.visualPrompt);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scene.visualPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleGenerateClick = () => {
    // Commit any local edits before generating
    if (localPrompt !== scene.visualPrompt) {
      onUpdatePrompt(scene.id, localPrompt);
    }
    onGenerateImage(scene.id, localPrompt);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (localPrompt !== scene.visualPrompt) {
      onUpdatePrompt(scene.id, localPrompt);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-sm hover:shadow-md transition-shadow">
      
      {/* Left Side: Text Content */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Original Narrative Segment */}
        <div className="bg-slate-900/50 p-3 rounded-lg border-l-4 border-indigo-500">
          <span className="text-xs uppercase tracking-wider text-indigo-400 font-semibold mb-1 block">Narasi Asli</span>
          <p className="text-slate-300 italic text-sm leading-relaxed">"{scene.originalText}"</p>
        </div>

        {/* Generated Prompt */}
        <div className="flex-1 flex flex-col gap-2">
           <div className="flex items-center justify-between">
             <span className="text-xs uppercase tracking-wider text-purple-400 font-semibold">Visual Prompt (Editable)</span>
             <button 
               onClick={handleCopy}
               className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
               title="Copy prompt"
             >
               {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
               {copied ? "Copied" : "Copy"}
             </button>
           </div>
           
           <textarea 
             className="w-full flex-1 min-h-[120px] bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-y"
             value={localPrompt}
             onChange={(e) => setLocalPrompt(e.target.value)}
             onFocus={() => setIsEditing(true)}
             onBlur={handleBlur}
           />
        </div>

        {/* Action Button */}
        <button
          onClick={handleGenerateClick}
          disabled={scene.isGeneratingImage}
          className={`
            self-start flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${scene.isGeneratingImage 
              ? 'bg-slate-700 text-slate-400 cursor-wait' 
              : 'bg-slate-700 hover:bg-purple-600 text-white hover:shadow-lg'}
          `}
        >
          {scene.isGeneratingImage ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Image...</span>
            </>
          ) : (
            <>
              {scene.generatedImageUrl ? <RefreshCw className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
              <span>{scene.generatedImageUrl ? 'Regenerate Image' : 'Generate Visual Preview'}</span>
            </>
          )}
        </button>

        {scene.error && (
            <p className="text-red-400 text-xs mt-1">{scene.error}</p>
        )}
      </div>

      {/* Right Side: Image Preview */}
      <div className="w-full lg:w-[350px] aspect-square flex-shrink-0 bg-black rounded-xl overflow-hidden border border-slate-700 relative group">
        {scene.generatedImageUrl ? (
          <>
            <img 
              src={scene.generatedImageUrl} 
              alt="Generated scene" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
              <a 
                href={scene.generatedImageUrl} 
                download={`scene-${scene.id}.png`}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-medium border border-white/20"
              >
                Download Image
              </a>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-3 bg-slate-900/50">
            {scene.isGeneratingImage ? (
                <div className="relative">
                     <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
                     <Loader2 className="w-10 h-10 animate-spin text-purple-500 relative z-10" />
                </div>
            ) : (
                <>
                    <ImageIcon className="w-12 h-12 opacity-50" />
                    <span className="text-sm font-medium">No image generated yet</span>
                    <span className="text-xs text-slate-500 max-w-[200px] text-center">Click "Generate Visual Preview" to visualize this prompt</span>
                </>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default SceneCard;