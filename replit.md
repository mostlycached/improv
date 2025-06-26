# AI Ad Generator

## Overview

This is a full-stack web application that generates AI-powered advertising content using OpenAI's GPT models. The application allows users to scrape website content, generate compelling ad copy, create background images, and export professional advertisements.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend:

- **Frontend**: React with TypeScript, built using Vite
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **AI Integration**: OpenAI API for content generation and image creation

## Key Components

### Frontend Architecture
- **React + TypeScript**: Modern component-based UI with type safety
- **Vite**: Fast development server and build tool
- **shadcn/ui**: Comprehensive UI component library built on Radix UI
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight client-side routing
- **Canvas API**: For ad rendering and export functionality

### Backend Architecture
- **Express.js**: RESTful API server with middleware support
- **TypeScript**: Type-safe server-side development
- **Drizzle ORM**: Type-safe database operations with PostgreSQL
- **OpenAI Integration**: AI-powered content generation and image creation
- **Web Scraping**: URL content extraction for ad generation

### Database Schema
The application uses a simple schema with an `ads` table containing:
- Ad content (title, subtitle, CTA text)
- Design properties (colors, layout)
- Background image data
- Canvas export data

### API Endpoints
- `POST /api/scrape`: Extract content from URLs
- `POST /api/generate-content`: Generate ad copy from scraped content
- `POST /api/generate-background`: Create AI-generated background images
- CRUD operations for ad management

## Data Flow

1. **Content Generation Flow**:
   - User provides a URL
   - Backend scrapes the website content
   - OpenAI processes the content to generate ad copy
   - Frontend displays the generated content in the ad editor

2. **Ad Creation Flow**:
   - User customizes ad content and design
   - Canvas renders the ad in real-time
   - User can export the final ad as an image

3. **Background Generation Flow**:
   - User requests AI-generated background
   - OpenAI creates custom background image
   - Image is integrated into the ad design

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Database ORM with type safety
- **@tanstack/react-query**: Data fetching and caching
- **@radix-ui/***: UI component primitives
- **openai**: OpenAI API integration

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler
- **drizzle-kit**: Database migration and schema management

## Deployment Strategy

The application is configured for Replit deployment with:

- **Development**: `npm run dev` - runs server with hot reload
- **Production Build**: `npm run build` - builds both client and server
- **Production Start**: `npm run start` - runs optimized production server
- **Database**: PostgreSQL module configured in Replit
- **Autoscale Deployment**: Configured for automatic scaling

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- OpenAI API key via `OPENAI_API_KEY` environment variable
- Development/production mode detection

## Changelog
```
Changelog:
- June 25, 2025. Initial setup and Azure OpenAI integration
  - Connected GPT-4o for content generation via Azure endpoint
  - Connected gpt-image-1 for background image generation via Azure endpoint
  - Implemented 4 layout options (centered, left-aligned, bottom-overlay, split-screen)
  - Added URL scraping and auto-generation features
  - Created single-page ad generator interface
  - Migrated from HTML rendering to FabricJS interactive canvas
  - Added floating toolbar for direct preview editing
  - Implemented two-way data binding between toolbar and left panel
  - Added 60-second timeout for image generation
  - Fixed web scraper with proper gzip/deflate decompression for authentic content extraction
  - Resolved Azure OpenAI JSON parsing issues with markdown code block handling
  - Canvas now displays ad previews with SimpleCanvas fallback implementation
- June 26, 2025. Enhanced background image generation system
  - Added person archetype dropdown with 10 occupation-based options
  - Added environment dropdown with 10 workplace setting options
  - Implemented 5 artistic styles: Photorealistic, Geometric Abstraction, Neo-Memphis, Gradient Silhouette, Brutalist Gradient
  - Updated Azure OpenAI prompts to use rule of thirds composition with face positioning in top right hotspot
  - Enhanced API to handle separate archetype and environment parameters
  - Added explicit no-text/no-logo instructions to prevent text overlay in generated images
  - Organized advanced options under collapsible UI to reduce interface overwhelm
  - Implemented professional color palette system with 8 trending palettes
  - Added automatic CTA color updating based on selected palette accent color
  - Enhanced AI prompts to generate images using specific color palette instructions
  - Fixed color palettes to include proper vibrant accent colors for CTA buttons
  - Converted layout selector from visual grid to clean dropdown format
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```