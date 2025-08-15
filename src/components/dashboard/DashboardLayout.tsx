import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { QueryAssistant } from '../query/QueryAssistant';
import { DocumentManager } from '../documents/DocumentManager';
import { QueryHistory } from '../history/QueryHistory';
import { Settings } from '../settings/Settings';

export const DashboardLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'query':
        return <QueryAssistant />;
      case 'documents':
        return <DocumentManager />;
      case 'history':
        return <QueryHistory />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};