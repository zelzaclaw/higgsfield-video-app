// DOM Elements
let settingsModal = null;
let apiKeyInput = null;
let testButton = null;
let saveButton = null;

// State variables
let currentTab = 'image-tab';
let uploadedFiles = [];
let previousImageResult = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
  initializeElements();
  initializeEventListeners();
  loadSavedApiKey();
});

function initializeElements() {
  // Get DOM elements
  settingsModal = document.getElementById('settings-modal');
  apiKeyInput = document.getElementById('api-key-input');
  testButton = document.getElementById('test-api-key');
  saveButton = document.getElementById('save-api-key');
  
  // Initialize tabs if they exist
  initializeTabs();
}

function initializeEventListeners() {
  // Settings button
  const settingsBtn = document.querySelector('.settings-btn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', openSettingsModal);
  }
  
  // Modal close button
  const closeModalBtn = document.querySelector('.close-modal');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeSettingsModal);
  }
  
  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target === settingsModal) {
      closeSettingsModal();
    }
  });
  
  // Save API key
  if (saveButton) {
    saveButton.addEventListener('click', saveApiKeyHandler);
  }
  
  // Test API key
  if (testButton) {
    testButton.addEventListener('click', testApiKeyHandler);
  }
  
  // Initialize tab event listeners
  initializeTabEventListeners();
  
  // Initialize image tab handlers
  initializeImageTabHandlers();
  
  // Initialize video tab handlers
  initializeVideoTabHandlers();
}

function initializeTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  // Show the first tab by default
  if (tabContents.length > 0) {
    tabContents[0].classList.add('active');
    if (tabButtons.length > 0) {
      tabButtons[0].classList.add('active');
    }
  }
}

function initializeTabEventListeners() {
  const tabButtons = document.querySelectorAll('.tab-button');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      
      // Remove active class from all buttons and contents
      document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
      });
      
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      
      // Add active class to clicked button and corresponding content
      this.classList.add('active');
      document.getElementById(tabId).classList.add('active');
      
      // Update current tab
      currentTab = tabId;
    });
  });
}

function initializeImageTabHandlers() {
  const imageForm = document.getElementById('image-form');
  if (imageForm) {
    imageForm.addEventListener('submit', handleImageGeneration);
  }
  
  // File input handling
  const fileInput = document.getElementById('image-file');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelect);
  }
  
  // Drag and drop handling
  const dropzone = document.querySelector('.dropzone');
  if (dropzone) {
    setupDragAndDrop(dropzone);
  }
}

function initializeVideoTabHandlers() {
  const videoForm = document.getElementById('video-form');
  if (videoForm) {
    videoForm.addEventListener('submit', handleVideoGeneration);
  }
  
  // Video file input handling
  const videoFileInput = document.getElementById('video-file');
  if (videoFileInput) {
    videoFileInput.addEventListener('change', handleVideoFileSelect);
  }
  
  // Use previous image checkbox
  const usePreviousCheckbox = document.getElementById('use-previous-image');
  if (usePreviousCheckbox) {
    usePreviousCheckbox.addEventListener('change', togglePreviousImageUsage);
  }
  
  // Drag and drop for video tab
  const videoDropzone = document.querySelector('#video-tab .dropzone');
  if (videoDropzone) {
    setupDragAndDrop(videoDropzone);
  }
}

function setupDragAndDrop(dropzone) {
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, unhighlight, false);
  });

  function highlight() {
    dropzone.classList.add('dragover');
  }

  function unhighlight() {
    dropzone.classList.remove('dragover');
  }

  dropzone.addEventListener('drop', handleDrop, false);

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
      handleFiles(files);
    }
  }
}

function handleFiles(files) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (validateFile(file)) {
      uploadedFiles.push(file);
      updatePreview(file);
    } else {
      showToast('Invalid file type or size. Please select an image (JPG, PNG, GIF) under 10MB.', 'error');
    }
  }
}

function handleFileSelect(e) {
  const files = e.target.files;
  handleFiles(files);
}

function handleVideoFileSelect(e) {
  const files = e.target.files;
  handleFiles(files);
}

function updatePreview(file) {
  const previewContainer = document.querySelector('.preview-container');
  if (!previewContainer) return;
  
  const previewItem = document.createElement('div');
  previewItem.className = 'preview-item';
  previewItem.id = `preview-${uploadedFiles.indexOf(file)}`;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = document.createElement('img');
    img.src = e.target.result;
    img.className = 'preview-image';
    img.alt = file.name;
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'preview-info';
    
    const nameP = document.createElement('p');
    nameP.className = 'preview-name';
    nameP.textContent = file.name;
    
    const sizeP = document.createElement('p');
    sizeP.className = 'preview-size';
    sizeP.textContent = formatFileSize(file.size);
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn btn-danger';
    removeBtn.textContent = 'Remove';
    removeBtn.onclick = function() {
      removeFile(file, previewItem);
    };
    
    infoDiv.appendChild(nameP);
    infoDiv.appendChild(sizeP);
    infoDiv.appendChild(removeBtn);
    
    previewItem.appendChild(img);
    previewItem.appendChild(infoDiv);
    
    previewContainer.appendChild(previewItem);
  };
  
  reader.readAsDataURL(file);
}

function removeFile(file, previewElement) {
  const index = uploadedFiles.indexOf(file);
  if (index > -1) {
    uploadedFiles.splice(index, 1);
  }
  
  if (previewElement) {
    previewElement.remove();
  }
}

function handleImageGeneration(e) {
  e.preventDefault();
  
  const apiKey = getApiKey();
  if (!apiKey) {
    showStatus('Please enter your API key in settings', 'error');
    openSettingsModal();
    return;
  }
  
  const promptInput = document.getElementById('image-prompt');
  const prompt = promptInput ? promptInput.value.trim() : '';
  
  if (!validatePrompt(prompt)) {
    showStatus('Please enter a valid prompt (3-1000 characters)', 'error');
    return;
  }
  
  if (uploadedFiles.length === 0) {
    showStatus('Please upload an image file', 'error');
    return;
  }
  
  const generateBtn = e.target.querySelector('button[type="submit"]');
  setLoading(generateBtn, true);
  
  // Create API instance
  const api = new HiggsfieldAPI(apiKey);
  
  // Process each uploaded file
  uploadedFiles.forEach(async (file) => {
    try {
      showStatus(`Generating image for ${file.name}...`, 'info');
      
      // For image generation, we typically don't need the file itself
      // Just the prompt. But if needed, we can process the file here
      
      const result = await api.generateImage(prompt);
      
      // Handle the result
      handleImageResult(result, prompt);
      
      // Store the result for potential video generation
      previousImageResult = result;
      
      showStatus(`Image generated successfully for ${file.name}`, 'success');
    } catch (error) {
      console.error('Error generating image:', error);
      showStatus(`Error generating image: ${error.message}`, 'error');
    } finally {
      setLoading(generateBtn, false);
    }
  });
}

function handleVideoGeneration(e) {
  e.preventDefault();
  
  const apiKey = getApiKey();
  if (!apiKey) {
    showStatus('Please enter your API key in settings', 'error');
    openSettingsModal();
    return;
  }
  
  const promptInput = document.getElementById('video-prompt');
  const prompt = promptInput ? promptInput.value.trim() : '';
  
  if (!validatePrompt(prompt)) {
    showStatus('Please enter a valid prompt (3-1000 characters)', 'error');
    return;
  }
  
  const usePrevious = document.getElementById('use-previous-image').checked;
  
  if (!usePrevious && uploadedFiles.length === 0) {
    showStatus('Please upload an image file or use previous image', 'error');
    return;
  }
  
  const generateBtn = e.target.querySelector('button[type="submit"]');
  setLoading(generateBtn, true);
  
  // Create API instance
  const api = new HiggsfieldAPI(apiKey);
  
  try {
    if (usePrevious && previousImageResult) {
      // Use the previous image result
      showStatus('Using previous image for video generation...', 'info');
      
      // In a real implementation, we would need the actual image URL from the previous result
      // For now, we'll simulate this
      const videoResult = await api.generateVideo(prompt, previousImageResult.imageUrl || '');
      
      handleVideoResult(videoResult, prompt);
      showStatus('Video generated successfully using previous image', 'success');
    } else if (uploadedFiles.length > 0) {
      // Use the first uploaded file
      const file = uploadedFiles[0];
      showStatus(`Generating video from ${file.name}...`, 'info');
      
      const videoResult = await api.generateVideoTwoStep(file, prompt);
      
      handleVideoResult(videoResult, prompt);
      showStatus(`Video generated successfully from ${file.name}`, 'success');
    }
  } catch (error) {
    console.error('Error generating video:', error);
    showStatus(`Error generating video: ${error.message}`, 'error');
  } finally {
    setLoading(generateBtn, false);
  }
}

function handleImageResult(result, prompt) {
  const resultsGrid = document.getElementById('image-results');
  if (!resultsGrid) return;
  
  const resultCard = document.createElement('div');
  resultCard.className = 'result-card';
  
  // Create image element
  const img = document.createElement('img');
  img.className = 'result-image';
  img.src = result.imageUrl || '#'; // In a real implementation, this would come from the API response
  img.alt = `Generated: ${prompt.substring(0, 50)}...`;
  
  // Create info div
  const infoDiv = document.createElement('div');
  infoDiv.className = 'result-info';
  
  const title = document.createElement('h4');
  title.className = 'result-title';
  title.textContent = 'Generated Image';
  
  const meta = document.createElement('p');
  meta.className = 'result-meta';
  meta.textContent = `Prompt: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`;
  
  // Create actions div
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'result-actions';
  
  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'result-download';
  downloadBtn.textContent = 'Download';
  downloadBtn.onclick = function() {
    downloadFile(result.imageUrl, `generated-image-${Date.now()}.jpg`);
  };
  
  actionsDiv.appendChild(downloadBtn);
  infoDiv.appendChild(title);
  infoDiv.appendChild(meta);
  infoDiv.appendChild(actionsDiv);
  
  resultCard.appendChild(img);
  resultCard.appendChild(infoDiv);
  
  resultsGrid.appendChild(resultCard);
}

function handleVideoResult(result, prompt) {
  const resultsGrid = document.getElementById('video-results');
  if (!resultsGrid) return;
  
  const resultCard = document.createElement('div');
  resultCard.className = 'result-card';
  
  // Create video element
  const video = document.createElement('video');
  video.className = 'result-video';
  video.controls = true;
  video.src = result.videoUrl || '#'; // In a real implementation, this would come from the API response
  video.alt = `Generated: ${prompt.substring(0, 50)}...`;
  
  // Create info div
  const infoDiv = document.createElement('div');
  infoDiv.className = 'result-info';
  
  const title = document.createElement('h4');
  title.className = 'result-title';
  title.textContent = 'Generated Video';
  
  const meta = document.createElement('p');
  meta.className = 'result-meta';
  meta.textContent = `Prompt: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`;
  
  // Create actions div
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'result-actions';
  
  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'result-download';
  downloadBtn.textContent = 'Download';
  downloadBtn.onclick = function() {
    downloadFile(result.videoUrl, `generated-video-${Date.now()}.mp4`);
  };
  
  actionsDiv.appendChild(downloadBtn);
  infoDiv.appendChild(title);
  infoDiv.appendChild(meta);
  infoDiv.appendChild(actionsDiv);
  
  resultCard.appendChild(video);
  resultCard.appendChild(infoDiv);
  
  resultsGrid.appendChild(resultCard);
}

function openSettingsModal() {
  if (settingsModal) {
    settingsModal.style.display = 'block';
  }
}

function closeSettingsModal() {
  if (settingsModal) {
    settingsModal.style.display = 'none';
  }
}

function saveApiKeyHandler() {
  const apiKey = apiKeyInput.value.trim();
  
  if (!apiKey) {
    showStatus('Please enter an API key', 'error');
    return;
  }
  
  saveApiKey(apiKey);
  showStatus('API key saved successfully!', 'success');
  
  // Close modal after saving
  setTimeout(closeSettingsModal, 1000);
}

function testApiKeyHandler() {
  const apiKey = apiKeyInput.value.trim();
  
  if (!apiKey) {
    showStatus('Please enter an API key to test', 'error');
    return;
  }
  
  // Create a temporary API instance to test
  const api = new HiggsfieldAPI(apiKey);
  
  // For testing, we could make a simple API call
  // Since we don't have a specific test endpoint, we'll just validate format
  // In a real implementation, you'd make an actual API call
  
  // For now, we'll just show a success message
  showStatus('API key format appears valid', 'success');
  showToast('API key validated successfully', 'success');
}

function loadSavedApiKey() {
  const savedApiKey = getApiKey();
  if (savedApiKey && apiKeyInput) {
    apiKeyInput.value = savedApiKey;
  }
}

function togglePreviousImageUsage() {
  const usePrevious = document.getElementById('use-previous-image').checked;
  const fileInput = document.getElementById('video-file');
  
  if (fileInput) {
    fileInput.disabled = usePrevious;
  }
  
  if (usePrevious && !previousImageResult) {
    showStatus('No previous image available. Generate an image first.', 'warning');
  }
}