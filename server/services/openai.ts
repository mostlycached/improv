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

export async function generateBackgroundImage(description: string, style: string = "photorealistic", layout: string = "centered"): Promise<string> {
  try {
    // Determine image size based on layout
    let imageSize = "1024x1024"; // Default for centered, left-aligned, bottom-overlay
    if (layout === "split-screen") {
      imageSize = "1024x1536"; // 3:2 aspect ratio for better vertical fit
    }
    
    let prompt = "";
    
    if (style === "photorealistic") {
      if (layout === "split-screen") {
        prompt = `Professional, high-quality photograph of ${description} in a modern workplace setting. Clean, well-lit environment with soft natural lighting. Corporate, business-focused atmosphere. Professional attire. Vertical composition (3:2 aspect ratio) with clean modern design, perfect for split-screen layout. High resolution, crisp details, photorealistic style.`;
      } else {
        prompt = `Professional, high-quality photograph of ${description} in a modern workplace setting. Clean, well-lit environment with soft natural lighting. Corporate, business-focused atmosphere. Professional attire. High resolution, crisp details, photorealistic style.`;
      }
    } else if (style === "vector") {
      prompt = `Clean, modern vector illustration of ${description}. Minimalist design with flat colors and geometric shapes. Professional business theme. Simple, elegant composition suitable for marketing materials.`;
    } else {
      prompt = `Professional business setting with ${description}. Modern office environment, clean aesthetic, corporate atmosphere. Suitable for business advertising and marketing materials.`;
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
        size: imageSize,
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
