'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SettingsContent } from './settings/SettingsContent';
import { SettingsTab } from './settings/constants';

export function SettingsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  return (
    <>
      <Button 
        variant="ghost" 
        className="w-full justify-start gap-3 px-2"
        onClick={() => setIsOpen(true)}
      >
        <Settings className="h-4 w-4" />
        <span>Settings</span>
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[85vw] h-[85vh] max-w-5xl overflow-hidden p-0 flex flex-col">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <SettingsContent 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            onClose={() => setIsOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
