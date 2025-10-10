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

      // ✅ FIX: Enable ignoreUndefinedProperties so Firestore ignores `undefined` values
      this.firestore = new Firestore({
        projectId,
        keyFilename: keyFilename || undefined,
        databaseId:
          this.configService.get('firestore.databaseId') || '(default)',
        ignoreUndefinedProperties: true, // 🔥 Added line
      });

      this.initialized = true;
      this.logger.log('Firestore initialized successfully (ignoreUndefinedProperties enabled)');
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
      this.logger.error(`Failed to create Firestore document ${collection}/${documentId}:`, error);
      throw new Error(`Firestore create failed for ${collection}/${documentId}: ${error.message}`);
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
      this.logger.error(`Failed to update Firestore document ${collection}/${documentId}:`, error);
      throw new Error(`Firestore update failed for ${collection}/${documentId}: ${error.message}`);
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
      this.logger.error(`Failed to delete Firestore document ${collection}/${documentId}:`, error);
      throw new Error(`Firestore delete failed for ${collection}/${documentId}: ${error.message}`);
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
      this.logger.error(`Failed to query Firestore documents from ${collection}:`, error);
      throw new Error(`Firestore query failed for ${collection}: ${error.message}`);
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
      this.logger.error(`Failed to increment Firestore field ${field} in ${collection}/${documentId}:`, error);
      throw new Error(`Firestore increment failed for ${collection}/${documentId}: ${error.message}`);
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
      this.logger.error(`Failed to set Firestore document ${collection}/${documentId}:`, error);
      throw new Error(`Firestore set failed for ${collection}/${documentId}: ${error.message}`);
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

  // ------------------ TRANSACTION METHODS ------------------
  async runTransaction<T>(updateFunction: (transaction: any) => Promise<T>): Promise<T> {
    try {
      this.checkInitialized();
      
      return await this.firestore.runTransaction(async (transaction) => {
        return await updateFunction(transaction);
      });
    } catch (error) {
      this.logger.error('Transaction failed:', error);
      throw new Error(`Firestore transaction failed: ${error.message}`);
    }
  }

  // ------------------ UTILITY METHODS ------------------
  getDocRef(collection: string, documentId: string) {
    this.checkInitialized();
    return this.firestore.collection(collection).doc(documentId);
  }
}