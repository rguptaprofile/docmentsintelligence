import React, { useState, useRef } from 'react';
import { 
  Send, 
  Loader, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  FileText,
  Brain
} from 'lucide-react';
import { llmService } from '../../services/llmService';
import { useAuth } from '../../contexts/AuthContext';
import { Query, QueryResponse } from '../../types';

export const QueryAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [currentQuery, setCurrentQuery] = useState<Query | null>(null);
  const [loading, setLoading] = useState(false);
  const [queryHistory, setQueryHistory] = useState<Query[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { user } = useAuth();

  const sampleQueries = [
    "46-year-old male, knee surgery in Pune, 3-month-old insurance policy",
    "Heart surgery coverage for 55-year-old female in Mumbai",
    "Dental procedure claim verification for 6-month policy",
    "Eye surgery eligibility for 42-year-old in Delhi"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !user) return;

    setLoading(true);
    try {
      const newQuery = await llmService.processQuery(query.trim(), user.id);
      setCurrentQuery(newQuery);
      setQueryHistory(prev => [newQuery, ...prev]);
      
      // Poll for completion
      const pollInterval = setInterval(async () => {
        if (newQuery.status === 'completed' || newQuery.status === 'error') {
          clearInterval(pollInterval);
          setLoading(false);
          return;
        }
        
        // In a real app, you'd fetch the updated query from the backend
        setTimeout(() => {
          if (newQuery.status === 'processing') {
            newQuery.status = 'completed';
            setCurrentQuery({ ...newQuery });
            setLoading(false);
            clearInterval(pollInterval);
          }
        }, 3000);
      }, 1000);
      
    } catch (error) {
      console.error('Query processing failed:', error);
      setLoading(false);
    }
  };

  const handleSampleQuery = (sampleQuery: string) => {
    setQuery(sampleQuery);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'requires_review':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'requires_review':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR'
    }).format(amount);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Query Assistant</h1>
        <p className="text-gray-600">Ask questions about your documents in natural language</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Query Input */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your query
                </label>
                <textarea
                  ref={textareaRef}
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="e.g., 46-year-old male, knee surgery in Pune, 3-month-old insurance policy"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Process Query
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Query Result */}
          {currentQuery && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Query Result</h2>
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">
                    {currentQuery.processingTime ? `${(currentQuery.processingTime / 1000).toFixed(1)}s` : 'Processing...'}
                  </span>
                </div>
              </div>

              {currentQuery.status === 'processing' ? (
                <div className="text-center py-8">
                  <Loader className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
                  <p className="text-gray-600">Analyzing your query and searching documents...</p>
                </div>
              ) : currentQuery.response ? (
                <div className="space-y-6">
                  {/* Decision */}
                  <div className={`p-4 rounded-lg border ${getStatusColor(currentQuery.response.decision)}`}>
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(currentQuery.response.decision)}
                      <div>
                        <p className="font-semibold capitalize">
                          {currentQuery.response.decision.replace('_', ' ')}
                        </p>
                        {currentQuery.response.amount && (
                          <p className="text-sm">
                            Amount: {formatCurrency(currentQuery.response.amount, currentQuery.response.currency || 'INR')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Justification */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Justification</h3>
                    <p className="text-gray-700 leading-relaxed">{currentQuery.response.justification}</p>
                  </div>

                  {/* Relevant Clauses */}
                  {currentQuery.response.clauses.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Supporting Clauses</h3>
                      <div className="space-y-3">
                        {currentQuery.response.clauses.map((clause) => (
                          <div key={clause.id} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-900">{clause.documentName}</span>
                              </div>
                              <span className="text-xs text-gray-500">
                                Relevance: {(clause.relevanceScore * 100).toFixed(0)}%
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{clause.text}</p>
                            {clause.section && (
                              <p className="text-xs text-gray-500 mt-1">{clause.section}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Analysis Metadata</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs text-blue-700">
                      <div>Documents Searched: {currentQuery.response.metadata.documentsSearched}</div>
                      <div>Relevant Clauses: {currentQuery.response.metadata.relevantClauses}</div>
                      <div>Confidence: {(currentQuery.response.confidence * 100).toFixed(1)}%</div>
                      <div>Processing Time: {(currentQuery.response.metadata.processingTime / 1000).toFixed(2)}s</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <XCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
                  <p className="text-gray-600">Query processing failed. Please try again.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sample Queries Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Queries</h3>
            <div className="space-y-3">
              {sampleQueries.map((sampleQuery, index) => (
                <button
                  key={index}
                  onClick={() => handleSampleQuery(sampleQuery)}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors duration-200 text-sm text-gray-700 hover:text-blue-700"
                  disabled={loading}
                >
                  {sampleQuery}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How it Works</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mt-0.5">1</div>
                <p>Query parsing and entity extraction</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mt-0.5">2</div>
                <p>Semantic search across documents</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mt-0.5">3</div>
                <p>AI-powered decision making</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mt-0.5">4</div>
                <p>Structured response with justification</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};