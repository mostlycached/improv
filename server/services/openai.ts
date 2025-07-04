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
  artisticStyle: string;
  colorPalette: string;
  personArchetype: string;
  environment: string;
  layout: string;
}

export async function generateAdContent(scrapedContent: string): Promise<GeneratedContent> {
  try {
    console.log('Calling Azure OpenAI with content length:', scrapedContent.length);
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Azure deployment name
      messages: [
        {
          role: "system",
          content: `You are an expert marketing strategist and creative director. Analyze the provided website content and generate comprehensive ad campaign data. Respond ONLY with valid JSON in this exact format (no markdown, no extra text): {
            "title": "compelling headline (max 60 chars)",
            "subtitle": "supporting description (max 120 chars)",
            "ctaText": "action button text (max 20 chars)",
            "targetAudience": "describe target audience",
            "industry": "industry category",
            "artisticStyle": "one of: Photorealistic, Geometric Abstraction, Neo-Memphis, Gradient Silhouette, Brutalist Gradient",
            "colorPalette": "one of: Corporate Blue, Sage Green, Warm Terracotta, Deep Purple, Monochrome, Sunset Orange, Ocean Teal, Rich Burgundy",
            "personArchetype": "one of: none, Accounting Professional, Administrative Assistant, Arts & Design Professional, Business Development Manager, Community Services Worker, Consultant, Customer Success Manager, Educator, Engineer, Entrepreneur, Finance Professional, Healthcare Professional, HR Professional, IT Professional, Legal Professional, Marketing Specialist, Media & Communications Professional, Military/Security Professional, Operations Manager, Product Manager, Project Manager, Purchasing Professional, Quality Assurance Specialist, Real Estate Professional, Researcher, Sales Professional",
            "environment": "one of: none, Accounting Office, Administrative Office, Design Studio, Corporate Boardroom, Community Center, Consulting Office, Customer Service Center, Classroom, Engineering Lab, Startup Office, Financial Institution, Hospital/Medical Facility, HR Department, Tech Workspace, Law Office, Marketing Agency, Media Studio, Security Command Center, Operations Floor, Product Development Lab, Project War Room, Procurement Office, Quality Control Lab, Real Estate Office, Research Laboratory, Sales Floor",
            "layout": "one of: centered, left-aligned, bottom-overlay"
          }`
        },
        {
          role: "user",
          content: `Analyze this website content and create ad copy:\n\n${scrapedContent.substring(0, 2000)}`
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    }, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('Azure OpenAI response received');
    let content = response.choices[0].message.content || "{}";
    console.log('Raw OpenAI content:', content.substring(0, 200));
    
    // Clean up the response more thoroughly
    content = content.trim();
    
    // Remove markdown code blocks if present
    if (content.includes('```json')) {
      content = content.replace(/```json\s*/, '').replace(/```\s*$/, '');
    } else if (content.includes('```')) {
      content = content.replace(/```\s*/, '').replace(/```\s*$/, '');
    }
    
    // Remove any leading/trailing text that's not JSON
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      content = content.substring(jsonStart, jsonEnd + 1);
    }
    
    console.log('Cleaned content for parsing:', content.substring(0, 200));
    const result = JSON.parse(content.trim());
    
    return {
      title: result.title || "Transform Your Business",
      subtitle: result.subtitle || "Discover powerful solutions", 
      ctaText: result.ctaText || "Get Started",
      targetAudience: result.targetAudience || "professionals",
      industry: result.industry || "business",
      artisticStyle: result.artisticStyle || "Photorealistic",
      colorPalette: result.colorPalette || "Corporate Blue",
      personArchetype: result.personArchetype || "Business Executive",
      environment: result.environment || "Modern Office",
      layout: result.layout || "centered"
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('=== AZURE OPENAI ERROR DEBUG ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', errorMessage);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Log the full error object structure
    if (error && typeof error === 'object') {
      console.error('Error object keys:', Object.keys(error));
      const anyError = error as any;
      
      // Check for different error response structures
      if (anyError.response) {
        console.error('Response status:', anyError.response.status);
        console.error('Response headers:', anyError.response.headers);
        console.error('Response data:', anyError.response.data);
      }
      
      if (anyError.error) {
        console.error('Nested error:', anyError.error);
      }
      
      if (anyError.code) {
        console.error('Error code:', anyError.code);
      }
    }
    console.error('=== END ERROR DEBUG ===');
    
    // Extract the most relevant error message
    let finalErrorMessage = errorMessage;
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as any;
      finalErrorMessage = apiError.response?.data?.error?.message || 
                         apiError.response?.data?.message || 
                         apiError.response?.statusText || 
                         errorMessage;
    }
    
    throw new Error(`Azure OpenAI API Error: ${finalErrorMessage}`);
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
        "Corporate Blue": "using a professional blue color palette with navy #1B365D, bright blue #0066CC, and light blue #E3F2FD tones",
        "Sage Green": "using a calming sage green palette with forest green #2D5016, vibrant green #00C851, and light sage #F0F5E8 tones",
        "Warm Terracotta": "using warm terracotta palette with brown #8B4513, bright orange #FF6B35, and cream #FFF8DC tones",
        "Deep Purple": "using a sophisticated purple palette with deep purple #4A148C, bright purple #9C27B0, and lavender #E1BEE7 tones",
        "Monochrome": "using a monochrome palette with charcoal #2C2C2C, bright red accent #FF4444, and light gray #F5F5F5 tones",
        "Sunset Orange": "using a vibrant sunset palette with dark red #CC4125, bright orange #FF5722, and peach #FFE5B4 tones",
        "Ocean Teal": "using an ocean teal palette with deep teal #006064, bright cyan #00BCD4, and light aqua #B2DFDB tones",
        "Rich Burgundy": "using a rich burgundy palette with wine #722F37, bright pink #E91E63, and rose #F8BBD9 tones"
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
