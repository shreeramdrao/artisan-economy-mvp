import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage, Bucket } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private storage: Storage;
  private bucket: Bucket;
  private bucketName: string;
  private initialized = false;

  constructor(private configService: ConfigService) {
    try {
      const projectId = this.configService.get('googleCloud.projectId');
      const keyFilename = this.configService.get('googleCloud.credentials');
      this.bucketName = this.configService.get('storage.bucketName');

      if (!projectId || !this.bucketName) {
        this.logger.warn('Cloud Storage not initialized: Missing configuration');
        return;
      }

      this.storage = new Storage({
        projectId,
        keyFilename: keyFilename || undefined,
      });

      this.bucket = this.storage.bucket(this.bucketName);
      this.initialized = true;
      this.logger.log(`Cloud Storage initialized with bucket: ${this.bucketName}`);
    } catch (error) {
      this.logger.error('Failed to initialize Cloud Storage:', error);
    }
  }

  private checkInitialized() {
    if (!this.initialized) {
      throw new Error('Cloud Storage service not available');
    }
  }

  async uploadFile(
    buffer: Buffer, 
    fileName: string, 
    mimeType: string,
    makePublic: boolean = true  // Keep parameter for compatibility but don't use makePublic()
  ): Promise<string> {
    try {
      this.checkInitialized();
      
      const file = this.bucket.file(fileName);
      
      await file.save(buffer, {
        metadata: {
          contentType: mimeType,
          cacheControl: 'public, max-age=31536000',
        },
        resumable: false,
        // Don't set predefinedAcl when uniform bucket-level access is enabled
        // predefinedAcl: 'publicRead',
      });

      // Don't call makePublic() with uniform bucket-level access
      // The bucket should be configured with allUsers having Storage Object Viewer role
      // await file.makePublic();

      const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
      this.logger.log(`File uploaded successfully: ${fileName}`);
      
      return publicUrl;
    } catch (error) {
      this.logger.error('Error uploading file:', error);
      throw error;
    }
  }

  async uploadBase64(
    base64Data: string,
    fileName: string,
    mimeType: string,
    makePublic: boolean = true
  ): Promise<string> {
    try {
      const buffer = Buffer.from(base64Data, 'base64');
      return await this.uploadFile(buffer, fileName, mimeType, makePublic);
    } catch (error) {
      this.logger.error('Error uploading base64 file:', error);
      throw error;
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      this.checkInitialized();
      
      await this.bucket.file(fileName).delete();
      this.logger.log(`File deleted: ${fileName}`);
    } catch (error) {
      this.logger.error('Error deleting file:', error);
      // Don't throw if file doesn't exist
      if (error.code !== 404) {
        throw error;
      }
    }
  }

  async getSignedUrl(
    fileName: string, 
    action: 'read' | 'write' = 'read',
    expiresInMinutes: number = 60
  ): Promise<string> {
    try {
      this.checkInitialized();
      
      const options = {
        version: 'v4' as const,
        action: action,
        expires: Date.now() + expiresInMinutes * 60 * 1000,
      };
      
      const [url] = await this.bucket.file(fileName).getSignedUrl(options);
      return url;
    } catch (error) {
      this.logger.error('Error generating signed URL:', error);
      throw error;
    }
  }

  async fileExists(fileName: string): Promise<boolean> {
    try {
      this.checkInitialized();
      
      const [exists] = await this.bucket.file(fileName).exists();
      return exists;
    } catch (error) {
      this.logger.error('Error checking file existence:', error);
      return false;
    }
  }

  async downloadFile(fileName: string): Promise<Buffer> {
    try {
      this.checkInitialized();
      
      const [buffer] = await this.bucket.file(fileName).download();
      return buffer;
    } catch (error) {
      this.logger.error('Error downloading file:', error);
      throw error;
    }
  }

  generateFileName(prefix: string, extension: string): string {
    const timestamp = Date.now();
    const random = uuidv4().split('-')[0];
    return `${prefix}_${timestamp}_${random}.${extension}`;
  }

  getPublicUrl(fileName: string): string {
    return `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
  }
}