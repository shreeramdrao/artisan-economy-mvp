import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImageAnnotatorClient } from '@google-cloud/vision';

@Injectable()
export class VisionService {
  private readonly logger = new Logger(VisionService.name);
  private visionClient: ImageAnnotatorClient;
  private initialized = false;

  constructor(private configService: ConfigService) {
    try {
      const projectId = this.configService.get('googleCloud.projectId');
      const keyFilename = this.configService.get('googleCloud.credentials');
      
      if (!projectId) {
        this.logger.warn('Vision API not initialized: Missing configuration');
        return;
      }

      this.visionClient = new ImageAnnotatorClient({
        projectId,
        keyFilename: keyFilename || undefined,
      });

      this.initialized = true;
      this.logger.log('Vision API service initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Vision API:', error);
    }
  }

  private checkInitialized() {
    if (!this.initialized) {
      throw new Error('Vision API service not available');
    }
  }

  async analyzeProductImage(imageBuffer: Buffer) {
    try {
      this.checkInitialized();
      
      const [result] = await this.visionClient.annotateImage({
        image: {
          content: imageBuffer.toString('base64'),
        },
        features: [
          { type: 'LABEL_DETECTION', maxResults: 10 },
          { type: 'IMAGE_PROPERTIES', maxResults: 5 },
          { type: 'OBJECT_LOCALIZATION', maxResults: 5 },
          { type: 'SAFE_SEARCH_DETECTION' },
        ],
      });

      // Extract labels/tags
      const labels = result.labelAnnotations || [];
      const tags = labels
        .filter(label => label.score && label.score > 0.7)
        .map(label => label.description?.toLowerCase() || '')
        .filter(tag => tag.length > 0);

      // Extract dominant colors
      const imageProps = result.imagePropertiesAnnotation;
      const colors = imageProps?.dominantColors?.colors?.slice(0, 3).map(color => {
        const rgb = color.color;
        return `rgb(${Math.round(rgb?.red || 0)}, ${Math.round(rgb?.green || 0)}, ${Math.round(rgb?.blue || 0)})`;
      }) || [];

      // Detect objects
      const objects = result.localizedObjectAnnotations || [];
      const detectedObjects = objects.map(obj => obj.name?.toLowerCase() || '').filter(name => name.length > 0);

      // Safety check
      const safeSearch = result.safeSearchAnnotation;
      const isSafe = !safeSearch || (
        safeSearch.adult !== 'LIKELY' && 
        safeSearch.adult !== 'VERY_LIKELY' &&
        safeSearch.violence !== 'LIKELY' &&
        safeSearch.violence !== 'VERY_LIKELY'
      );

      // Determine categories based on tags
      const categories = this.inferCategories(tags, detectedObjects);

      this.logger.log(`Image analysis complete: ${tags.length} tags, ${categories.length} categories`);

      return {
        tags: [...new Set([...tags, ...detectedObjects])].slice(0, 15),
        categories,
        colors,
        confidence: labels[0]?.score || 0,
        isSafe,
        objects: detectedObjects,
      };
    } catch (error) {
      this.logger.error('Error analyzing image with Vision API:', error);
      return {
        tags: ['handmade', 'artisan', 'craft'],
        categories: ['Handicrafts'],
        colors: [],
        confidence: 0.5,
        isSafe: true,
        objects: [],
      };
    }
  }

  private inferCategories(tags: string[], objects: string[]): string[] {
    const allTerms = [...tags, ...objects].map(t => t.toLowerCase());
    const categories = new Set<string>();

    const categoryMappings = {
      'Pottery': ['pot', 'ceramic', 'clay', 'vase', 'earthenware', 'terracotta'],
      'Textiles': ['fabric', 'cloth', 'textile', 'saree', 'silk', 'cotton', 'weaving', 'embroidery'],
      'Jewelry': ['jewelry', 'jewellery', 'necklace', 'bracelet', 'ring', 'earring', 'gold', 'silver'],
      'Woodwork': ['wood', 'wooden', 'carving', 'furniture', 'timber'],
      'Metalwork': ['metal', 'brass', 'copper', 'bronze', 'iron', 'steel'],
      'Paintings': ['painting', 'art', 'canvas', 'portrait', 'landscape'],
      'Sculptures': ['sculpture', 'statue', 'figurine', 'carving'],
      'Leather Goods': ['leather', 'bag', 'wallet', 'belt', 'shoes'],
      'Home Decor': ['decor', 'decoration', 'ornament', 'lamp', 'mirror', 'wall hanging'],
    };

    for (const [category, keywords] of Object.entries(categoryMappings)) {
      if (keywords.some(keyword => allTerms.some(term => term.includes(keyword)))) {
        categories.add(category);
      }
    }

    // Default category if none found
    if (categories.size === 0) {
      categories.add('Handicrafts');
    }

    return Array.from(categories);
  }
}
