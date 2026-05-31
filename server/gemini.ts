import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      console.warn("GEMINI_API_KEY environment variable is not defined or is placeholder. Using fallbacks.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Generates structural feedback for a user's vocal performance
export async function getVocalCoachingFeedback(
  songTitle: string,
  artistName: string,
  experienceLevel: string,
  userAccuracyScores: { pitch: number; rhythm: number; expressions: number }
): Promise<{
  score: number;
  pitchScore: number;
  rhythmScore: number;
  expressionScore: number;
  overallRating: string;
  strengths: string[];
  weaknesses: string[];
  coachingTips: string[];
}> {
  const client = getGeminiClient();
  if (!client) {
    // Elegant fallback simulation
    const overallScore = Math.round((userAccuracyScores.pitch + userAccuracyScores.rhythm + userAccuracyScores.expressions) / 3);
    return {
      score: overallScore,
      pitchScore: userAccuracyScores.pitch,
      rhythmScore: userAccuracyScores.rhythm,
      expressionScore: userAccuracyScores.expressions,
      overallRating: overallScore >= 90 ? "Spectacular Virtuoso!" : overallScore >= 80 ? "Superb Performer" : "Rising Star",
      strengths: [
        "Excellent sustain and note-holding consistency.",
        `High emotive resonance fitting the feeling of "${songTitle}".`
      ],
      weaknesses: [
        "Slight breath instability during high-octave transitions.",
        "Minor onset timing delays when the bridge speeds up."
      ],
      coachingTips: [
        "Practice diaphragmatic diaphragmic control to extend long-held high notes.",
        "Focus on snapping to the backbeat 15ms earlier on the verses."
      ]
    };
  }

  try {
    const prompt = `You are a world-class professional vocal coach. Analyze the user's vocal performance for "${songTitle}" by "${artistName}".
    Their experience level is: ${experienceLevel}.
    The automatic raw scoring checks detected:
    - Pitch Accuracy: ${userAccuracyScores.pitch}%
    - Rhythm & Timing: ${userAccuracyScores.rhythm}%
    - Expression & Emotion: ${userAccuracyScores.expressions}%

    Provide structured professional critique, custom feedback tips, strengths, weaknesses, and realistic score analysis.
    Return your response strictly as JSON matching this schema:
    {
      "score": number (weighted average overall score, out of 100),
      "pitchScore": number (final evaluated pitch rating out of 100),
      "rhythmScore": number (final rhythm rating out of 100),
      "expressionScore": number (final expression rating out of 100),
      "overallRating": string (humorous or prestigious summary like 'Flawless Vocal Prodigy' or 'Raw Soul & Grit'),
      "strengths": Array of strings (2-3 items detailing specific skills matching the song),
      "weaknesses": Array of strings (2-3 items on what went off-key or out-of-tempo),
      "coachingTips": Array of strings (3 actionable professional vocal exercises specifically for these issues)
    }`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["score", "pitchScore", "rhythmScore", "expressionScore", "overallRating", "strengths", "weaknesses", "coachingTips"],
          properties: {
            score: { type: Type.INTEGER },
            pitchScore: { type: Type.INTEGER },
            rhythmScore: { type: Type.INTEGER },
            expressionScore: { type: Type.INTEGER },
            overallRating: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            coachingTips: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
  } catch (error) {
    console.error("Gemini vocal feedback generation failed, using mock data", error);
  }

  // Fallback in case exception happened during parse
  return {
    score: 84,
    pitchScore: 82,
    rhythmScore: 85,
    expressionScore: 86,
    overallRating: "Passionate Harmonizer",
    strengths: ["Strong mid-range support", "Authentic emotional dynamics in the high register"],
    weaknesses: ["Occasional scooping on initial notes", "Slight rushing on pre-chorus beats"],
    coachingTips: [
      "Keep dynamic control solid without pushing extra breath on chest-voice high notes.",
      "Anchor your tempo on the bass line to prevent minor timing slips."
    ]
  };
}

// AI Music Companion Chat Helper
export async function getMusicCompanionChatResponse(
  chatHistory: { sender: "user" | "ai"; text: string }[],
  userMessage: string,
  vocalIdProfile?: {
    pitchRange: string;
    timbre: string;
    vocalDNA: { power: number; breath: number; rangeScore: number; stability: number };
    preferredGenre: string;
  }
): Promise<string> {
  const client = getGeminiClient();
  if (!client) {
    // Dynamic fallback chat intelligence
    const keywords = userMessage.toLowerCase();
    if (keywords.includes("improve") || keywords.includes("coaching") || keywords.includes("pitch")) {
      return `Practice makes progress! For ${vocalIdProfile?.timbre || 'your'} voice type, focusing on steady breath exercises like 'the lip trill' before singing is key. Would you like me to recommend a practice playlist matching your range: ${vocalIdProfile?.pitchRange || 'A2-C5'}?`;
    }
    if (keywords.includes("song") || keywords.includes("recommend")) {
      return `Based on your vocal color (${vocalIdProfile?.timbre || 'Vibrant Soprano'}), I highly recommend practicing tracks with smooth mid-to-high transition points. Traditional R&B, synth-pop, or acoustic ballads would let your resonant frequencies shine beautifully!`;
    }
    return `Hey there! I'm your ComSing AI Music Companion. I can coach your vocals, plan warm-ups, suggest songs within your range (${vocalIdProfile?.pitchRange || 'G3-E5'}), and analyze how to optimize your ${vocalIdProfile?.timbre || 'warm, expressive'} voice footprint! Ask me anything about voice improvement.`;
  }

  try {
    const conversationHistoryStr = chatHistory
      .map(ch => `${ch.sender.toUpperCase()}: ${ch.text}`)
      .join("\n");

    const systemInstruction = `You are "Symphony", the expert, friendly AI Music Companion, vocal trainer, and interactive coach for ComSing™.
    The current user has the following Vocal fingerprint status:
    - Pitch Range: ${vocalIdProfile?.pitchRange || "G3-E5"}
    - Vocal Timbre Style: ${vocalIdProfile?.timbre || "Resonant & Airy Tenor"}
    - Favorite Genre: ${vocalIdProfile?.preferredGenre || "Pop / R&B"}
    - DNA Metrics: Power: ${vocalIdProfile?.vocalDNA?.power || 75}%, Breath Control: ${vocalIdProfile?.vocalDNA?.breath || 80}%, Range depth: ${vocalIdProfile?.vocalDNA?.rangeScore || 70}%, Vocal pitch stability: ${vocalIdProfile?.vocalDNA?.stability || 82}%

    Answer the user with practical, engaging, highly actionable tips. Keep your response concise (under 3 sentences or short paragraphs), motivational, and structured with clean formatting. Avoid dry jargon. Always talk like a passionate studio partner!`;

    const prompt = `Here is the preceding chat history:
    ${conversationHistoryStr}

    USER: ${userMessage}
    SYMPHONY AI:`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.8,
      }
    });

    return response.text || "I'm humming in agreement! What should we sing next?";
  } catch (error) {
    console.error("AI Music Companion Chat error", error);
    return "I hit a mini acoustic interference, but I'm ready! Let's resume practicing or record a quick duet to test your pitch.";
  }
}

// Generate dynamic scenery narrative description for the AI performance generator
export async function getAIStageGenerationDescription(
  songTitle: string,
  themeType: string,
  userAcousticStyle: string
): Promise<{
  sceneDescription: string;
  visualStylePrompt: string;
  lightingVibe: string;
  cameraAngles: string[];
}> {
  const client = getGeminiClient();
  if (!client) {
    return {
      sceneDescription: `A high-contrast cinematic stage engulfed in deep indigo and electric cyan laser lines. Interactive audio ripples pulse along the stage surface in synchronize sync with the track "${songTitle}".`,
      visualStylePrompt: "Futuristic digital synthesizer aesthetics, floating holographic lyrics, 8k cinematic renders, glowing neon accents.",
      lightingVibe: `Pulsing violet strobes synched with a ${userAcousticStyle} tempo, blending warm spot projectors with dynamic volumetric smoke.`,
      cameraAngles: ["Low-angle sweeps of the main mic", "Steadicam circular rotations highlighting background idol hologram", "Ultra-wide drone pans over cheering audience"]
    };
  }

  try {
    const prompt = `We are generating an immersive concert performance video environment for ComSing™:
    - Song Title: "${songTitle}"
    - Backdrop Visual Theme: "${themeType}"
    - Performance Accents: "${userAcousticStyle}"

    Provide a highly artistic, technically vivid descriptions of the stage, colors, holographic projection designs, camera directions, and lighting animations.
    Return strictly JSON:
    {
      "sceneDescription": "Detailed overview of the generated simulated stage and surrounding background assets",
      "visualStylePrompt": "High-detail rendering prompts to guide background engine shaders",
      "lightingVibe": "Description of lighting colors, reactive animations to pitch, and timing adjustments",
      "cameraAngles": ["List of 3 dynamic camera movements that match the visual flow"]
    }`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["sceneDescription", "visualStylePrompt", "lightingVibe", "cameraAngles"],
          properties: {
            sceneDescription: { type: Type.STRING },
            visualStylePrompt: { type: Type.STRING },
            lightingVibe: { type: Type.STRING },
            cameraAngles: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
  } catch (e) {
    console.error("Failed generating AI stage specs", e);
  }

  return {
    sceneDescription: "Holographic stadium backdrop with pulsing golden ripples and floating starry constellations.",
    visualStylePrompt: "Futuristic neon wonderland, deep gold stars, volumetric laser effects.",
    lightingVibe: "Warm golden overhead spotlights and twinkling starlight projection meshes.",
    cameraAngles: ["Continuous crane descent", "Slow focus tracking of main microphone", "Close-up slow-motions"]
  };
}
