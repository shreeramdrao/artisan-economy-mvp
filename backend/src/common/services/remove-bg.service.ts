import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';

@Injectable()
export class RemoveBgService {
  private readonly logger = new Logger(RemoveBgService.name);
  private apiKey: string;
  private initialized = false;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.apiKey = this.configService.get('removeBg.apiKey');
    
    if (!this.apiKey || this.apiKey === 'xxx' || this.apiKey === '') {
      this.logger.warn('Remove.bg service not initialized: Missing API key - service will use fallback mode');
      this.initialized = false;
      return;
    }

    this.initialized = true;
    this.logger.log('Remove.bg service initialized successfully');
  }

  private checkInitialized() {
    if (!this.initialized) {
      this.logger.warn('Remove.bg service not available - using fallback mode');
      return false;
    }
    return true;
  }

  async removeBackground(imageBuffer: Buffer): Promise<Buffer> {
    try {
      if (!this.checkInitialized()) {
        return imageBuffer; // Return original buffer if service not available
      }
      
      this.logger.log('Removing background from image...');
      
      // ✅ Real Remove.bg API integration with timeout handling
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout
      
      try {
        const formData = new FormData();
        formData.append('image_file', imageBuffer, {
          filename: 'image.jpg',
          contentType: 'image/jpeg',
        });
        formData.append('size', 'auto');
        formData.append('type', 'product');
        formData.append('format', 'png');
        
        const response = await firstValueFrom(
          this.httpService.post('https://api.remove.bg/v1.0/removebg', formData, {
            headers: {
              ...formData.getHeaders(),
              'X-Api-Key': this.apiKey,
            },
            responseType: 'arraybuffer',
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            signal: controller.signal,
            timeout: 20000,
          })
        );
        
        clearTimeout(timeout);
        this.logger.log('Background removed successfully');
        return Buffer.from(response.data);
      } catch (error) {
        clearTimeout(timeout);
        if (error.name === 'AbortError') {
          this.logger.warn('[Remove.bg Warning] Request timed out after 20 seconds');
        } else if (error.response?.status === 400) {
          this.logger.warn('[Remove.bg Warning] Invalid image format or corrupted image');
        } else if (error.response?.status === 402) {
          this.logger.warn('[Remove.bg Warning] API credit limit exceeded');
        } else if (error.response?.status === 403) {
          this.logger.warn('[Remove.bg Warning] Invalid API key');
        } else if (error.response?.status === 413) {
          this.logger.warn('[Remove.bg Warning] Image file too large');
        } else if (error.response?.status === 429) {
          this.logger.warn('[Remove.bg Warning] API rate limit exceeded');
        } else {
          this.logger.warn(`[Remove.bg Warning] ${error.message}`);
        }
        
        // Return original image as fallback
        return imageBuffer;
      }
    } catch (error) {
      this.logger.warn(`[Remove.bg Warning] ${error.message}`);
      return imageBuffer;
    }
  }

  // ✅ New method for URL-based background removal
  async removeBackgroundFromUrl(imageUrl: string): Promise<string> {
    try {
      if (!this.checkInitialized()) {
        return imageUrl; // Return original URL if service not available
      }
      
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.remove.bg/v1.0/removebg',
          { 
            image_url: imageUrl, 
            size: 'auto',
            type: 'product',
            format: 'png'
          },
          {
            headers: {
              'X-Api-Key': this.apiKey,
              'Content-Type': 'application/json',
            },
            timeout: 20000,
          }
        )
      );

      return response.data?.data?.result_b64 
        ? `data:image/png;base64,${response.data.data.result_b64}` 
        : imageUrl;
    } catch (error) {
      this.logger.warn('Remove.bg failed, returning original image');
      return imageUrl;
    }
  }

  async removeBackgroundBase64(base64Image: string): Promise<string> {
    try {
      if (!this.checkInitialized()) {
        return base64Image; // Return original base64 if service not available
      }
      
      // Convert base64 to buffer
      const imageBuffer = Buffer.from(base64Image, 'base64');
      
      // Process the image
      const processedBuffer = await this.removeBackground(imageBuffer);
      
      // Convert back to base64
      return processedBuffer.toString('base64');
    } catch (error) {
      this.logger.warn(`[Remove.bg Warning] ${error.message}`);
      // Return original base64 as fallback
      return base64Image;
    }
  }
}