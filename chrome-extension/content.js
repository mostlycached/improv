// Content script for webpage analysis
(function() {
  'use strict';

  // Extract webpage content for ad generation
  function extractPageContent() {
    const content = {
      title: document.title,
      description: '',
      headings: [],
      text: '',
      images: [],
      url: window.location.href
    };

    // Get meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      content.description = metaDesc.getAttribute('content');
    }

    // Get main headings
    const headings = document.querySelectorAll('h1, h2, h3');
    headings.forEach(heading => {
      if (heading.textContent.trim()) {
        content.headings.push(heading.textContent.trim());
      }
    });

    // Get main text content (focus on paragraphs and main content areas)
    const textElements = document.querySelectorAll('p, article, main, .content, .post-content');
    let textContent = '';
    textElements.forEach(element => {
      textContent += element.textContent + ' ';
    });
    content.text = textContent.trim().substring(0, 2000); // Limit to 2000 chars

    // Get images with alt text
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.src && img.alt) {
        content.images.push({
          src: img.src,
          alt: img.alt
        });
      }
    });

    return content;
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractContent') {
      const content = extractPageContent();
      sendResponse(content);
    }
  });

  // Add visual indicator when extension is active
  function addIndicator() {
    if (document.getElementById('ai-ad-indicator')) return;

    const indicator = document.createElement('div');
    indicator.id = 'ai-ad-indicator';
    indicator.innerHTML = '🎨 AI Ad Generator Ready';
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      z-index: 10000;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      cursor: pointer;
    `;

    document.body.appendChild(indicator);

    // Animate in
    setTimeout(() => {
      indicator.style.opacity = '1';
      indicator.style.transform = 'translateY(0)';
    }, 100);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      indicator.style.opacity = '0';
      indicator.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
      }, 300);
    }, 3000);

    // Click to open extension
    indicator.addEventListener('click', () => {
      chrome.runtime.sendMessage({action: 'openPopup'});
    });
  }

  // Show indicator when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addIndicator);
  } else {
    addIndicator();
  }
})();