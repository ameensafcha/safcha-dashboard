'use client';

import React, { useEffect, useState } from 'react';
import { User, Lock, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getProfile, updateProfile } from '@/app/actions/profile';
import { useFormSubmit } from '@/hooks/useFormSubmit';

interface ProfileData {
  name: string;
  email: string;
}

interface ProfileSettingsProps {
  onClose: () => void;
}

export function ProfileSettings({ onClose }: ProfileSettingsProps) {
  const [profileData, setProfileData] = useState<ProfileData>({ name: '', email: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const result = await getProfile();
      if (result.success && result.user) {
        setProfileData({
          name: result.user.name,
          email: result.user.email
        });
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const { submitting, submit } = useFormSubmit(updateProfile, {
    successMessage: 'Profile updated successfully',
    routerRefresh: true,
    onSuccess: () => onClose(),
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await submit(formData);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Profile Settings</h2>
          <p className="text-sm text-muted-foreground">Manage your profile information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input 
            id="name"
            name="name" 
            defaultValue={profileData.name}
            placeholder="Enter your name" 
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email"
            name="email"
            defaultValue={profileData.email}
            disabled
            className="bg-muted cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground">Email cannot be changed</p>
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Change Password
          </h3>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password *</Label>
              <Input 
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="Enter current password" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input 
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Enter new password" 
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">Leave empty to keep current password</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
