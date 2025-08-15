import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import { documentService } from '../../services/documentService';
import { Document } from '../../types';

export const Dashboard: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const docs = await documentService.getDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const stats = [
    {
      title: 'Total Documents',
      value: documents.length,
      icon: FileText,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Processed Queries',
      value: '247',
      icon: Search,
      color: 'green',
      change: '+8%'
    },
    {
      title: 'Avg. Response Time',
      value: '2.3s',
      icon: Clock,
      color: 'purple',
      change: '-15%'
    },
    {
      title: 'Success Rate',
      value: '94.2%',
      icon: CheckCircle,
      color: 'emerald',
      change: '+2%'
    }
  ];

  const recentQueries = [
    {
      id: '1',
      query: '46-year-old male, knee surgery in Pune, 3-month-old insurance policy',
      status: 'approved',
      timestamp: '2024-01-15T14:30:00Z',
      processingTime: '2.1s'
    },
    {
      id: '2',
      query: 'Heart surgery coverage for 55-year-old female in Mumbai',
      status: 'requires_review',
      timestamp: '2024-01-15T13:45:00Z',
      processingTime: '3.2s'
    },
    {
      id: '3',
      query: 'Dental procedure claim verification',
      status: 'approved',
      timestamp: '2024-01-15T12:20:00Z',
      processingTime: '1.8s'
    }
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your document intelligence system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-${stat.color}-100 p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Queries */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Queries</h2>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentQueries.map((query) => (
                <div key={query.id} className="flex items-start space-x-4">
                  <div className={`mt-1 p-1 rounded-full ${query.status === 'approved' ? 'bg-green-100' :
                      query.status === 'requires_review' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                    {query.status === 'approved' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{query.query}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500 space-x-4">
                      <span>{new Date(query.timestamp).toLocaleTimeString()}</span>
                      <span>{query.processingTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Documents Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Document Status</h2>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {documents.slice(0, 5).map((doc) => (
                <div key={doc.id} className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${doc.status === 'ready' ? 'bg-green-100' :
                      doc.status === 'processing' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                    <FileText className={`w-4 h-4 ${doc.status === 'ready' ? 'text-green-600' :
                        doc.status === 'processing' ? 'text-yellow-600' : 'text-red-600'
                      }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{doc.status}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};