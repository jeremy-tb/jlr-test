import axios, { AxiosRequestConfig } from 'axios';
import { APIConfiguration, APIResponse } from './types';

export async function callAPI(
  config: APIConfiguration,
  fieldValues: Record<string, any>
): Promise<APIResponse> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authentication headers
    if (config.authType === 'bearer' && config.authConfig?.token) {
      headers['Authorization'] = `Bearer ${config.authConfig.token}`;
    } else if (config.authType === 'api-key' && config.authConfig?.apiKey) {
      const headerName = config.authConfig.apiKeyHeader || 'X-API-Key';
      headers[headerName] = config.authConfig.apiKey;
    }

    // Build the request configuration
    const requestConfig: AxiosRequestConfig = {
      method: config.method,
      url: config.endpoint,
      headers,
    };

    // Add basic auth if configured
    if (config.authType === 'basic' && config.authConfig?.username && config.authConfig?.password) {
      requestConfig.auth = {
        username: config.authConfig.username,
        password: config.authConfig.password,
      };
    }

    // Build payload from field values
    let payload = fieldValues;

    // If a custom payload template is provided, use it
    if (config.payloadTemplate) {
      try {
        // Replace placeholders in template with actual values
        let templateStr = config.payloadTemplate;
        Object.keys(fieldValues).forEach(key => {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
          templateStr = templateStr.replace(regex, fieldValues[key]);
        });
        payload = JSON.parse(templateStr);
      } catch (error) {
        console.error('Failed to parse payload template:', error);
        // Fall back to simple field values
      }
    }

    // Add payload for methods that support body
    if (['POST', 'PUT', 'PATCH'].includes(config.method)) {
      requestConfig.data = payload;
    } else if (config.method === 'GET') {
      requestConfig.params = payload;
    }

    const response = await axios(requestConfig);

    return {
      success: true,
      data: response.data,
      statusCode: response.status,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'An error occurred',
      statusCode: error.response?.status,
      data: error.response?.data,
    };
  }
}
