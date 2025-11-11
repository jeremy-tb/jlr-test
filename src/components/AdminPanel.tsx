import React, { useState } from 'react';
import { APIConfiguration, FieldDefinition } from '../types';
import './AdminPanel.css';

interface AdminPanelProps {
  config: APIConfiguration | null;
  onSave: (config: APIConfiguration) => void;
  onCancel: () => void;
}

export default function AdminPanel({ config, onSave, onCancel }: AdminPanelProps) {
  const [endpoint, setEndpoint] = useState(config?.endpoint || '');
  const [method, setMethod] = useState<APIConfiguration['method']>(config?.method || 'POST');
  const [authType, setAuthType] = useState<APIConfiguration['authType']>(config?.authType || 'none');
  const [authToken, setAuthToken] = useState(config?.authConfig?.token || '');
  const [authUsername, setAuthUsername] = useState(config?.authConfig?.username || '');
  const [authPassword, setAuthPassword] = useState(config?.authConfig?.password || '');
  const [authApiKey, setAuthApiKey] = useState(config?.authConfig?.apiKey || '');
  const [authApiKeyHeader, setAuthApiKeyHeader] = useState(config?.authConfig?.apiKeyHeader || 'X-API-Key');
  const [fields, setFields] = useState<FieldDefinition[]>(config?.fields || []);
  const [payloadTemplate, setPayloadTemplate] = useState(config?.payloadTemplate || '');

  const addField = () => {
    setFields([
      ...fields,
      {
        id: `field_${Date.now()}`,
        name: '',
        type: 'text',
        required: false,
        placeholder: '',
      },
    ]);
  };

  const updateField = (index: number, updates: Partial<FieldDefinition>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newConfig: APIConfiguration = {
      endpoint,
      method,
      authType,
      authConfig:
        authType === 'bearer'
          ? { token: authToken }
          : authType === 'basic'
          ? { username: authUsername, password: authPassword }
          : authType === 'api-key'
          ? { apiKey: authApiKey, apiKeyHeader: authApiKeyHeader }
          : undefined,
      fields,
      payloadTemplate: payloadTemplate || undefined,
    };

    onSave(newConfig);
  };

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h2>{config ? 'Edit API Configuration' : 'New API Configuration'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-section">
          <h3>API Endpoint</h3>
          <div className="form-group">
            <label>Endpoint URL</label>
            <input
              type="url"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://api.example.com/endpoint"
              required
            />
          </div>

          <div className="form-group">
            <label>Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as APIConfiguration['method'])}>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Authentication</h3>
          <div className="form-group">
            <label>Authentication Type</label>
            <select value={authType} onChange={(e) => setAuthType(e.target.value as APIConfiguration['authType'])}>
              <option value="none">None</option>
              <option value="bearer">Bearer Token</option>
              <option value="basic">Basic Auth</option>
              <option value="api-key">API Key</option>
            </select>
          </div>

          {authType === 'bearer' && (
            <div className="form-group">
              <label>Bearer Token</label>
              <input
                type="password"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                placeholder="Enter bearer token"
              />
            </div>
          )}

          {authType === 'basic' && (
            <>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  placeholder="Enter username"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
            </>
          )}

          {authType === 'api-key' && (
            <>
              <div className="form-group">
                <label>API Key</label>
                <input
                  type="password"
                  value={authApiKey}
                  onChange={(e) => setAuthApiKey(e.target.value)}
                  placeholder="Enter API key"
                />
              </div>
              <div className="form-group">
                <label>API Key Header Name</label>
                <input
                  type="text"
                  value={authApiKeyHeader}
                  onChange={(e) => setAuthApiKeyHeader(e.target.value)}
                  placeholder="X-API-Key"
                />
              </div>
            </>
          )}
        </div>

        <div className="form-section">
          <h3>Input Fields</h3>
          {fields.map((field, index) => (
            <div key={field.id} className="field-definition">
              <div className="field-definition-header">
                <h4>Field {index + 1}</h4>
                <button type="button" onClick={() => removeField(index)} className="btn-remove">
                  Remove
                </button>
              </div>
              <div className="field-definition-body">
                <div className="form-group">
                  <label>Field ID</label>
                  <input
                    type="text"
                    value={field.id}
                    onChange={(e) => updateField(index, { id: e.target.value })}
                    placeholder="field_id"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Field Name</label>
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(index, { name: e.target.value })}
                    placeholder="Field Name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, { type: e.target.value as FieldDefinition['type'] })}
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="email">Email</option>
                    <option value="password">Password</option>
                    <option value="textarea">Text Area</option>
                    <option value="select">Select</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Placeholder</label>
                  <input
                    type="text"
                    value={field.placeholder || ''}
                    onChange={(e) => updateField(index, { placeholder: e.target.value })}
                    placeholder="Enter placeholder text"
                  />
                </div>
                <div className="form-group">
                  <label>Default Value</label>
                  <input
                    type="text"
                    value={field.defaultValue || ''}
                    onChange={(e) => updateField(index, { defaultValue: e.target.value })}
                    placeholder="Default value"
                  />
                </div>
                {field.type === 'select' && (
                  <div className="form-group">
                    <label>Options (comma-separated)</label>
                    <input
                      type="text"
                      value={field.options?.join(', ') || ''}
                      onChange={(e) =>
                        updateField(index, {
                          options: e.target.value.split(',').map((opt) => opt.trim()),
                        })
                      }
                      placeholder="Option 1, Option 2, Option 3"
                    />
                  </div>
                )}
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(index, { required: e.target.checked })}
                    />
                    Required
                  </label>
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addField} className="btn-add">
            Add Field
          </button>
        </div>

        <div className="form-section">
          <h3>Advanced</h3>
          <div className="form-group">
            <label>Payload Template (Optional)</label>
            <textarea
              value={payloadTemplate}
              onChange={(e) => setPayloadTemplate(e.target.value)}
              placeholder={'{\n  "data": {\n    "field_id": "{{field_id}}"\n  }\n}'}
              rows={8}
            />
            <small>Use {`{{field_id}}`} to reference field values</small>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
