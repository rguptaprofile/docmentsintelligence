import React, { useState } from 'react';
import { 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Filter,
  Download,
  Eye
} from 'lucide-react';

// Mock query history data
const mockQueryHistory = [
  {
    id: '1',
    query: '46-year-old male, knee surgery in Pune, 3-month-old insurance policy',
    timestamp: '2024-01-15T14:30:00Z',
    status: 'completed',
    decision: 'approved',
    amount: 500000,
    processingTime: 2100,
    confidence: 0.92
  },
  {
    id: '2',
    query: 'Heart surgery coverage for 55-year-old female in Mumbai with 2-year policy',
    timestamp: '2024-01-15T13:45:00Z',
    status: 'completed',
    decision: 'requires_review',
    processingTime: 3200,
    confidence: 0.76
  },
  {
    id: '3',
    query: 'Dental procedure claim verification for 6-month policy',
    timestamp: '2024-01-15T12:20:00Z',
    status: 'completed',
    decision: 'approved',
    amount: 25000,
    processingTime: 1800,
    confidence: 0.88
  },
  {
    id: '4',
    query: 'Eye surgery eligibility for 42-year-old in Delhi',
    timestamp: '2024-01-15T11:15:00Z',
    status: 'completed',
    decision: 'rejected',
    processingTime: 2500,
    confidence: 0.94
  },
  {
    id: '5',
    query: 'Orthopedic consultation coverage for 38-year-old in Bangalore',
    timestamp: '2024-01-15T10:30:00Z',
    status: 'completed',
    decision: 'approved',
    amount: 15000,
    processingTime: 1600,
    confidence: 0.85
  }
];

export const QueryHistory: React.FC = () => {
  const [queries] = useState(mockQueryHistory);
  const [filteredQueries, setFilteredQueries] = useState(mockQueryHistory);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuery, setSelectedQuery] = useState<typeof mockQueryHistory[0] | null>(null);

  const getStatusIcon = (decision: string) => {
    switch (decision) {
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

  const getStatusColor = (decision: string) => {
    switch (decision) {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handleFilter = (status: string) => {
    setFilterStatus(status);
    const filtered = status === 'all' 
      ? queries 
      : queries.filter(query => query.decision === status);
    setFilteredQueries(filtered);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = queries.filter(query => 
      query.query.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredQueries(filtered);
  };

  const exportHistory = () => {
    const csvContent = [
      ['Timestamp', 'Query', 'Decision', 'Amount', 'Processing Time', 'Confidence'],
      ...filteredQueries.map(q => [
        new Date(q.timestamp).toLocaleString(),
        q.query,
        q.decision,
        q.amount || '',
        `${(q.processingTime / 1000).toFixed(2)}s`,
        `${(q.confidence * 100).toFixed(1)}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Query History</h1>
          <p className="text-gray-600">Review your past queries and analysis results</p>
        </div>
        <button
          onClick={exportHistory}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
        >
          <Download className="w-5 h-5 mr-2" />
          Export History
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Query List */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search queries..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => handleFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="requires_review">Requires Review</option>
                </select>
              </div>
            </div>
          </div>

          {/* Query List */}
          <div className="space-y-4">
            {filteredQueries.map((query) => (
              <div
                key={query.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 mr-4">
                    <p className="text-gray-900 font-medium mb-2">{query.query}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{new Date(query.timestamp).toLocaleString()}</span>
                      <span>{(query.processingTime / 1000).toFixed(2)}s</span>
                      <span>{(query.confidence * 100).toFixed(1)}% confidence</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(query.decision)}
                    <button
                      onClick={() => setSelectedQuery(query)}
                      className="bg-blue-50 text-blue-700 p-2 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(query.decision)}`}>
                    {query.decision.replace('_', ' ').charAt(0).toUpperCase() + query.decision.replace('_', ' ').slice(1)}
                  </span>
                  {query.amount && (
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(query.amount)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredQueries.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No queries found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Query Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {selectedQuery ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Query Details</h2>
                <button
                  onClick={() => setSelectedQuery(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Query */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Query</h3>
                  <p className="text-gray-900">{selectedQuery.query}</p>
                </div>

                {/* Decision */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Decision</h3>
                  <div className={`p-3 rounded-lg border ${getStatusColor(selectedQuery.decision)}`}>
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(selectedQuery.decision)}
                      <span className="font-medium capitalize">
                        {selectedQuery.decision.replace('_', ' ')}
                      </span>
                    </div>
                    {selectedQuery.amount && (
                      <p className="text-sm mt-1">
                        Amount: {formatCurrency(selectedQuery.amount)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Analysis Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processing Time:</span>
                      <span className="font-medium">{(selectedQuery.processingTime / 1000).toFixed(2)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confidence:</span>
                      <span className="font-medium">{(selectedQuery.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Timestamp:</span>
                      <span className="font-medium">{new Date(selectedQuery.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Select a query to view its details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};