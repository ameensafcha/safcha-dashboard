'use client';

import { useState, useRef, useEffect } from 'react';
import { createUser, updateUser, toggleUserActive, deleteUser } from '@/app/actions/users';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Pencil, Loader2, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

type Role = {
    id: string;
    name: string;
};

type User = {
    id: string;
    name: string;
    email: string;
    roleId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    Role: Role;
};

type UsersPageClientProps = {
    users: User[];
    roles: Role[];
    currentUserId: string;
};

export function UsersPageClient({ users: initialUsers, roles, currentUserId }: UsersPageClientProps) {
    const router = useRouter();
    const [users, setUsers] = useState(initialUsers);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        setUsers(initialUsers);
    }, [initialUsers]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        
        const formData = new FormData(e.currentTarget);
        
        let result;
        if (editingUser) {
            result = await updateUser(editingUser.id, formData);
        } else {
            result = await createUser(formData);
        }
        
        setIsLoading(false);
        
        if (result?.success) {
            toast({
                title: editingUser ? "User updated" : "User created",
                description: editingUser ? "User has been updated successfully." : "New user has been created.",
            });
            setEditingUser(null);
            setIsDialogOpen(false);
            router.refresh();
        } else {
            toast({
                title: "Error",
                description: result?.error || "Something went wrong",
                variant: "destructive",
            });
        }
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openEdit = (user: User) => {
        setEditingUser(user);
        setIsDialogOpen(true);
    };

    const openCreate = () => {
        setEditingUser(null);
        setIsDialogOpen(true);
    };

    const handleDialogOpen = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) setEditingUser(null);
    };

    return (
        <div className="flex flex-col min-h-screen bg-secondary/5 p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Users</h1>
                    <p className="text-muted-foreground mt-1">Manage system users.</p>
                </div>
                <Button onClick={openCreate} className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add User
                </Button>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle>All Users</CardTitle>
                    <div className="relative w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search users..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left p-3 text-sm font-medium">Name</th>
                                    <th className="text-left p-3 text-sm font-medium">Email</th>
                                    <th className="text-left p-3 text-sm font-medium">Role</th>
                                    <th className="text-left p-3 text-sm font-medium">Status</th>
                                    <th className="text-left p-3 text-sm font-medium">Created</th>
                                    <th className="text-left p-3 text-sm font-medium">Updated</th>
                                    <th className="text-right p-3 text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-t hover:bg-muted/50">
                                        <td className="p-3 text-sm">{user.name}</td>
                                        <td className="p-3 text-sm text-muted-foreground">{user.email}</td>
                                        <td className="p-3 text-sm capitalize">{user.Role?.name || 'N/A'}</td>
                                        <td className="p-3">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                user.isActive 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground">
                                            {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="p-3 text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => openEdit(user)}
                                            >
                                                <Pencil className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" className="hidden">Open</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingUser ? 'Edit User' : 'Create User'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingUser 
                                ? 'Update user details and status.'
                                : 'Fill in the form to create a new user.'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input 
                                id="name"
                                name="name" 
                                defaultValue={editingUser?.name || ''} 
                                placeholder="Enter name" 
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email"
                                name="email" 
                                type="email"
                                defaultValue={editingUser?.email || ''} 
                                placeholder="Enter email" 
                                required 
                            />
                        </div>
                        
                        {!editingUser && (
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input 
                                    id="password"
                                    name="password" 
                                    type="password"
                                    placeholder="Enter password" 
                                    required 
                                    minLength={6}
                                />
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <Label htmlFor="roleId">Role</Label>
                            <Select name="roleId" defaultValue={editingUser?.roleId || ''} required>
                                <SelectTrigger id="roleId">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.filter(r => r.name !== 'admin').map(role => (
                                        <SelectItem key={role.id} value={role.id}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <ToggleSwitchFormField 
                            initialValue={editingUser?.isActive ?? true} 
                            isRequired={!editingUser}
                        />
                        
                        <div className="flex justify-end gap-3 pt-4">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => handleDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingUser ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function ToggleSwitchFormField({ initialValue, isRequired = false }: { initialValue: boolean; isRequired?: boolean }) {
    const [isActive, setIsActive] = useState(initialValue);
    const [isToggling, setIsToggling] = useState(false);

    const handleToggle = async () => {
        const newValue = !isActive;
        setIsActive(newValue);
        
        // Update the hidden checkbox
        const checkbox = document.getElementById('isActive') as HTMLInputElement;
        if (checkbox) {
            checkbox.checked = newValue;
        }
    };

    return (
        <div className="space-y-2">
            <Label>
                {isRequired ? 'Active Status *' : 'Status'}
            </Label>
            <div 
                className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all ${
                    isActive 
                        ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                        : 'bg-red-50 border-red-200 hover:bg-red-100'
                }`}
                onClick={handleToggle}
            >
                <div 
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isActive ? 'bg-green-600' : 'bg-red-400'
                    }`}
                >
                    <span 
                        className={`inline-block h-4 w-4 transform rounded-full bg-background shadow-lg transition-transform duration-200 ${
                            isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                </div>
                <span className={`text-sm font-medium ${
                    isActive ? 'text-green-700' : 'text-red-700'
                }`}>
                    {isActive ? 'Active' : 'Inactive'}
                </span>
            </div>
            <input 
                type="checkbox" 
                name="isActive" 
                id="isActive" 
                value="on" 
                defaultChecked={initialValue}
                className="hidden"
            />
        </div>
    );
}
