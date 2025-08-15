
class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await this.handleResponse<{ user: any; token: string }>(response);
    localStorage.setItem('token', data.token);
    return data;
  }

  async register(email: string, password: string, name: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    
    const data = await this.handleResponse<{ user: any; token: string }>(response);
    localStorage.setItem('token', data.token);
    return data;
  }

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ user: any }>(response);
  }

  async logout() {
    localStorage.removeItem('token');
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
  }

  // Documents
  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('document', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    });

    return this.handleResponse<{ document: any }>(response);
  }

  async getDocuments() {
    const response = await fetch(`${API_BASE_URL}/api/documents`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ documents: any[] }>(response);
  }

  async getDocument(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ document: any }>(response);
  }

  async deleteDocument(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ message: string }>(response);
  }

  // Queries
  async submitQuery(text: string) {
    const response = await fetch(`${API_BASE_URL}/api/queries`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ text })
    });
    return this.handleResponse<{ query: any }>(response);
  }

  async getQueries() {
    const response = await fetch(`${API_BASE_URL}/api/queries`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ queries: any[] }>(response);
  }

  async getQuery(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/queries/${id}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ query: any }>(response);
  }
}

export const apiService = new ApiService();