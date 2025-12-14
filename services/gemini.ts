import { GoogleGenAI, Type } from "@google/genai";
import { PromptGenerationResponse } from "../types";

// Initialize Gemini Client
// CRITICAL: The API key must be provided in the environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Breaks down a narrative into scenes and generates visual prompts for each.
 */
export const generatePromptsFromNarrative = async (narrative: string): Promise<PromptGenerationResponse> => {
  const modelId = 'gemini-2.5-flash';

  const systemInstruction = `
    You are an expert Visual Prompt Engineer specialized in Indonesian storytelling.
    Your task is to analyze a narrative text provided by the user and generate consistent image prompts + ONE CLICKBAIT THUMBNAIL prompt.

    **GLOBAL CONTEXT**:
    1. **SETTING**: The story takes place in **INDONESIA**.
    2. **CHARACTERS**: Characters must be visually described as **INDONESIAN/SOUTHEAST ASIAN**.
    3. **STYLE**: Realistic, Natural, High-quality Photography (NOT Cinematic).

    **SOCIAL STATUS & APPEARANCE RULES (CRITICAL)**:
    Analyze the character's socioeconomic status from the narrative and apply these visual rules STRICTLY:

    1. **IF POOR / LOWER CLASS / WORKING CLASS**:
       - **CONCEPT**: **"Sederhana" (Modest/Simple)**. Do NOT depict them as beggars ("Gembel") unless explicitly stated. They are struggling but dignified workers.
       - **APPEARANCE**: Sun-tanned skin (kulit sawo matang/gelap karena matahari), sweat (keringat kerja), tired eyes, natural hair. **NOT dirty/grimy**, just "rakyat kecil" vibe.
       - **CLOTHING**: **Functional & Inexpensive**.
          - **Daily Wear**: Faded t-shirt (kaos oblong pudar), worn jeans, cheap button-up shirt, rubber sandals (sandal jepit) or worn sneakers. Clothes are clean but old/faded.
          - **Professions (Check Narrative)**:
             - **Ojol (Driver)**: Green motorcycle taxi jacket & helmet.
             - **Satpam (Security)**: Blue or White security uniform, black field cap.
             - **Street Sweeper**: Orange vest or uniform, holding broom.
             - **Cleaning Service**: Blue/Grey uniform.
             - **Trader (Pedagang)**: Apron, simple t-shirt, towel around neck.
       - **ENVIRONMENT**: **"Rumah Petak / Kontrakan" (Small Rented Unit)**. 
          - **Structure**: Modest masonry house (Dinding Batako/Bata), **NOT a wooden shack/cardboard**.
          - **Details**: Painted walls (often light blue, green, or cream, slightly peeling/damp), ventilation blocks (roster) above windows/doors, cheap ceramic or smooth cement flooring.
          - **Vibe**: Compact living space (3x4m), motorcycle parked inside the living room, small terrace with drying rack, narrow alleyway (Gang), density but habitable.

    2. **IF RICH / KAYA**:
       - **APPEARANCE**: **Polished & Groomed**. Clean glowing skin, perfectly styled hair, white teeth, confident posture.
       - **CLOTHING**: **Luxury & Pristine**. High-end designer brands, tailored suits, silk dresses, crisp ironed shirts, gold jewelry, luxury watches.
       - **ENVIRONMENT**: **Luxury Mansion/Penthouse**. Marble floors, high ceilings, clean white walls, modern expensive furniture, spacious, bright lighting, manicured garden.

    3. **IF MIDDLE CLASS**:
       - **APPEARANCE**: Neat, average grooming.
       - **CLOTHING**: Casual modern (Jeans, Polo, T-shirt), clean but not luxurious.
       - **ENVIRONMENT**: Standard housing complex (Perumahan), tidy but simple.

    **CORE INSTRUCTIONS**:
    1. **DEFINE CHARACTERS FIRST**: Mentally assign specific visual traits to each character.
    2. **MAINTAIN CONSISTENCY**: You **MUST** repeat the full visual description of the character in **EVERY** single scene prompt. Do not refer to them as "he", "she", or "the man".
    3. **BREAK DOWN NARRATIVE (CRITICAL)**:
       - **STRICTLY SENTENCE-BY-SENTENCE**: Generate a separate visual prompt for **EACH SENTENCE**. Do not summarize paragraphs.

    **SPECIAL TASK: THUMBNAIL GENERATION**:
    - **STEP 1**: Create a short, punchy, **CLICKBAIT TEXT** in Indonesian based on the story (Max 4 words, All Caps). Examples: "TERUNGKAP!", "DIA SELINGKUH?!", "AZAB PEDIH!", "KAYA MENDADAK!".
    - **STEP 2**: Generate the visual prompt.
    - **CLICKBAIT STYLE**: 
      - Use keywords: "YouTube Thumbnail style", "Extreme close-up", "Hyper-expressive face (Shocked/Crying/Angry)", "High Contrast", "Oversaturated colors".
      - **TEXT PLACEMENT (CRITICAL)**: Include this exact instruction in the prompt: **"Large, bold, glowing yellow or white text overlay in the CENTER of the image saying '[YOUR_CLICKBAIT_TEXT_HERE]'"**.
      - **COMPOSITION**: Subject facing camera with extreme emotion, background slightly blurred or dramatic, leaving space in the center for the text.
      - **CONSISTENCY**: Use the EXACT SAME character descriptions as the scenes.

    **PROMPT CONSTRUCTION RULES**:
    - **Keywords to USE**: "realistic photo", "natural lighting", "raw photo", "candid", "4k", "highly detailed", "authentic", "Indonesian street photography", "tropical daylight".
    - **Keywords to AVOID**: "cinematic", "movie scene", "dramatic lighting", "film grain".
    - **Indonesian Elements**: Incorporate details like motorcycles (motor bebek), humid atmosphere, tropical plants, chipped paint on walls, ceramic tile floors, etc., where appropriate.

    Output strictly in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: narrative,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          thumbnail_prompt: { 
            type: Type.STRING, 
            description: "A high-impact, clickbait-style YouTube thumbnail visual prompt that includes an instruction for a central text overlay." 
          },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                original_text: { type: Type.STRING, description: "The exact sentence from the original narrative." },
                visual_prompt: { type: Type.STRING, description: "The detailed visual prompt for this specific sentence." }
              },
              required: ["original_text", "visual_prompt"]
            }
          }
        }
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as PromptGenerationResponse;
  }
  
  throw new Error("Failed to generate prompts from narrative.");
};

/**
 * Generates an image based on a specific prompt using Gemini.
 */
export const generateSceneImage = async (prompt: string): Promise<string> => {
  // Using gemini-2.5-flash-image for standard generation, usually sufficient and fast.
  const modelId = 'gemini-2.5-flash-image';

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
  });

  // Extract image from response
  // The response might contain text if it refused, but usually contains inlineData for image
  const candidates = response.candidates;
  if (candidates && candidates.length > 0) {
    const parts = candidates[0].content.parts;
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error("No image generated.");
};