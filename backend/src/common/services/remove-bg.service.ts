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
    
    if (!this.apiKey || this.apiKey === 'xxx') {
      this.logger.warn('Remove.bg service not initialized: Missing API key');
      return;
    }

    this.initialized = true;
    this.logger.log('Remove.bg service initialized');
  }

  private checkInitialized() {
    if (!this.initialized) {
      throw new Error('Remove.bg service not available');
    }
  }

  async removeBackground(imageBuffer: Buffer): Promise<Buffer> {
    try {
      this.checkInitialized();
      
      this.logger.log('Removing background from image...');
      
      const formData = new FormData();
      formData.append('image_file', imageBuffer, {
        filename: 'image.jpg',
        contentType: 'image/jpeg',
      });
      formData.append('size', 'auto');
      formData.append('type', 'product');
      formData.append('format', 'jpg');
      formData.append('bg_color', 'FFFFFF');
      
      const response = await firstValueFrom(
        this.httpService.post('https://api.remove.bg/v1.0/removebg', formData, {
          headers: {
            ...formData.getHeaders(),
            'X-Api-Key': this.apiKey,
          },
          responseType: 'arraybuffer',
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        })
      );
      
      this.logger.log('Background removed successfully');
      return Buffer.from(response.data);
    } catch (error) {
      if (error.response?.status === 402) {
        this.logger.error('Remove.bg API credit limit exceeded');
      } else if (error.response?.status === 403) {
        this.logger.error('Remove.bg API key invalid');
      } else {
        this.logger.error('Error removing background:', error.message);
      }
      
      // Return original image as fallback
      return imageBuffer;
    }
  }

  async removeBackgroundBase64(base64Image: string): Promise<string> {
    try {
      const imageBuffer = Buffer.from(base64Image, 'base64');
      const processedBuffer = await this.removeBackground(imageBuffer);
      return processedBuffer.toString('base64');
    } catch (error) {
      this.logger.error('Error processing base64 image:', error);
      return base64Image;
    }
  }
}