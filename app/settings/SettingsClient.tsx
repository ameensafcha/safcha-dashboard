'use client';

import { useState, useRef } from 'react';
import { updateProfile } from '@/app/actions/profile';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type UserProfile = {
    id: string;
    name: string;
    email: string;
    role: string;
};

type SettingsClientProps = {
    user: UserProfile | null;
};

export function SettingsClient({ user }: SettingsClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        
        const formData = new FormData(e.currentTarget);
        const result = await updateProfile(formData);
        
        setIsLoading(false);
        
        if (result?.success) {
            toast({
                title: "Profile updated",
                description: "Your profile has been updated successfully.",
            });
            router.refresh();
        } else {
            toast({
                title: "Error",
                description: result?.error || "Something went wrong",
                variant: "destructive",
            });
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Unable to load profile</p>
            </div>
        );
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                    id="name"
                    name="name" 
                    defaultValue={user.name}
                    placeholder="Enter your name" 
                    required 
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                    id="email"
                    name="email"
                    defaultValue={user.email}
                    disabled
                    className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input 
                    id="role"
                    value={user.role}
                    disabled
                    className="bg-muted cursor-not-allowed capitalize"
                />
            </div>

            <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-4">Change Password</h3>
                
                <div className="space-y-4">
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
                            placeholder="Enter new password (optional)" 
                            minLength={6}
                        />
                        <p className="text-xs text-muted-foreground">Leave empty to keep current password</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
