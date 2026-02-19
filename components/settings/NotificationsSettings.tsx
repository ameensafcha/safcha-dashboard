'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  title: string;
  description: string;
}

function Toggle({ enabled, onChange, title, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </div>
  );
}

export function NotificationsSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Notifications</h2>
          <p className="text-sm text-muted-foreground">Manage your notification preferences</p>
        </div>
      </div>

      <div className="space-y-4">
        <Toggle
          enabled={emailNotifications}
          onChange={setEmailNotifications}
          title="Email Notifications"
          description="Receive notifications via email"
        />
        <Toggle
          enabled={pushNotifications}
          onChange={setPushNotifications}
          title="Push Notifications"
          description="Receive push notifications"
        />
      </div>
    </div>
  );
}
