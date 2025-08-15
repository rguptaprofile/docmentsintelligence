import { Query, QueryResponse, ParsedQuery, Clause } from '../types';
import { apiService } from './api';

class LLMService {
  async processQuery(queryText: string, userId: string): Promise<Query> {
    const { query } = await apiService.submitQuery(queryText);
    return query;
  }
}

export const llmService = new LLMService();