export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  defaultModel: string;
  displayDensity: 'compact' | 'comfortable';
}
