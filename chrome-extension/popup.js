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

  // Load settings
  chrome.storage.sync.get(['backendUrl'], function(result) {
    if (!result.backendUrl) {
      showStatus('Please configure backend URL in settings', 'error');
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
      const backendUrl = settings.backendUrl || 'http://localhost:5000';

      // Generate ad content
      const response = await fetch(`${backendUrl}/api/generate-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: currentUrl })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const adContent = await response.json();
      
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
        throw new Error(`Image generation failed: ${imageResponse.status}`);
      }

      const imageData = await imageResponse.json();
      
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
      const backendUrl = settings.backendUrl || 'http://localhost:5000';
      
      // Open the main app with the ad data
      const editUrl = `${backendUrl}/?edit=true&data=${encodeURIComponent(JSON.stringify(currentAdData))}`;
      chrome.tabs.create({ url: editUrl });
      
    } catch (error) {
      showStatus('Failed to open editor', 'error');
    }
  }

  async function shareAd() {
    if (!currentAdData) return;

    try {
      const settings = await chrome.storage.sync.get(['backendUrl']);
      const backendUrl = settings.backendUrl || 'http://localhost:5000';

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