import OpenAI from "openai";

// Azure OpenAI configuration for GPT-4o
const openai = new OpenAI({
  apiKey: process.env.OPENAI_GPT4O_API_KEY || "default_key",
  baseURL: "https://harip-mbtw0h35-westus3.cognitiveservices.azure.com/openai",
  defaultQuery: { "api-version": "2025-01-01-preview" },
  defaultHeaders: {
    "api-key": process.env.OPENAI_GPT4O_API_KEY || "default_key",
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
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      title: result.title || "Transform Your Business",
      subtitle: result.subtitle || "Discover powerful solutions",
      ctaText: result.ctaText || "Get Started",
      targetAudience: result.targetAudience || "professionals",
      industry: result.industry || "business"
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate ad content: ${errorMessage}`);
  }
}

export async function generateBackgroundImage(description: string, style: string = "photorealistic"): Promise<string> {
  try {
    let prompt = "";
    
    if (style === "photorealistic") {
      prompt = `Professional, high-quality photograph of ${description} in a modern workplace setting. Clean, well-lit environment with soft natural lighting. Corporate, business-focused atmosphere. Professional attire. High resolution, crisp details, photorealistic style.`;
    } else if (style === "vector") {
      prompt = `Clean, modern vector illustration of ${description}. Minimalist design with flat colors and geometric shapes. Professional business theme. Simple, elegant composition suitable for marketing materials.`;
    } else {
      prompt = `Professional business setting with ${description}. Modern office environment, clean aesthetic, corporate atmosphere. Suitable for business advertising and marketing materials.`;
    }

    // Use direct fetch for Azure OpenAI image generation endpoint
    const response = await fetch("https://harip-mbtw0h35-westus3.cognitiveservices.azure.com/openai/deployments/gpt-image-1/images/generations?api-version=2025-04-01-preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.OPENAI_IMAGE_API_KEY || "default_key",
      },
      body: JSON.stringify({
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.[0]?.url || "";
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate background image: ${errorMessage}`);
  }
}
