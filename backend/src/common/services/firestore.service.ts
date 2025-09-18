import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Firestore, FieldValue } from '@google-cloud/firestore';

@Injectable()
export class FirestoreService {
  private readonly logger = new Logger(FirestoreService.name);
  private firestore: Firestore;
  private initialized = false;

  constructor(private configService: ConfigService) {
    try {
      const projectId = this.configService.get('googleCloud.projectId');
      const keyFilename = this.configService.get('googleCloud.credentials');

      if (!projectId) {
        this.logger.warn('Firestore not initialized: Missing project ID');
        return;
      }

      this.firestore = new Firestore({
        projectId,
        keyFilename: keyFilename || undefined,
        databaseId:
          this.configService.get('firestore.databaseId') || '(default)',
      });

      this.initialized = true;
      this.logger.log('Firestore initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firestore:', error);
    }
  }

  private checkInitialized() {
    if (!this.initialized) {
      throw new Error('Firestore service not available');
    }
  }

  // ------------------ CREATE ------------------
  async createDocument(
    collection: string,
    documentId: string, // 🔑 can now be email (used as unique key)
    data: any,
  ): Promise<any> {
    try {
      this.checkInitialized();

      const docData = {
        ...data,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      await this.firestore.collection(collection).doc(documentId).set(docData);
      this.logger.log(`Document created: ${collection}/${documentId}`);

      const doc = await this.firestore.collection(collection).doc(documentId).get();
      return { id: documentId, ...doc.data() };
    } catch (error) {
      this.logger.error(`Error creating document in ${collection}:`, error);
      throw error;
    }
  }

  // ------------------ READ (by ID/email) ------------------
  async getDocument(collection: string, documentId: string): Promise<any> {
    try {
      this.checkInitialized();

      const doc = await this.firestore.collection(collection).doc(documentId).get();
      if (!doc.exists) {
        return null;
      }

      const data = doc.data() || {};
      return {
        id: doc.id,
        ...data,
        createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : null,
        updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : null,
      };
    } catch (error) {
      this.logger.error(
        `Error getting document ${documentId} from ${collection}:`,
        error,
      );
      throw error;
    }
  }

  // ------------------ UPDATE ------------------
  async updateDocument(
    collection: string,
    documentId: string,
    data: any,
  ): Promise<any> {
    try {
      this.checkInitialized();

      const updateData = {
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
      };

      await this.firestore.collection(collection).doc(documentId).update(updateData);
      this.logger.log(`Document updated: ${collection}/${documentId}`);

      return await this.getDocument(collection, documentId);
    } catch (error) {
      this.logger.error(
        `Error updating document ${documentId} in ${collection}:`,
        error,
      );
      throw error;
    }
  }

  // ------------------ DELETE ------------------
  async deleteDocument(
    collection: string,
    documentId: string,
  ): Promise<{ success: boolean }> {
    try {
      this.checkInitialized();

      await this.firestore.collection(collection).doc(documentId).delete();
      this.logger.log(`Document deleted: ${collection}/${documentId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Error deleting document ${documentId} from ${collection}:`,
        error,
      );
      throw error;
    }
  }

  // ------------------ QUERY ------------------
  async queryDocuments(collection: string, query?: any): Promise<any[]> {
    try {
      this.checkInitialized();

      let ref: any = this.firestore.collection(collection);

      if (query) {
        if (query.field && query.operator && query.value !== undefined) {
          ref = ref.where(query.field, query.operator, query.value);
        }

        if (query.orderBy) {
          ref = ref.orderBy(query.orderBy.field, query.orderBy.direction || 'asc');
        }

        if (query.limit) {
          ref = ref.limit(query.limit);
        }
      }

      const snapshot = await ref.get();

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : null,
          updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : null,
        };
      });
    } catch (error) {
      this.logger.error(
        `Error querying documents from ${collection}:`,
        error,
      );
      throw error;
    }
  }

  // ------------------ INCREMENT FIELD ------------------
  async incrementField(
    collection: string,
    documentId: string,
    field: string,
    value: number = 1,
  ): Promise<void> {
    try {
      this.checkInitialized();

      await this.firestore.collection(collection).doc(documentId).update({
        [field]: FieldValue.increment(value),
        updatedAt: FieldValue.serverTimestamp(),
      });

      this.logger.log(
        `Incremented ${field} by ${value} in ${collection}/${documentId}`,
      );
    } catch (error) {
      this.logger.error(`Error incrementing field ${field}:`, error);
      throw error;
    }
  }

  // ------------------ GET ALL ------------------
  async getAllDocuments(collection: string): Promise<any[]> {
    try {
      this.checkInitialized();

      const snapshot = await this.firestore.collection(collection).get();
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : null,
          updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : null,
        };
      });
    } catch (error) {
      this.logger.error(`Error fetching all documents from ${collection}:`, error);
      throw error;
    }
  }

  // ------------------ SET (create or overwrite) ------------------
  async setDocument(
    collection: string,
    documentId: string,
    data: any,
  ): Promise<void> {
    try {
      this.checkInitialized();

      const docData = {
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
      };

      await this.firestore.collection(collection).doc(documentId).set(docData, {
        merge: true,
      });
      this.logger.log(`Document set: ${collection}/${documentId}`);
    } catch (error) {
      this.logger.error(
        `Error setting document ${documentId} in ${collection}:`,
        error,
      );
      throw error;
    }
  }

  // ------------------ FIND BY FIELD ------------------
  async findByField(
    collection: string,
    field: string,
    value: any,
  ): Promise<any | null> {
    try {
      this.checkInitialized();

      const snapshot = await this.firestore
        .collection(collection)
        .where(field, '==', value)
        .limit(1)
        .get();

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : null,
        updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : null,
      };
    } catch (error) {
      this.logger.error(
        `Error finding document in ${collection} by ${field}:`,
        error,
      );
      throw error;
    }
  }
}