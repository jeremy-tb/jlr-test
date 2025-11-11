import { AppConfig, APIConfiguration } from './types';

const STORAGE_KEY = 'api-app-config';

// Simple encryption/decryption using base64 (in production, use proper encryption)
function encrypt(data: string): string {
  return btoa(data);
}

function decrypt(data: string): string {
  try {
    return atob(data);
  } catch {
    return data; // Return as-is if not encrypted
  }
}

export function saveConfig(config: AppConfig): void {
  try {
    const jsonString = JSON.stringify(config);
    const encrypted = encrypt(jsonString);
    localStorage.setItem(STORAGE_KEY, encrypted);
  } catch (error) {
    console.error('Failed to save configuration:', error);
    throw new Error('Failed to save configuration');
  }
}

export function loadConfig(): AppConfig | null {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) return null;

    const decrypted = decrypt(encrypted);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Failed to load configuration:', error);
    return null;
  }
}

export function getDefaultConfig(): AppConfig {
  return {
    apiConfigurations: [],
    currentConfigIndex: 0,
  };
}

export function addAPIConfiguration(config: APIConfiguration): void {
  const appConfig = loadConfig() || getDefaultConfig();
  appConfig.apiConfigurations.push(config);
  saveConfig(appConfig);
}

export function updateAPIConfiguration(index: number, config: APIConfiguration): void {
  const appConfig = loadConfig() || getDefaultConfig();
  if (index >= 0 && index < appConfig.apiConfigurations.length) {
    appConfig.apiConfigurations[index] = config;
    saveConfig(appConfig);
  }
}

export function deleteAPIConfiguration(index: number): void {
  const appConfig = loadConfig() || getDefaultConfig();
  if (index >= 0 && index < appConfig.apiConfigurations.length) {
    appConfig.apiConfigurations.splice(index, 1);
    if (appConfig.currentConfigIndex >= appConfig.apiConfigurations.length) {
      appConfig.currentConfigIndex = Math.max(0, appConfig.apiConfigurations.length - 1);
    }
    saveConfig(appConfig);
  }
}

export function setCurrentConfigIndex(index: number): void {
  const appConfig = loadConfig() || getDefaultConfig();
  if (index >= 0 && index < appConfig.apiConfigurations.length) {
    appConfig.currentConfigIndex = index;
    saveConfig(appConfig);
  }
}
