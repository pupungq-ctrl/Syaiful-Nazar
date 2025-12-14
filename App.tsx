import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import NarrativeInput from './components/NarrativeInput';
import SceneCard from './components/SceneCard';
import ThumbnailCard from './components/ThumbnailCard';
import { Scene } from './types';
import { generatePromptsFromNarrative, generateSceneImage } from './services/gemini';
import { Film } from 'lucide-react';

const App: React.FC = () => {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [thumbnailPrompt, setThumbnailPrompt] = useState<string>("");
  const [thumbnailImage, setThumbnailImage] = useState<string | undefined>(undefined);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [thumbnailError, setThumbnailError] = useState<string | undefined>(undefined);

  const [isProcessingText, setIsProcessingText] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleGeneratePrompts = async (narrative: string) => {
    setIsProcessingText(true);
    setGlobalError(null);
    setScenes([]); // Clear previous results
    setThumbnailPrompt("");
    setThumbnailImage(undefined);

    try {
      const response = await generatePromptsFromNarrative(narrative);
      
      // Set Thumbnail Prompt
      setThumbnailPrompt(response.thumbnail_prompt);

      // Set Scenes
      const newScenes: Scene[] = response.scenes.map((item, index) => ({
        id: `scene-${Date.now()}-${index}`,
        originalText: item.original_text,
        visualPrompt: item.visual_prompt,
        isGeneratingImage: false,
      }));

      setScenes(newScenes);
    } catch (error: any) {
      console.error("Error processing narrative:", error);
      setGlobalError(error.message || "Gagal memproses narasi. Pastikan API Key valid.");
    } finally {
      setIsProcessingText(false);
    }
  };

  const handleGenerateThumbnail = useCallback(async (prompt: string) => {
    setIsGeneratingThumbnail(true);
    setThumbnailError(undefined);
    try {
      const imageUrl = await generateSceneImage(prompt);
      setThumbnailImage(imageUrl);
    } catch (error: any) {
      console.error("Error generating thumbnail:", error);
      setThumbnailError("Gagal membuat thumbnail.");
    } finally {
      setIsGeneratingThumbnail(false);
    }
  }, []);

  const handleGenerateImage = useCallback(async (id: string, prompt: string) => {
    setScenes(prev => prev.map(scene => 
      scene.id === id ? { ...scene, isGeneratingImage: true, error: undefined } : scene
    ));

    try {
      const imageUrl = await generateSceneImage(prompt);
      setScenes(prev => prev.map(scene => 
        scene.id === id ? { ...scene, isGeneratingImage: false, generatedImageUrl: imageUrl } : scene
      ));
    } catch (error: any) {
      console.error(`Error generating image for scene ${id}:`, error);
      setScenes(prev => prev.map(scene => 
        scene.id === id ? { ...scene, isGeneratingImage: false, error: "Gagal membuat gambar. Coba lagi." } : scene
      ));
    }
  }, []);

  const handleUpdatePrompt = useCallback((id: string, newPrompt: string) => {
    setScenes(prev => prev.map(scene => 
      scene.id === id ? { ...scene, visualPrompt: newPrompt } : scene
    ));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a]">
      <Header />
      
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex flex-col gap-8">
        
        {/* Intro / Input Section */}
        <section className="max-w-3xl mx-auto w-full">
           <div className="mb-8 text-center sm:text-left">
             <h2 className="text-3xl font-bold text-white mb-2">Ubah Cerita Jadi Visual</h2>
             <p className="text-slate-400">
               Masukkan cerita pendek, skenario, atau deskripsi mimpi Anda. 
               AI akan memecahnya menjadi adegan dan membuat prompt visual + Thumbnail YouTube.
             </p>
           </div>
           
           <NarrativeInput onGenerate={handleGeneratePrompts} isProcessing={isProcessingText} />
           
           {globalError && (
             <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-200 text-sm text-center">
               {globalError}
             </div>
           )}
        </section>

        {/* Results Section */}
        {(scenes.length > 0 || thumbnailPrompt) && (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col gap-8">
            
            {/* Thumbnail Section */}
            {thumbnailPrompt && (
               <ThumbnailCard 
                  prompt={thumbnailPrompt}
                  onGenerateImage={handleGenerateThumbnail}
                  imageUrl={thumbnailImage}
                  isGenerating={isGeneratingThumbnail}
                  error={thumbnailError}
               />
            )}

            {/* Scenes Header */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <Film className="w-6 h-6 text-indigo-400" />
              <h3 className="text-xl font-bold text-white">
                Storyboard ({scenes.length} Scenes)
              </h3>
            </div>

            {/* Scenes List */}
            <div className="flex flex-col gap-6">
              {scenes.map((scene) => (
                <SceneCard 
                  key={scene.id} 
                  scene={scene} 
                  onGenerateImage={handleGenerateImage}
                  onUpdatePrompt={handleUpdatePrompt}
                />
              ))}
            </div>
          </section>
        )}
      </main>
      
      <footer className="py-8 text-center text-slate-600 text-sm">
        <p>&copy; {new Date().getFullYear()} Visual Narrative Studio. Built with React & Gemini.</p>
      </footer>
    </div>
  );
};

export default App;