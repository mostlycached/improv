// Chrome Extension Popup Script
document.addEventListener('DOMContentLoaded', function() {
  const generateBtn = document.getElementById('generateBtn');
  const status = document.getElementById('status');
  const adPreview = document.getElementById('adPreview');
  const adImage = document.getElementById('adImage');
  const adTitle = document.getElementById('adTitle');
  const adDescription = document.getElementById('adDescription');
  const actions = document.getElementById('actions');
  const downloadBtn = document.getElementById('downloadBtn');
  const editBtn = document.getElementById('editBtn');
  const shareBtn = document.getElementById('shareBtn');

  let currentAdData = null;
  let currentUrl = null;

  // Get current tab URL
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    currentUrl = tabs[0].url;
  });

  // Load settings and test connection
  chrome.storage.sync.get(['backendUrl'], async function(result) {
    const backendUrl = result.backendUrl || 'https://improvads.replit.app';
    
    try {
      // Test basic connectivity
      const healthResponse = await fetch(`${backendUrl}/api/health`);
      if (!healthResponse.ok) {
        showStatus(`Backend not responding (${healthResponse.status}). Check settings.`, 'error');
        generateBtn.disabled = true;
      }
    } catch (error) {
      showStatus('Cannot connect to backend. Check settings.', 'error');
      generateBtn.disabled = true;
    }
  });

  generateBtn.addEventListener('click', generateAd);
  downloadBtn.addEventListener('click', downloadAd);
  editBtn.addEventListener('click', editAd);
  shareBtn.addEventListener('click', shareAd);

  async function generateAd() {
    if (!currentUrl) {
      showStatus('Unable to get current page URL', 'error');
      return;
    }

    try {
      generateBtn.disabled = true;
      showStatus('Generating ad from current page...', 'loading');
      hidePreview();

      // Get backend URL from settings
      const settings = await chrome.storage.sync.get(['backendUrl']);
      const backendUrl = settings.backendUrl || 'https://improvads.replit.app';

      // Generate ad content
      console.log('Requesting:', `${backendUrl}/api/generate-content`);
      const response = await fetch(`${backendUrl}/api/generate-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: currentUrl })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText.substring(0, 200)}`);
      }

      const responseText = await response.text();
      console.log('Raw response:', responseText.substring(0, 500));
      
      let adContent;
      try {
        adContent = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error(`Invalid JSON response. Server returned: ${responseText.substring(0, 200)}`);
      }
      
      // Generate background image
      showStatus('Creating background image...', 'loading');
      
      const imageResponse = await fetch(`${backendUrl}/api/generate-background`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: adContent.title,
          style: adContent.artisticStyle || 'Photorealistic',
          personArchetype: adContent.personArchetype || 'Professional',
          environment: adContent.environment || 'Office',
          colorPalette: adContent.colorPalette || 'Corporate Blue'
        })
      });

      if (!imageResponse.ok) {
        const imageErrorText = await imageResponse.text();
        console.error('Image generation error:', imageErrorText);
        throw new Error(`Image generation failed: ${imageResponse.status} - ${imageErrorText.substring(0, 200)}`);
      }

      const imageResponseText = await imageResponse.text();
      let imageData;
      try {
        imageData = JSON.parse(imageResponseText);
      } catch (parseError) {
        console.error('Image JSON parse error:', parseError);
        throw new Error(`Invalid JSON response from image API. Server returned: ${imageResponseText.substring(0, 200)}`);
      }
      
      // Store the complete ad data
      currentAdData = {
        ...adContent,
        backgroundImageUrl: imageData.imageUrl,
        sourceUrl: currentUrl
      };

      // Display the ad
      showPreview(currentAdData);
      showStatus('Ad generated successfully!', 'success');
      
    } catch (error) {
      console.error('Ad generation error:', error);
      showStatus(`Failed to generate ad: ${error.message}`, 'error');
    } finally {
      generateBtn.disabled = false;
    }
  }

  function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
    status.classList.remove('hidden');
  }

  function hideStatus() {
    status.classList.add('hidden');
  }

  function showPreview(adData) {
    adImage.src = adData.backgroundImageUrl;
    adTitle.textContent = adData.title;
    adDescription.textContent = adData.subtitle || adData.ctaText;
    
    adPreview.classList.remove('hidden');
    actions.classList.remove('hidden');
  }

  function hidePreview() {
    adPreview.classList.add('hidden');
    actions.classList.add('hidden');
  }

  async function downloadAd() {
    if (!currentAdData) return;

    try {
      // Create a canvas to render the ad
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = 800;
      canvas.height = 600;

      // Load and draw background image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = currentAdData.backgroundImageUrl;
      });

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Add text overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, canvas.height - 150, canvas.width, 150);

      ctx.fillStyle = 'white';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(currentAdData.title, canvas.width / 2, canvas.height - 100);

      ctx.font = '18px Arial';
      ctx.fillText(currentAdData.ctaText, canvas.width / 2, canvas.height - 60);

      // Download the image
      canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-ad-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });

    } catch (error) {
      showStatus('Failed to download ad', 'error');
    }
  }

  async function editAd() {
    if (!currentAdData) return;

    try {
      const settings = await chrome.storage.sync.get(['backendUrl']);
      const backendUrl = settings.backendUrl || 'https://improvads.replit.app';
      
      // Create a lightweight data object without the base64 image
      const editData = {
        title: currentAdData.title,
        ctaText: currentAdData.ctaText,
        targetAudience: currentAdData.targetAudience,
        industry: currentAdData.industry,
        artisticStyle: currentAdData.artisticStyle,
        colorPalette: currentAdData.colorPalette,
        personArchetype: currentAdData.personArchetype,
        environment: currentAdData.environment,
        layout: currentAdData.layout,
        sourceUrl: currentAdData.sourceUrl
        // Exclude backgroundImageUrl to avoid URL length issues
      };
      
      // Open the main app with the ad data - use base64 encoding to avoid URI malformation
      const editUrl = `${backendUrl}/?edit=true&data=${btoa(JSON.stringify(editData))}`;
      chrome.tabs.create({ url: editUrl });
      
    } catch (error) {
      showStatus('Failed to open editor', 'error');
    }
  }

  async function shareAd() {
    if (!currentAdData) return;

    try {
      const settings = await chrome.storage.sync.get(['backendUrl']);
      const backendUrl = settings.backendUrl || 'https://improvads.replit.app';

      // Save the ad to get a shareable ID
      const response = await fetch(`${backendUrl}/api/ads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: currentAdData.title,
          subtitle: currentAdData.subtitle,
          ctaText: currentAdData.ctaText,
          primaryColor: '#667eea',
          accentColor: '#764ba2',
          layout: currentAdData.layout || 'centered',
          backgroundImageUrl: currentAdData.backgroundImageUrl
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save ad');
      }

      const savedAd = await response.json();
      const shareUrl = `${backendUrl}/?ad=${savedAd.id}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      showStatus('Share link copied to clipboard!', 'success');
      
    } catch (error) {
      showStatus('Failed to create share link', 'error');
    }
  }
});