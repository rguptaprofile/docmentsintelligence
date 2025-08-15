import React, { useState } from 'react';
import { Brain, FileText, Zap } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:block">
          <div className="max-w-md">
            <div className="flex items-center mb-8">
              <div className="bg-blue-600 p-3 rounded-2xl mr-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Document Intelligence</h1>
                <p className="text-gray-600">LLM-Powered Analysis Platform</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Documents into 
              <span className="text-blue-600"> Intelligent Insights</span>
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              Process natural language queries against complex documents with AI-powered 
              semantic understanding and instant decision making.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-4">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-gray-700">Upload PDFs, contracts, and policies</span>
              </div>
              <div className="flex items-center">
                <div className="bg-purple-100 p-2 rounded-lg mr-4">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-gray-700">AI-powered semantic search and analysis</span>
              </div>
              <div className="flex items-center">
                <div className="bg-yellow-100 p-2 rounded-lg mr-4">
                  <Zap className="w-5 h-5 text-yellow-600" />
                </div>
                <span className="text-gray-700">Instant decisions with justifications</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="flex justify-center lg:justify-end">
          {isLogin ? (
            <LoginForm onToggleMode={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onToggleMode={() => setIsLogin(true)} />
          )}
        </div>

        {/* Mobile branding */}
        <div className="lg:hidden text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-600 p-3 rounded-2xl mr-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Document Intelligence</h1>
              <p className="text-gray-600 text-sm">LLM-Powered Analysis Platform</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};