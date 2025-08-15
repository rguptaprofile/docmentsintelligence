import { Document } from '../types';
import { apiService } from './api';

export const documentService = {
  async uploadDocument(file: File): Promise<Document> {
    const { document } = await apiService.uploadDocument(file);
    return document;
  },

  async getDocuments(): Promise<Document[]> {
    const { documents } = await apiService.getDocuments();
    return documents;
  },

  async getDocument(id: string): Promise<Document | null> {
    try {
      const { document } = await apiService.getDocument(id);
      return document;
    } catch (error) {
      return null;
    }
  },

  async deleteDocument(id: string): Promise<boolean> {
    try {
      await apiService.deleteDocument(id);
      return true;
    } catch (error) {
      return false;
    }
  },

  searchDocuments(query: string): Document[] {
    // This would be implemented as a backend search endpoint
    return [];
  }
};