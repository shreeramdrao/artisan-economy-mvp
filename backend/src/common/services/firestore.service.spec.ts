import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FirestoreService } from './firestore.service';
import { Firestore } from '@google-cloud/firestore';

describe('FirestoreService', () => {
  let service: FirestoreService;
  let mockConfigService: Partial<ConfigService>;
  let mockFirestore: any;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn().mockReturnValue('test-project'),
    };

    mockFirestore = {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirestoreService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: Firestore,
          useValue: mockFirestore,
        },
      ],
    }).compile();

    service = module.get<FirestoreService>(FirestoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create document', async () => {
    const mockDoc = {
      id: 'test-id',
      data: jest.fn().mockReturnValue({ name: 'Test Product' }),
    };

    (mockFirestore.doc as jest.Mock).mockReturnValue({
      set: jest.fn().mockResolvedValue(mockDoc),
    });

    const result = await service.createDocument('products', 'test-id', { name: 'Test Product' });
    
    expect(result.success).toBe(true);
    expect(result.id).toBe('test-id');
  });

  it('should get document', async () => {
    const mockDoc = {
      id: 'test-id',
      data: jest.fn().mockReturnValue({ name: 'Test Product' }),
    };

    (mockFirestore.doc as jest.Mock).mockReturnValue({
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ name: 'Test Product' }),
        id: 'test-id',
      }),
    });

    const result = await service.getDocument('products', 'test-id');
    
    expect(result).toEqual({ name: 'Test Product' });
  });

  it('should handle document not found', async () => {
    (mockFirestore.doc as jest.Mock).mockReturnValue({
      get: jest.fn().mockResolvedValue({
        exists: false,
      }),
    });

    const result = await service.getDocument('products', 'non-existent-id');
    
    expect(result).toBeNull();
  });

  it('should update document', async () => {
    (mockFirestore.doc as jest.Mock).mockReturnValue({
      update: jest.fn().mockResolvedValue({}),
    });

    const result = await service.updateDocument('products', 'test-id', { name: 'Updated Product' });
    
    expect(result.success).toBe(true);
  });

  it('should delete document', async () => {
    (mockFirestore.doc as jest.Mock).mockReturnValue({
      delete: jest.fn().mockResolvedValue({}),
    });

    const result = await service.deleteDocument('products', 'test-id');
    
    expect(result.success).toBe(true);
  });

  it('should query documents', async () => {
    const mockQuerySnapshot = {
      docs: [
        {
          id: 'doc1',
          data: () => ({ name: 'Product 1' }),
        },
        {
          id: 'doc2',
          data: () => ({ name: 'Product 2' }),
        },
      ],
    };

    (mockFirestore.collection as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue(mockQuerySnapshot),
    });

    const result = await service.queryDocuments('products', {
      field: 'status',
      operator: '==',
      value: 'published',
    });
    
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ name: 'Product 1' });
  });
});
