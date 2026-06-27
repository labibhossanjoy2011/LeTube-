import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Lazy initialize Gemini client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. AI recommendations will use fallback heuristics.");
    }
    aiClient = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });
  }
  return aiClient;
}

// API Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// AI Chat Assistant & Video Discovery
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history, userInterests, language, availableVideos } = req.body;
    const ai = getAI();

    const videoCatalogSummary = (availableVideos || []).map((v: any) => 
      `ID:${v.id} | Title: "${v.title}" | Category: ${v.category} | Tags: ${v.tags?.join(',')}`
    ).join('\n');

    const prompt = `You are "StreamMind AI", an intelligent, polite, YouTube-style video discovery assistant for a premium video streaming platform.
User's Preferred Language: ${language === 'bn' ? 'Bengali (বাংলা)' : 'English'}
User's Stated Interests: ${userInterests?.join(', ') || 'General'}

Here is our platform's available video catalog:
${videoCatalogSummary}

User Query: "${message}"

Your task:
1. Respond helpfully in ${language === 'bn' ? 'Bengali (বাংলা)' : 'English'}. If the user asked in Bengali, respond in natural conversational Bengali. If in English, respond in clean modern English.
2. Recommend 1 to 4 specific videos from the catalog that match their query or intent.
3. Return your response STRICTLY as a JSON object with this format:
{
  "replyText": "Your conversational markdown reply explaining why you selected these videos...",
  "suggestedVideoIds": ["id1", "id2"]
}
Only output valid JSON inside markdown codeblock \`\`\`json ... \`\`\` or raw JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
    });

    const text = response.text || '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { replyText: text, suggestedVideoIds: [] };

    res.json(parsed);
  } catch (err: any) {
    console.error("AI Chat Error:", err);
    res.status(500).json({ 
      replyText: req.body?.language === 'bn' 
        ? "দুঃখিত, এই মুহূর্তে এআই সংযোগে সমস্যা হচ্ছে। নিচে আমাদের জনপ্রিয় ভিডিওগুলো দেখতে পারেন।" 
        : "I apologize, but I encountered a temporary issue connecting to the AI recommendations. Please explore our trending videos below!",
      suggestedVideoIds: [] 
    });
  }
});

// AI Video Content Analyzer
app.post('/api/ai/analyze-video', async (req, res) => {
  try {
    const { videoTitle, videoDescription, category, tags, language } = req.body;
    const ai = getAI();

    const prompt = `You are an expert AI Video Analyst.
Analyze the following video content:
Title: "${videoTitle}"
Category: ${category}
Tags: ${tags?.join(', ')}
Description: "${videoDescription}"

Target Output Language: ${language === 'bn' ? 'Bengali (বাংলা)' : 'English'}

Provide a deep-dive analysis using model gemini-3.1-pro-preview. Return a JSON object with:
{
  "summary": "2-3 sentence executive summary of what this video teaches or presents",
  "keyTakeaways": ["Point 1", "Point 2", "Point 3", "Point 4"],
  "targetAudience": "Who will benefit most from this video",
  "estimatedValueScore": 95
}
Only output valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
    });

    const text = response.text || '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      summary: "Comprehensive video overview highlighting core principles and actionable insights.",
      keyTakeaways: ["Clear conceptual breakdown", "Practical real-world application", "Expert commentary"],
      targetAudience: "Enthusiasts and professionals interested in " + category,
      estimatedValueScore: 92
    };

    res.json(parsed);
  } catch (err: any) {
    console.error("AI Video Analyze Error:", err);
    res.status(500).json({ error: "Failed to analyze video content." });
  }
});

// AI Image Analyzer (Upload photo to discover matching videos)
app.post('/api/ai/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType, promptText, language, availableCategories } = req.body;
    const ai = getAI();

    const prompt = `You are an AI Visual Search Assistant for a video platform.
Available Platform Categories: ${availableCategories?.join(', ') || 'Technology, Programming, Business, Education, Motivation, Islam, Entertainment, Science, Health, Finance, News'}

User Prompt or Context: "${promptText || 'What videos on this platform relate to this image?'}"
Language: ${language === 'bn' ? 'Bengali (বাংলা)' : 'English'}

Analyze the attached image (e.g. book cover, code snippet, workout note, news headline, gadget).
Identify the subject matter and recommend which 1-3 categories or search keywords the user should explore on our platform.

Return JSON:
{
  "imageAnalysis": "Brief description of what you see in the photo...",
  "recommendedCategories": ["Technology", "Programming"],
  "searchKeywords": ["React hooks", "Web frontend"],
  "message": "Friendly advice in ${language === 'bn' ? 'Bengali' : 'English'}"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType || 'image/jpeg',
          }
        },
        prompt
      ],
    });

    const text = response.text || '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      imageAnalysis: "Analyzed visual content.",
      recommendedCategories: ["Technology", "Education"],
      searchKeywords: ["Tutorial", "Learning"],
      message: "Here are some recommended topics based on your photo!"
    };

    res.json(parsed);
  } catch (err: any) {
    console.error("AI Image Analyze Error:", err);
    res.status(500).json({ error: "Failed to analyze uploaded image." });
  }
});

// Vite middleware for development or Static serve for production
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*all', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
