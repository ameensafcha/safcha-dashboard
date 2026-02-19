'use client';

import { SETTINGS_TABS, SettingsTab } from './constants';
import { ProfileSettings } from './ProfileSettings';
import { ThemeSettings } from './ThemeSettings';
import { NotificationsSettings } from './NotificationsSettings';

interface SettingsContentProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  onClose: () => void;
}

export function SettingsContent({ activeTab, onTabChange, onClose }: SettingsContentProps) {
  return (
    <div className="flex flex-col md:flex-row h-full min-h-[60vh]">
      <div className="w-full md:w-[30%] border-b md:border-b-0 md:border-r bg-muted/30 p-4 flex-shrink-0">
        <nav className="flex md:flex-col gap-2 md:space-y-1">
          {SETTINGS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="w-full md:w-[70%] p-6 overflow-y-auto flex-1">
        {activeTab === 'profile' && <ProfileSettings onClose={onClose} />}
        {activeTab === 'theme' && <ThemeSettings />}
        {activeTab === 'notifications' && <NotificationsSettings />}
      </div>
    </div>
  );
}
