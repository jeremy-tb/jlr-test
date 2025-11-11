import React, { useState, useEffect } from 'react';
import AdminPanel from './components/AdminPanel';
import DynamicForm from './components/DynamicForm';
import { APIConfiguration, AppConfig } from './types';
import {
  loadConfig,
  saveConfig,
  getDefaultConfig,
  addAPIConfiguration,
  updateAPIConfiguration,
  deleteAPIConfiguration,
  setCurrentConfigIndex,
} from './storage';
import './App.css';

type ViewMode = 'list' | 'admin' | 'form';

function App() {
  const [appConfig, setAppConfig] = useState<AppConfig>(() => loadConfig() || getDefaultConfig());
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    // If no configurations exist, show admin panel
    if (appConfig.apiConfigurations.length === 0) {
      setViewMode('admin');
    }
  }, []);

  const handleSaveConfig = (config: APIConfiguration) => {
    if (editingIndex !== null) {
      updateAPIConfiguration(editingIndex, config);
    } else {
      addAPIConfiguration(config);
    }
    const updatedConfig = loadConfig() || getDefaultConfig();
    setAppConfig(updatedConfig);
    setEditingIndex(null);
    setViewMode('list');
  };

  const handleDeleteConfig = (index: number) => {
    if (confirm('Are you sure you want to delete this configuration?')) {
      deleteAPIConfiguration(index);
      const updatedConfig = loadConfig() || getDefaultConfig();
      setAppConfig(updatedConfig);
    }
  };

  const handleSelectConfig = (index: number) => {
    setCurrentConfigIndex(index);
    const updatedConfig = loadConfig() || getDefaultConfig();
    setAppConfig(updatedConfig);
    setViewMode('form');
  };

  const handleEditConfig = (index: number) => {
    setEditingIndex(index);
    setViewMode('admin');
  };

  const handleNewConfig = () => {
    setEditingIndex(null);
    setViewMode('admin');
  };

  const renderListView = () => {
    return (
      <div className="list-view">
        <div className="list-header">
          <h1>API Configurations</h1>
          <button onClick={handleNewConfig} className="btn-new">
            New Configuration
          </button>
        </div>

        {appConfig.apiConfigurations.length === 0 ? (
          <div className="empty-state">
            <p>No API configurations found.</p>
            <p>Click "New Configuration" to create one.</p>
          </div>
        ) : (
          <div className="config-list">
            {appConfig.apiConfigurations.map((config, index) => (
              <div key={index} className="config-card">
                <div className="config-card-header">
                  <div className="config-info">
                    <span className="method-badge" data-method={config.method}>
                      {config.method}
                    </span>
                    <span className="endpoint">{config.endpoint}</span>
                  </div>
                  <div className="config-actions">
                    <button onClick={() => handleSelectConfig(index)} className="btn-use">
                      Use
                    </button>
                    <button onClick={() => handleEditConfig(index)} className="btn-edit">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteConfig(index)} className="btn-delete">
                      Delete
                    </button>
                  </div>
                </div>
                <div className="config-details">
                  <div className="detail-item">
                    <span className="detail-label">Auth:</span>
                    <span className="detail-value">{config.authType}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Fields:</span>
                    <span className="detail-value">{config.fields.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAdminView = () => {
    const config = editingIndex !== null ? appConfig.apiConfigurations[editingIndex] : null;
    return (
      <AdminPanel
        config={config}
        onSave={handleSaveConfig}
        onCancel={() => {
          setEditingIndex(null);
          setViewMode('list');
        }}
      />
    );
  };

  const renderFormView = () => {
    const currentConfig = appConfig.apiConfigurations[appConfig.currentConfigIndex];
    if (!currentConfig) {
      return (
        <div className="error-view">
          <p>No configuration selected.</p>
          <button onClick={() => setViewMode('list')} className="btn-back">
            Back to List
          </button>
        </div>
      );
    }

    return (
      <div>
        <div className="form-view-header">
          <button onClick={() => setViewMode('list')} className="btn-back">
            ← Back to List
          </button>
        </div>
        <DynamicForm config={currentConfig} />
      </div>
    );
  };

  return (
    <div className="app">
      <div className="app-container">
        {viewMode === 'list' && renderListView()}
        {viewMode === 'admin' && renderAdminView()}
        {viewMode === 'form' && renderFormView()}
      </div>
    </div>
  );
}

export default App;
