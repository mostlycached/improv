# AI Ad Generator Chrome Extension

This Chrome extension allows you to generate AI-powered advertisements from any webpage with a single click. It connects to your AI Ad Generator backend service to create compelling ad content and visuals.

## Features

- **One-Click Generation**: Generate ads directly from any webpage
- **AI-Powered Content**: Automatically extracts webpage content and creates relevant ad copy
- **Background Image Generation**: Creates custom background images using AI
- **Multiple Export Options**: Download, edit, or share generated ads
- **Real-time Preview**: See your ad as it's being generated
- **Customizable Settings**: Configure backend URL and default preferences

## Installation

### Step 1: Load the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" by toggling the switch in the top right
3. Click "Load unpacked" button
4. Select the `chrome-extension` folder from your project directory
5. The extension will appear in your extensions list and toolbar

### Step 2: Configure Backend Settings

1. Click the extension icon in your Chrome toolbar
2. Click "⚙️ Settings" at the bottom of the popup
3. Enter your backend service URL (default: `http://localhost:5000`)
4. Click "Test Connection" to verify connectivity
5. Configure your default preferences:
   - Default Layout (Centered, Left Aligned, etc.)
   - Default Artistic Style (Photorealistic, Geometric, etc.)
6. Click "Save Settings"

## Usage

### Basic Usage

1. Navigate to any webpage you want to create an ad for
2. Click the AI Ad Generator extension icon in your toolbar
3. Click "🎨 Generate Ad" button
4. Wait for the AI to process the content and generate your ad
5. Use the action buttons to:
   - **💾 Download**: Save the ad as a PNG image
   - **✏️ Edit**: Open the full editor in a new tab
   - **🔗 Share**: Create a shareable link

### Advanced Features

- **Automatic Content Extraction**: The extension intelligently extracts key content from webpages including titles, descriptions, and relevant text
- **Visual Indicator**: A small indicator appears on pages when the extension is ready
- **Connection Status**: Real-time connection status in the settings page
- **Error Handling**: Clear error messages with suggestions for resolution

## Backend Requirements

Your AI Ad Generator backend service must be running and accessible. Required endpoints:

- `GET /api/health` - Health check endpoint
- `POST /api/generate-content` - Generate ad content from URL
- `POST /api/generate-background` - Generate background images
- `POST /api/ads` - Save ads for sharing

## Troubleshooting

### Common Issues

**Extension not connecting to backend:**
- Verify your backend service is running
- Check the backend URL in extension settings
- Ensure CORS is properly configured on your backend
- Test the connection using the "Test Connection" button

**Generation fails:**
- Check that your OpenAI API keys are properly configured
- Verify the webpage content can be extracted
- Check browser console for detailed error messages

**Images not loading:**
- Ensure your backend has proper image generation capabilities
- Check that the OpenAI image generation service is accessible
- Verify image URLs are publicly accessible

### CORS Configuration

Your backend needs to allow requests from Chrome extensions. Add this to your Express server:

```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
```

## Development

### File Structure

```
chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Main popup interface
├── popup.js              # Popup functionality
├── content.js            # Webpage content extraction
├── options.html          # Settings page
├── options.js            # Settings functionality
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # This file
```

### Permissions

The extension requires these permissions:
- `activeTab`: Access current webpage content
- `storage`: Save user preferences
- `host_permissions`: Connect to your backend service

## Security Considerations

- The extension only accesses the currently active tab when generating ads
- All API communications should use HTTPS in production
- User preferences are stored locally using Chrome's secure storage API
- No sensitive data is permanently stored in the extension

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify your backend service is properly configured
3. Check the browser console for detailed error messages
4. Ensure all required API endpoints are implemented

## Version History

- **v1.0**: Initial release with core ad generation functionality
  - One-click ad generation from webpages
  - AI-powered content and image generation
  - Download, edit, and share capabilities
  - Configurable backend connection
  - Real-time status indicators