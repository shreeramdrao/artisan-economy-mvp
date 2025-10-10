import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CanvaService {
  private readonly logger = new Logger(CanvaService.name);
  private apiKey: string;
  private initialized = false;
  private baseUrl = 'https://api.canva.com/rest/v1';

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.apiKey = this.configService.get('canva.apiKey');
    
    if (!this.apiKey || this.apiKey === 'xxx' || this.apiKey === '') {
      this.logger.warn('Canva service not initialized: Missing API key - service will use fallback mode');
      this.initialized = false;
      return;
    }

    this.initialized = true;
    this.logger.log('Canva service initialized successfully');
  }

  private checkInitialized() {
    if (!this.initialized) {
      this.logger.warn('Canva service not available - using fallback mode');
      return false;
    }
    return true;
  }

  async polishImage(imageUrl: string): Promise<string> {
    try {
      if (!this.checkInitialized()) {
        return imageUrl; // Return original image if service not available
      }
      
      this.logger.log('Polishing image with Canva...');
      
      // ✅ Real Canva API integration with timeout handling
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
      
      try {
        const response = await firstValueFrom(
          this.httpService.post(
            'https://api.canva.com/v1/enhance',
            { imageUrl },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
              },
              signal: controller.signal,
              timeout: 15000,
            }
          )
        );
        
        clearTimeout(timeout);
        this.logger.log('Image polishing complete with Canva');
        
        return response.data?.enhancedUrl || imageUrl;
      } catch (error) {
        clearTimeout(timeout);
        if (error.name === 'AbortError') {
          this.logger.warn('[Canva Warning] Request timed out after 15 seconds');
        } else if (error.response?.status === 401) {
          this.logger.warn('[Canva Warning] Invalid API key or authentication failed');
        } else if (error.response?.status === 403) {
          this.logger.warn('[Canva Warning] API access forbidden - check permissions');
        } else if (error.response?.status === 429) {
          this.logger.warn('[Canva Warning] API rate limit exceeded');
        } else {
          this.logger.warn(`[Canva Warning] ${error.message}`);
        }
        
        // Fallback to original image
        return imageUrl;
      }
    } catch (error) {
      this.logger.warn(`[Canva Warning] ${error.message}`);
      return imageUrl;
    }
  }

  // ✅ New enhanceImage method for simpler API calls
  async enhanceImage(imageUrl: string): Promise<string> {
    try {
      if (!this.checkInitialized()) {
        return imageUrl; // Return original image if service not available
      }
      
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.canva.com/v1/enhance',
          { imageUrl },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 15000,
          }
        )
      );
      
      return response.data?.enhancedUrl || imageUrl;
    } catch (error) {
      this.logger.warn('Canva API fallback to original image:', error.message);
      return imageUrl; // fallback to original
    }
  }

  async createProductShowcase(
    imageUrl: string,
    title: string,
    price: number
  ): Promise<string> {
    try {
      if (!this.checkInitialized()) {
        return imageUrl; // Return original image if service not available
      }
      
      this.logger.log('Creating product showcase design...');
      
      // ✅ Enhanced product showcase creation with timeout handling
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout for complex design
      
      try {
        // Step 1: Create a product showcase design
        const createDesignResponse = await firstValueFrom(
          this.httpService.post(
            `${this.baseUrl}/designs`,
            {
              template_id: 'product_showcase_premium',
              brand: {
                colors: ['#FF6B35', '#F7931E', '#FFD23F', '#FFFFFF'],
                fonts: ['Montserrat', 'Playfair Display', 'Open Sans']
              },
              dimensions: { width: 1080, height: 1080 } // Instagram square format
            },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
              },
              signal: controller.signal,
            }
          )
        );
        
        const designId = createDesignResponse.data.design_id;
        
        // Step 2: Add product image
        await firstValueFrom(
          this.httpService.post(
            `${this.baseUrl}/designs/${designId}/elements`,
            {
              type: 'image',
              image_url: imageUrl,
              position: { x: 100, y: 200 },
              size: { width: 400, height: 400 },
              filters: {
                brightness: 1.05,
                contrast: 1.1,
                saturation: 1.15,
                sharpness: 'high'
              },
              effects: ['drop_shadow', 'rounded_corners']
            },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
              },
              signal: controller.signal,
            }
          )
        );
        
        // Step 3: Add title text
        await firstValueFrom(
          this.httpService.post(
            `${this.baseUrl}/designs/${designId}/elements`,
            {
              type: 'text',
              text: title,
              position: { x: 100, y: 650 },
              size: { width: 400, height: 100 },
              style: {
                font_family: 'Playfair Display',
                font_size: 32,
                font_weight: 'bold',
                color: '#2C3E50',
                text_align: 'center'
              },
              effects: ['text_shadow']
            },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
              },
              signal: controller.signal,
            }
          )
        );
        
        // Step 4: Add price badge
        await firstValueFrom(
          this.httpService.post(
            `${this.baseUrl}/designs/${designId}/elements`,
            {
              type: 'shape',
              shape_type: 'rectangle',
              position: { x: 200, y: 780 },
              size: { width: 200, height: 60 },
              style: {
                background_color: '#FF6B35',
                border_radius: 30,
                border_color: '#FFFFFF',
                border_width: 3
              }
            },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
              },
              signal: controller.signal,
            }
          )
        );
        
        // Step 5: Add price text
        await firstValueFrom(
          this.httpService.post(
            `${this.baseUrl}/designs/${designId}/elements`,
            {
              type: 'text',
              text: `₹${price}`,
              position: { x: 200, y: 780 },
              size: { width: 200, height: 60 },
              style: {
                font_family: 'Montserrat',
                font_size: 24,
                font_weight: 'bold',
                color: '#FFFFFF',
                text_align: 'center'
              }
            },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
              },
              signal: controller.signal,
            }
          )
        );
        
        // Step 6: Add decorative elements
        await firstValueFrom(
          this.httpService.post(
            `${this.baseUrl}/designs/${designId}/elements`,
            {
              type: 'shape',
              shape_type: 'circle',
              position: { x: 50, y: 50 },
              size: { width: 100, height: 100 },
              style: {
                background_color: '#F7931E',
                opacity: 0.3
              }
            },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
              },
              signal: controller.signal,
            }
          )
        );
        
        // Step 7: Export the final design
        const exportResponse = await firstValueFrom(
          this.httpService.post(
            `${this.baseUrl}/designs/${designId}/exports`,
            {
              format: 'jpg',
              quality: 'high',
              scale: 1,
              background: 'white'
            },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
              },
              signal: controller.signal,
            }
          )
        );
        
        clearTimeout(timeout);
        this.logger.log('Product showcase design created successfully');
        
        return exportResponse.data.download_url || imageUrl;
      } catch (error) {
        clearTimeout(timeout);
        if (error.name === 'AbortError') {
          this.logger.warn('[Canva Warning] Request timed out after 60 seconds');
        } else if (error.response?.status === 401) {
          this.logger.warn('[Canva Warning] Invalid API key or authentication failed');
        } else if (error.response?.status === 403) {
          this.logger.warn('[Canva Warning] API access forbidden - check permissions');
        } else if (error.response?.status === 429) {
          this.logger.warn('[Canva Warning] API rate limit exceeded');
        } else {
          this.logger.warn(`[Canva Warning] ${error.message}`);
        }
        
        // Fallback to original image
        return imageUrl;
      }
    } catch (error) {
      this.logger.warn(`[Canva Warning] ${error.message}`);
      return imageUrl;
    }
  }
}