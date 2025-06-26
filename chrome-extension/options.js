// Options page script
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('settingsForm');
  const backendUrlInput = document.getElementById('backendUrl');
  const defaultLayoutSelect = document.getElementById('defaultLayout');
  const defaultStyleSelect = document.getElementById('defaultStyle');
  const saveBtn = document.getElementById('saveBtn');
  const saveStatus = document.getElementById('saveStatus');
  const testBtn = document.getElementById('testBtn');
  const connectionStatus = document.getElementById('connectionStatus');

  // Load saved settings
  loadSettings();

  // Event listeners
  form.addEventListener('submit', saveSettings);
  testBtn.addEventListener('click', testConnection);
  backendUrlInput.addEventListener('input', hideConnectionStatus);

  function loadSettings() {
    chrome.storage.sync.get([
      'backendUrl',
      'defaultLayout',
      'defaultStyle'
    ], function(result) {
      backendUrlInput.value = result.backendUrl || 'http://localhost:5000';
      defaultLayoutSelect.value = result.defaultLayout || 'centered';
      defaultStyleSelect.value = result.defaultStyle || 'Photorealistic';
    });
  }

  async function saveSettings(e) {
    e.preventDefault();
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
      const settings = {
        backendUrl: backendUrlInput.value.trim(),
        defaultLayout: defaultLayoutSelect.value,
        defaultStyle: defaultStyleSelect.value
      };

      // Validate URL
      if (!isValidUrl(settings.backendUrl)) {
        throw new Error('Please enter a valid URL');
      }

      // Save to storage
      await chrome.storage.sync.set(settings);
      
      showSaveStatus('Settings saved successfully!', 'success');
      
    } catch (error) {
      showSaveStatus(`Error: ${error.message}`, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Settings';
    }
  }

  async function testConnection() {
    const url = backendUrlInput.value.trim();
    
    if (!url) {
      showConnectionStatus('Please enter a backend URL first', false);
      return;
    }

    if (!isValidUrl(url)) {
      showConnectionStatus('Invalid URL format', false);
      return;
    }

    testBtn.disabled = true;
    testBtn.textContent = 'Testing...';

    try {
      // Test basic connectivity
      const response = await fetch(`${url}/api/health`, {
        method: 'GET',
        mode: 'cors'
      });

      if (response.ok) {
        showConnectionStatus('Connected successfully', true);
      } else {
        showConnectionStatus(`Server responded with status ${response.status}`, false);
      }
      
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        showConnectionStatus('Cannot connect - check URL and CORS settings', false);
      } else {
        showConnectionStatus(`Connection failed: ${error.message}`, false);
      }
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = 'Test Connection';
    }
  }

  function showSaveStatus(message, type) {
    saveStatus.textContent = message;
    saveStatus.className = `status ${type}`;
    saveStatus.classList.remove('hidden');
    
    setTimeout(() => {
      saveStatus.classList.add('hidden');
    }, 3000);
  }

  function showConnectionStatus(message, isConnected) {
    const dot = connectionStatus.querySelector('.status-dot');
    const text = connectionStatus.querySelector('span');
    
    dot.className = `status-dot ${isConnected ? 'connected' : 'disconnected'}`;
    text.textContent = message;
    connectionStatus.classList.remove('hidden');
  }

  function hideConnectionStatus() {
    connectionStatus.classList.add('hidden');
  }

  function isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }
});