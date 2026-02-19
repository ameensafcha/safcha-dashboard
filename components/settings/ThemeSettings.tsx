'use client';

import { useState } from 'react';
import { Loader2, Sun, Moon, Monitor } from 'lucide-react';
import { updateMode } from '@/app/actions/profile';
import { useThemeMode, DEFAULT_THEME } from '@/components/providers/ThemeSettingsProvider';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const safeCn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

const MODE_OPTIONS = [
  { id: 'light', label: 'Light', icon: Sun, desc: 'Always use light theme' },
  { id: 'dark', label: 'Dark', icon: Moon, desc: 'Always use dark theme' },
  { id: 'system', label: 'System', icon: Monitor, desc: 'Follow your system preference' },
];

export function ThemeSettings() {
  const { themeMode, setThemeMode, hasChanges, setHasChanges } = useThemeMode();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const modeFD = new FormData(); 
      modeFD.append('mode', themeMode.mode);
      await updateMode(modeFD);

      toast({ title: 'Theme saved', description: 'Your theme preference has been saved.' });
      setHasChanges(false);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setThemeMode(DEFAULT_THEME.mode);
    setHasChanges(false);
  };

  return (
    <div className="space-y-8 pb-20 relative">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Appearance</h2>
        <p className="text-muted-foreground">
          Customize the look and feel of your dashboard.
        </p>
      </div>

      <div className="grid gap-8">
        <section className="space-y-4">
          <h3 className="text-lg font-medium">Theme Mode</h3>
          <p className="text-sm text-muted-foreground">
            Choose how you want the dashboard to appear.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {MODE_OPTIONS.map((mode) => {
              const Icon = mode.icon;
              const isActive = themeMode.mode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setThemeMode(mode.id as 'light' | 'dark' | 'system')}
                  className={safeCn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-6 hover:bg-accent hover:text-accent-foreground transition-all h-32",
                    isActive ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2" : "border-muted bg-transparent"
                  )}
                >
                  <Icon className={safeCn("h-8 w-8", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-sm font-semibold mt-2">{mode.label}</span>
                  <span className="text-xs text-muted-foreground">{mode.desc}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {hasChanges && (
        <div className="fixed bottom-6 left-0 right-0 mx-auto w-full max-w-2xl px-4 animate-in slide-in-from-bottom-10 fade-in duration-300 z-50">
          <div className="flex items-center justify-between rounded-full border bg-background/80 px-6 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md">
            <span className="text-sm font-medium">
              Unsaved changes
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="rounded-full h-8 px-4 hover:bg-muted"
              >
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="rounded-full h-8 px-6 shadow-sm"
                size="sm"
              >
                {saving && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
