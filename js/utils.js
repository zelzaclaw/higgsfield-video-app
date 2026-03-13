function validatePrompt(prompt) {
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return false;
  }
  
  // Check for minimum length
  if (prompt.trim().length < 3) {
    return false;
  }
  
  // Check for maximum length
  if (prompt.length > 1000) {
    return false;
  }
  
  return true;
}

function validateFile(file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) {
  if (!file) {
    return false;
  }
  
  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return false;
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return false;
  }
  
  return true;
}

function showStatus(message, type = 'info') {
  const container = document.getElementById('status-container');
  if (!container) return;
  
  // Remove existing status messages
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  
  const statusDiv = document.createElement('div');
  statusDiv.className = `status-message status-${type}`;
  statusDiv.textContent = message;
  
  container.appendChild(statusDiv);
  
  // Auto-hide success messages after 5 seconds
  if (type === 'success') {
    setTimeout(() => {
      hideStatus();
    }, 5000);
  }
}

function hideStatus() {
  const container = document.getElementById('status-container');
  if (container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }
}

function setLoading(element, loading = true) {
  if (loading) {
    element.disabled = true;
    element.innerHTML = '<span class="spinner"></span> <span class="loading-text">Processing...</span>';
  } else {
    element.disabled = false;
    // Restore original text - this assumes you stored it somewhere
    // For now, just reset to a default
    element.innerHTML = element.dataset.originalText || element.textContent;
  }
}

function saveApiKey(apiKey) {
  localStorage.setItem('higgsfield_api_key', apiKey);
}

function getApiKey() {
  return localStorage.getItem('higgsfield_api_key');
}

function clearApiKey() {
  localStorage.removeItem('higgsfield_api_key');
}

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    // Create toast container if it doesn't exist
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  // Add to container
  document.getElementById('toast-container').appendChild(toast);
  
  // Remove after 5 seconds
  setTimeout(() => {
    toast.remove();
  }, 5000);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Utility to create a unique ID
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Utility to download a file
function downloadFile(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Utility to check if a URL is valid
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Utility to escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}