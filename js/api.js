class HiggsfieldAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = CONFIG.BASE_URL;
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  async generateImage(prompt, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${CONFIG.ENDPOINTS.NANO_BANANA}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          prompt: prompt,
          ...options
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }

  async generateVideo(prompt, imageUrl, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${CONFIG.ENDPOINTS.VEO_3_1}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          prompt: prompt,
          image_url: imageUrl,
          ...options
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating video:', error);
      throw error;
    }
  }

  async getStatus(requestId) {
    try {
      const response = await fetch(
        `${this.baseUrl}${CONFIG.ENDPOINTS.STATUS.replace('{id}', requestId)}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting status:', error);
      throw error;
    }
  }

  async pollImageStatus(requestId, onProgress) {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const poll = async () => {
        if (Date.now() - startTime > CONFIG.POLLING.IMAGE_TIMEOUT) {
          reject(new Error('Image generation timeout'));
          return;
        }

        try {
          const status = await this.getStatus(requestId);
          
          if (onProgress) {
            onProgress(status);
          }

          if (status.status === 'completed') {
            resolve(status);
          } else if (status.status === 'failed') {
            reject(new Error('Image generation failed'));
          } else {
            setTimeout(poll, CONFIG.POLLING.IMAGE_INTERVAL);
          }
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  async pollVideoStatus(requestId, onProgress) {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const poll = async () => {
        if (Date.now() - startTime > CONFIG.POLLING.VIDEO_TIMEOUT) {
          reject(new Error('Video generation timeout'));
          return;
        }

        try {
          const status = await this.getStatus(requestId);
          
          if (onProgress) {
            onProgress(status);
          }

          if (status.status === 'completed') {
            resolve(status);
          } else if (status.status === 'failed') {
            reject(new Error('Video generation failed'));
          } else {
            setTimeout(poll, CONFIG.POLLING.VIDEO_INTERVAL);
          }
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  async generateVideoTwoStep(imageFile, prompt, options = {}) {
    // Step 1: Upload image and get URL
    const imageUploadResponse = await this.uploadImage(imageFile);
    const imageUrl = imageUploadResponse.url;

    // Step 2: Generate video using the image URL
    const videoGenerationResponse = await this.generateVideo(prompt, imageUrl, options);
    return videoGenerationResponse;
  }

  async uploadImage(file) {
    // This is a simplified version - in reality, you might need to upload to a specific endpoint
    // For now, we'll simulate this with a data URL or placeholder
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({ url: e.target.result });
      };
      reader.readAsDataURL(file);
    });
  }
}