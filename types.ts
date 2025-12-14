export interface Scene {
  id: string;
  originalText: string;
  visualPrompt: string;
  generatedImageUrl?: string;
  isGeneratingImage: boolean;
  error?: string;
}

export interface PromptGenerationResponse {
  thumbnail_prompt: string;
  scenes: {
    original_text: string;
    visual_prompt: string;
  }[];
}