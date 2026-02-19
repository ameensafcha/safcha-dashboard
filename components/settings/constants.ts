import { Sun, Moon, Monitor, Palette, User, Bell, Settings } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export type SettingsTab = 'profile' | 'theme' | 'notifications';

export interface TabItem {
  id: SettingsTab;
  label: string;
  icon: LucideIcon;
}

export interface ModeOption {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface ColorOption {
  id: string;
  label: string;
  color: string;
}

export const SETTINGS_TABS: TabItem[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'theme', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export const MODE_OPTIONS: ModeOption[] = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
];

export const COLOR_OPTIONS: ColorOption[] = [
  { id: 'zinc', label: 'Zinc', color: '#71717a' },
  { id: 'blue', label: 'Blue', color: '#3b82f6' },
  { id: 'green', label: 'Green', color: '#22c55e' },
  { id: 'rose', label: 'Rose', color: '#f43f5e' },
  { id: 'purple', label: 'Purple', color: '#a855f7' },
];

export const DEFAULT_MODE = 'system';
export const DEFAULT_COLOR_THEME = 'green';
