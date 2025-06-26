import OpenAI from "openai";

// Azure OpenAI configuration for GPT-4o  
const openai = new OpenAI({
  apiKey: process.env.OPENAI_GPT4O_API_KEY,
  baseURL: "https://harip-mbtw0h35-westus3.cognitiveservices.azure.com/openai/deployments/gpt-4o",
  defaultQuery: { "api-version": "2024-02-15-preview" },
  defaultHeaders: {
    "api-key": process.env.OPENAI_GPT4O_API_KEY,
  },
});

export interface GeneratedContent {
  title: string;
  subtitle: string;
  ctaText: string;
  targetAudience: string;
  industry: string;
}

export async function generateAdContent(scrapedContent: string): Promise<GeneratedContent> {
  try {
    console.log('Calling Azure OpenAI with content length:', scrapedContent.length);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Azure deployment name
      messages: [
        {
          role: "system",
          content: `You are an expert marketing copywriter. Analyze the provided website content and generate compelling ad copy. Respond with JSON in this exact format: {
            "title": "compelling headline (max 60 chars)",
            "subtitle": "supporting description (max 120 chars)",
            "ctaText": "action button text (max 20 chars)",
            "targetAudience": "describe target audience",
            "industry": "industry category"
          }`
        },
        {
          role: "user",
          content: `Analyze this website content and create ad copy:\n\n${scrapedContent}`
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    console.log('Azure OpenAI response received');
    let content = response.choices[0].message.content || "{}";
    
    // Remove markdown code blocks if present
    if (content.includes('```json')) {
      content = content.replace(/```json\s*/, '').replace(/```\s*$/, '');
    } else if (content.includes('```')) {
      content = content.replace(/```\s*/, '').replace(/```\s*$/, '');
    }
    
    const result = JSON.parse(content.trim());
    
    return {
      title: result.title || "Transform Your Business",
      subtitle: result.subtitle || "Discover powerful solutions", 
      ctaText: result.ctaText || "Get Started",
      targetAudience: result.targetAudience || "professionals",
      industry: result.industry || "business"
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Azure OpenAI API Error:', errorMessage);
    throw new Error(`Failed to generate ad content: ${errorMessage}`);
  }
}

export async function generateBackgroundImage(description: string, style: string = "Photorealistic", personArchetype?: string, environment?: string, colorPalette?: string): Promise<string> {
  try {
    let prompt = "";
    
    // Build base prompt with rule of thirds composition
    let basePrompt = "Professional advertisement background image using rule of thirds composition";
    
    // Add person archetype if specified
    if (personArchetype) {
      basePrompt += `, featuring a ${personArchetype.toLowerCase()}`;
      basePrompt += " positioned in the top right hotspot with their face clearly visible";
    }
    
    // Add environment if specified
    if (environment) {
      basePrompt += `, set in a ${environment.toLowerCase()}`;
      basePrompt += " with the horizon line positioned in the bottom left hotspot";
    }
    
    // Add original description
    if (description) {
      basePrompt += `, ${description}`;
    }
    
    // Add color palette instruction
    if (colorPalette) {
      const paletteInstructions = {
        "Corporate Blue": "using a professional blue color palette with navy #1B365D, bright blue #4A90E2, and light blue #E3F2FD tones",
        "Sage Green": "using a calming sage green palette with forest green #2D5016, sage #87A96B, and light sage #F0F5E8 tones",
        "Warm Terracotta": "using warm terracotta palette with burnt orange #D2691E, terracotta #E2725B, and cream #FFF8DC tones",
        "Deep Purple": "using a sophisticated purple palette with deep purple #4A148C, medium purple #7B1FA2, and lavender #E1BEE7 tones",
        "Monochrome": "using a monochrome palette with charcoal #2C2C2C, medium gray #757575, and light gray #F5F5F5 tones",
        "Sunset Orange": "using a vibrant sunset palette with deep orange #FF6B35, coral #FF8E53, and peach #FFE5B4 tones",
        "Ocean Teal": "using an ocean teal palette with deep teal #006064, turquoise #26A69A, and light aqua #B2DFDB tones",
        "Rich Burgundy": "using a rich burgundy palette with wine #722F37, burgundy #B71C1C, and rose #F8BBD9 tones"
      };
      
      basePrompt += `, ${paletteInstructions[colorPalette as keyof typeof paletteInstructions]}`;
    }
    
    // Apply artistic style with explicit no-text instruction
    const noTextInstruction = "NO TEXT, NO LOGOS, NO WORDS, NO TYPOGRAPHY in the image";
    
    switch (style) {
      case "Photorealistic":
        prompt = `${basePrompt}, photorealistic style, high quality, professional lighting, sharp details. ${noTextInstruction}`;
        break;
      case "Geometric Abstraction":
        prompt = `${basePrompt}, geometric abstraction style, clean lines, bold shapes, minimal color palette. ${noTextInstruction}`;
        break;
      case "Neo-Memphis":
        prompt = `${basePrompt}, neo-memphis design style, vibrant colors, geometric patterns, bold contrasts. ${noTextInstruction}`;
        break;
      case "Gradient Silhouette":
        prompt = `${basePrompt}, gradient silhouette style, smooth color transitions, simplified forms. ${noTextInstruction}`;
        break;
      case "Brutalist Gradient":
        prompt = `${basePrompt}, brutalist gradient style, strong contrasts, architectural elements. ${noTextInstruction}`;
        break;
      default:
        prompt = `${basePrompt}, professional style. ${noTextInstruction}`;
    }

    console.log('Generating background image with Azure OpenAI');

    // Create abort controller for 60s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch("https://harip-mbtw0h35-westus3.cognitiveservices.azure.com/openai/deployments/gpt-image-1/images/generations?api-version=2025-04-01-preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_IMAGE_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        size: "1024x1024",
        quality: "medium",
        output_compression: 100,
        output_format: "png",
        n: 1
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure Image API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Azure Image API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Background image generated successfully');
    
    // Handle base64 response from Azure OpenAI
    const base64Image = data.data?.[0]?.b64_json;
    if (base64Image) {
      // Convert base64 to data URL
      return `data:image/png;base64,${base64Image}`;
    }
    
    // Fallback to URL if available
    return data.data?.[0]?.url || "";
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Image generation timed out after 60 seconds. Please try again.');
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Background image generation failed:', errorMessage);
    throw new Error(`Failed to generate background image: ${errorMessage}`);
  }
}
