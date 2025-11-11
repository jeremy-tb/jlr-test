export interface FieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select';
  required: boolean;
  defaultValue?: string;
  options?: string[]; // For select type
  placeholder?: string;
}

export interface APIConfiguration {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  authType: 'none' | 'bearer' | 'basic' | 'api-key';
  authConfig?: {
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiKeyHeader?: string;
  };
  fields: FieldDefinition[];
  payloadTemplate?: string; // Optional JSON template for custom payload structure
}

export interface AppConfig {
  apiConfigurations: APIConfiguration[];
  currentConfigIndex: number;
}

export interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  statusCode?: number;
}
