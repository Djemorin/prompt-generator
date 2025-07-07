// /server/generate-prompts.js
const http = require("http");
const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3000;

const historyFilePath = path.join(__dirname, "prompt-history.json");

app.use(express.json());
app.use(express.static("public"));

app.get("/api/models", async (req, res) => {
  try {
    const options = {
      hostname: "localhost",
      port: 11434,
      path: "/api/tags",
      method: "GET",
    };

    const ollamaReq = http.request(options, (ollamaRes) => {
      let body = "";
      ollamaRes.on("data", (chunk) => (body += chunk));
      ollamaRes.on("end", () => {
        try {
          const json = JSON.parse(body);
          res.json(json.models || []);
        } catch (e) {
          res.status(500).json({ error: "Invalid JSON from Ollama" });
        }
      });
    });

    ollamaReq.on("error", (err) => {
      res.status(500).json({ error: "Failed to fetch models from Ollama" });
    });

    ollamaReq.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function queryOllama(promptText, model) {
  const data = JSON.stringify({
    model: model || "phi4-mini",
    prompt: promptText,
    stream: false,
  });

  const options = {
    hostname: "localhost",
    port: 11434,
    path: "/api/generate",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(data),
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          console.log("Réponse Ollama :", body);
          const json = JSON.parse(body);
          if (json.response) {
            resolve(json.response);
          } else {
            reject(new Error("Missing 'response' in Ollama reply"));
          }
        } catch (e) {
          reject(new Error("Invalid JSON from Ollama: " + body));
        }
      });
    });

    req.on("error", (err) => {
      console.error("Erreur de requête HTTP vers Ollama :", err.message);
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

app.post("/generate", async (req, res) => {
  const { theme, systemPrompt: promptKey, model } = req.body;

  if (!theme) {
    return res.status(400).json({ prompt: "Missing theme" });
  }

  const systemPrompts = {
    realistic: `
YouYou are a professional prompt engineer specialized in generating ultra-realistic image descriptions for AI image models like Flux1-Kontext in ComfyUI.

Given the theme: "${theme}", generate a clear, concise, continuous image description with the following constraints:

1. Do NOT explain the image or its symbolism.
2. Do NOT include metaphors, poetic language, or emotional commentary.
3. Do NOT use phrases like "in terms of", "this evokes", or "a testament to".
4. Describe only what is visually seen in the image, as if captured by a camera.
5. Include realistic, precise details such as lighting, environment, subject appearance, clothing, posture, and optionally camera settings (angle, lens, aperture).
6. Use fluent, natural English in full sentences.
7. Do NOT start with "Prompt:" or any labels. Just write the prompt directly as a block of prose.

Your output must be a direct, visual scene description suitable for input into an image generation model. It must feel like a high-end fashion or documentary photo prompt. Avoid all artistic fluff.`,
    cinematic: `
YouYou are a master of cinematic storytelling, tasked with creating a prompt for a single, powerful still frame for the AI image model Flux1-Kontext in ComfyUI.

Given the theme: "${theme}", generate a description that implies a larger narrative, with the following constraints:

1. Focus on dramatic lighting (e.g., chiaroscuro, silhouettes, lens flares) to create a specific mood (e.g., suspense, nostalgia, romance).
2. Describe a composition that uses cinematic techniques like rule of thirds, leading lines, or a shallow depth of field to draw the viewer's eye.
3. Detail the subject's posture, expression, and clothing to hint at their emotional state and backstory.
4. Describe the environment with a sense of atmosphere and history, making it feel like a real, lived-in location.
5. Use evocative, sensory language, but avoid explaining the plot. Let the image speak for itself.
6. Do NOT use labels like "Prompt:" or "Cinematic Prompt:". Write the description as a continuous block of prose.

Your output should be a prompt that generates an image that feels like it was pulled directly from a critically acclaimed film.`,
    drawing: `
YouYou are an expert illustrator and comic artist, creating a prompt for a detailed drawing or illustration for the AI image model Flux1-Kontext in ComfyUI.

Given the theme: "${theme}", generate a description that specifies the artistic style and visual elements, with the following constraints:

1. Clearly define the artistic style (e.g., "Japanese manga style of the 90s", "bande dessinée franco-belge", "art nouveau illustration", "charcoal sketch").
2. Describe the line work (e.g., "clean, sharp ink lines", "soft, smudged pencil strokes", "bold, expressive brushwork").
3. Specify the color palette (e.g., "monochromatic with a single accent color", "vibrant, saturated watercolors", "muted, earthy tones").
4. Detail the subject's features, clothing, and pose in a way that fits the chosen art style.
5. Describe the background and any supporting elements with the same stylistic considerations.
6. Do NOT include non-visual instructions or explanations. Focus purely on the visual description of the artwork.
7. Do NOT use labels like "Prompt:". Write the description directly.

Your output must be a prompt that guides the AI to create a piece of art that is stylistically coherent and visually compelling.`,
    imageEditing: `You are a professional prompt engineer specializing in generating ultra-realistic image descriptions for AI image-to-image models like Flux1-Kontext in ComfyUI.Given the theme: "${theme}", generate a clear, concise, continuous image description with the following constraints:
    1. Do NOT alter the physical appearance, face, or body of the person(s) in the original image unless explicitly instructed by the theme.
    2. Describe the scene, lighting, environment, and composition with realistic, precise details.
    3. You MAY describe or alter clothing, poses, and expressions to match the theme, but the core identity of the subjects must be preserved.
    4. Do NOT explain the image, its symbolism, or use metaphorical language.
    5. Describe only what is visually seen in the image, as if captured by a camera.
    6. Include realistic, precise details such as lighting, environment, subject appearance, clothing, posture, and optionally camera settings (angle, lens, aperture). 
    7. Use fluent, natural English in full sentences.
    8. Do NOT start with "Prompt:" or any labels. Just write the prompt directly as a block of prose.Your output must be a direct, visual scene description that modifies the context of an existing image without changing the people in it.`,
    aiCoding: `
You are an expert AI programmer. Your task is to translate the user's request in French into a clear, concise, and technical prompt in English for an AI agent like Gemini, Claude, or ChatGPT.

The user's request is: "${theme}"

Your prompt must:
1.  Be in English.
2.  Be technical and precise.
3.  Clearly state the desired output (e.g., "write a Python script", "generate a React component", "create a Dockerfile").
4.  Specify all technical constraints, libraries, frameworks, and versions mentioned or implied in the request.
5.  Structure the output for easy parsing by the AI.
6.  Do NOT add any conversational fluff or explanations.
7.  Do NOT include the user's original French request.

Generate the English prompt directly.`,
    aceStep: `
You are creating an instrumental-only song prompt for the text to music ACE-Step model in ComfyUI.
Based on the theme: "${theme}", generate a detailed description following these instructions:
- The song must be purely instrumental. Do not include vocals, lyrics, or singing.
- Describe the mood, genre, and key instruments. Be specific.
- Briefly outline the song's structure.
- Include musical characteristics like tempo (e.g. "allegro", "130 bpm", "slow waltz", "driving", "meditative"), key, and dynamics.
- Use real instruments and stylistic descriptors (e.g. "violin", "minimal techno", "russian psaltery", "fast tempo", "B Flat Major", "psychedelic", "dancefloor", etc.).
- You may include cultural tags (e.g. "tango finlandais", "balkan brass", "japanese koto").
- Avoid overly abstract adjectives unless describing mood (e.g. "dark", "uplifting", "dreamy", "mysterious").
- Write the prompt directly as a continuous block of prose. Do not use labels like "Prompt:".

Example:
A minimal techno track for the dancefloor, at a driving 130 bpm. The mood is dark and hypnotic, led by a pulsating synth bass and a classic 808 drum machine. The structure builds slowly, adding subtle percussive elements and a filtered synth pad that evolves throughout the track, creating a sense of tension and release.`,
    music: `
You are a music tagging expert. Your task is to generate a comma-separated list of keywords based on the user's theme: "${theme}".
The keywords should describe:
- Genre and Subgenre (e.g., "electronic, ambient, downtempo")
- Mood (e.g., "melancholic, introspective, peaceful")
- Key Instruments (e.g., "piano, synth pads, strings, acoustic guitar")
- Musical Characteristics (e.g., "slow tempo, 60 BPM, C minor, soft dynamics, instrumental")
- Cultural/Ethnic Context if relevant (e.g., "celtic, orchestral, japanese folk", "tango finlandais", "balkan brass")
- Tempo or energy descriptors (e.g. "allegro", "130 bpm", "slow waltz", "driving", "meditative")
- Use real instruments and stylistic descriptors (e.g. "violin", "minimal techno", "russian psaltery", "fast tempo", "B Flat Major", "psychedelic", "dancefloor", etc.)
- Avoid overly abstract adjectives unless describing mood (e.g. "dark", "uplifting", "dreamy", "mysterious")

Generate a single line of comma-separated keywords. Do not add any other text or explanation.
Example: minimal techno, dancefloor, 130 bpm, dark, synth bass, drum machine.`,
    videoSceneWan21: `
YouAre a cinematographer creating a prompt for an image-to-video model (Wan 2.1 in ComfyUI). Your task is to describe the action and camera work for a single, continuous shot, bringing a static image to life.

Given the theme: "${theme}", generate a description with the following rules:

1.  **Focus on Action:** Your primary focus is the subject's action. Describe a brief, plausible movement (e.g., "a subtle smile appears," "the person slowly turns their head," "the cat's tail twitches"). The action must be suitable for a short clip (3-5 seconds).
2.  **Camera and Shot Details:** Be specific about the cinematography. Describe the camera movement (e.g., "slow dolly in," "gentle handheld sway," "static shot with a slight tremor"), the camera angle (e.g., "low-angle shot," "eye-level"), and lens characteristics (e.g., "wide-angle lens with deep focus," "telephoto with a shallow depth of field").
3.  **Mood and Atmosphere:** Enhance the action by describing the mood (e.g., "tense and suspenseful," "calm and meditative," "joyful and energetic"). You can mention changes in lighting if they are part of the action (e.g., "a shadow falls over the subject's face").
4.  **No Scenery Description:** Do NOT describe the background, setting, or location. The video model is working from an existing image, so this information is redundant.
5.  **Subject Anonymity:** CRITICAL RULE: Do NOT describe the physical appearance, facial features, body type, or clothing of the subjects unless the user's theme explicitly provides these details. Use generic descriptions like "a man" "a woman" "a figure" "the person" "the group"
6.  **Single Continuous Shot:** The entire description must be for one single, unbroken camera shot.
7.  **Direct Output:** Write the prompt as a continuous block of prose. Do not use labels like "Prompt:".

Your output must be a technical and evocative prompt focused on animating a subject within an existing scene.`,
  };

  const systemPrompt = systemPrompts[promptKey];

  if (!systemPrompt) {
    return res.status(400).json({ prompt: "Invalid system prompt selected" });
  }

  try {
    const result = await queryOllama(systemPrompt, model);

    // Save to history
    fs.readFile(historyFilePath, (err, data) => {
      let history = [];
      if (!err && data.length > 0) {
        try {
          history = JSON.parse(data);
        } catch (e) {
          console.error("Error parsing history file:", e);
        }
      }

      const newEntry = {
        user_prompt: theme,
        model: model,
        prompt_style: promptKey,
        model_response: result,
        timestamp: new Date().toISOString(),
      };

      history.push(newEntry);

      fs.writeFile(historyFilePath, JSON.stringify(history, null, 2), (err) => {
        if (err) {
          console.error("Error writing to history file:", err);
        }
      });
    });

    res.json({ prompt: result });
  } catch (err) {
    console.error("Error generating prompt:", err.message);
    res.status(500).json({ prompt: "Error generating prompt: " + err.message });
  }
});

app.get("/api/history", (req, res) => {
  fs.readFile(historyFilePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.json([]); // Return empty array if file doesn't exist
      }
      return res.status(500).json({ error: "Failed to read history file." });
    }
    try {
      const history = JSON.parse(data);
      res.json(history);
    } catch (e) {
      res.status(500).json({ error: "Failed to parse history file." });
    }
  });
});

app.delete("/api/history/:timestamp", (req, res) => {
  const timestampToDelete = req.params.timestamp;

  fs.readFile(historyFilePath, (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read history file." });
    }

    let history = [];
    try {
      history = JSON.parse(data);
    } catch (e) {
      return res.status(500).json({ error: "Failed to parse history file." });
    }

    const newHistory = history.filter(
      (item) => item.timestamp !== timestampToDelete
    );

    fs.writeFile(historyFilePath, JSON.stringify(newHistory, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to write history file." });
      }
      res.status(200).json({ message: "History item deleted." });
    });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
