import React, { useState } from 'react';
import { APIConfiguration, FieldDefinition, APIResponse } from '../types';
import { callAPI } from '../api';
import './DynamicForm.css';

interface DynamicFormProps {
  config: APIConfiguration;
}

export default function DynamicForm({ config }: DynamicFormProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    config.fields.forEach((field) => {
      initial[field.id] = field.defaultValue || '';
    });
    return initial;
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<APIResponse | null>(null);

  const handleChange = (fieldId: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const result = await callAPI(config, formValues);
      setResponse(result);
    } catch (error) {
      setResponse({
        success: false,
        error: 'Failed to call API',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: FieldDefinition) => {
    const commonProps = {
      id: field.id,
      value: formValues[field.id] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        handleChange(field.id, e.target.value),
      placeholder: field.placeholder,
      required: field.required,
    };

    switch (field.type) {
      case 'textarea':
        return <textarea {...commonProps} rows={4} />;
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      default:
        return <input {...commonProps} type={field.type} />;
    }
  };

  return (
    <div className="dynamic-form-container">
      <div className="dynamic-form-header">
        <h2>API Request Form</h2>
        <div className="endpoint-info">
          <span className="method-badge" data-method={config.method}>
            {config.method}
          </span>
          <span className="endpoint-url">{config.endpoint}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="dynamic-form">
        {config.fields.map((field) => (
          <div key={field.id} className="form-field">
            <label htmlFor={field.id}>
              {field.name}
              {field.required && <span className="required">*</span>}
            </label>
            {renderField(field)}
          </div>
        ))}

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </form>

      {response && (
        <div className={`response-section ${response.success ? 'success' : 'error'}`}>
          <div className="response-header">
            <h3>{response.success ? 'Success' : 'Error'}</h3>
            {response.statusCode && <span className="status-code">Status: {response.statusCode}</span>}
          </div>
          <div className="response-body">
            {response.error && <p className="error-message">{response.error}</p>}
            {response.data && (
              <pre className="response-data">{JSON.stringify(response.data, null, 2)}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
