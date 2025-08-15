export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  status: 'processing' | 'ready' | 'error';
  content?: string;
  metadata?: {
    pages?: number;
    language?: string;
    category?: string;
  };
}

export interface Query {
  id: string;
  text: string;
  userId: string;
  timestamp: string;
  status: 'processing' | 'completed' | 'error';
  response?: QueryResponse;
  processingTime?: number;
}

export interface QueryResponse {
  decision: 'approved' | 'rejected' | 'pending' | 'requires_review';
  amount?: number;
  currency?: string;
  justification: string;
  clauses: Clause[];
  confidence: number;
  metadata: {
    documentsSearched: number;
    relevantClauses: number;
    processingTime: number;
  };
}

export interface Clause {
  id: string;
  text: string;
  documentId: string;
  documentName: string;
  relevanceScore: number;
  section?: string;
  page?: number;
}

export interface ParsedQuery {
  age?: number;
  gender?: string;
  procedure?: string;
  location?: string;
  policyDuration?: string;
  amount?: number;
  category: string;
  intent: string;
  entities: Record<string, any>;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}