'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createRole, updateRole, deleteRole, getRolePermissions, updateRolePermissions } from '@/app/actions/roles';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Plus, Pencil, Trash2, Loader2, Shield, Search, Key, ChevronRight, ChevronDown, Folder } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Role = {
    id: string;
    name: string;
    userCount: number;
};

type ModulePermission = {
    id: string;
    name: string;
    slug: string;
    type: string;
    parentId: string | null;
    permissions: {
        canCreate: boolean;
        canRead: boolean;
        canUpdate: boolean;
        canDelete: boolean;
    } | null;
    children?: ModulePermission[];
    isOpen?: boolean;
};

type RolesPageClientProps = {
    roles: Role[];
    currentUserId: string;
};

const buildModuleTree = (modules: ModulePermission[]): ModulePermission[] => {
    const moduleMap: { [key: string]: ModulePermission } = {};
    const tree: ModulePermission[] = [];

    modules.forEach(m => {
        moduleMap[m.id] = { ...m, children: [] };
    });

    modules.forEach(m => {
        if (m.parentId && moduleMap[m.parentId]) {
            moduleMap[m.parentId].children = moduleMap[m.parentId].children || [];
            moduleMap[m.parentId].children!.push(moduleMap[m.id]);
        } else if (!m.parentId) {
            tree.push(moduleMap[m.id]);
        }
    });

    return tree;
};

const flattenModuleTree = (modules: ModulePermission[], depth: number = 0): (ModulePermission & { depth: number })[] => {
    let flat: (ModulePermission & { depth: number })[] = [];
    modules.forEach(m => {
        flat.push({ ...m, depth });
        if (m.children && m.children.length > 0) {
            flat = [...flat, ...flattenModuleTree(m.children, depth + 1)];
        }
    });
    return flat;
};

const getAllDescendantIds = (moduleId: string, modules: ModulePermission[]): string[] => {
    const module = modules.find(m => m.id === moduleId);
    if (!module || !module.children || module.children.length === 0) return [];

    let descendantIds: string[] = [];
    module.children.forEach(child => {
        descendantIds.push(child.id);
        descendantIds = [...descendantIds, ...getAllDescendantIds(child.id, modules)];
    });
    return descendantIds;
};

type RenderModuleRowProps = {
    module: ModulePermission;
    onPermissionChange: (moduleId: string, permission: string, checked: boolean, isParent: boolean) => void;
    depth: number;
};

const RenderModuleRow = ({ module, onPermissionChange, depth }: RenderModuleRowProps) => {
    const hasChildren = module.children && module.children.length > 0;
    const paddingLeft = 24 + (depth * 24);
    
    const getBackgroundColor = () => {
        if (depth === 0) return 'bg-secondary/30';
        if (depth === 1) return 'bg-secondary/10';
        return 'bg-card';
    };
    
    const getTextColor = () => {
        if (depth === 0) return 'font-semibold text-primary';
        return '';
    };

    if (hasChildren) {
        return (
            <Collapsible defaultOpen={false}>
                <CollapsibleTrigger asChild>
                    <div 
                        className={`grid grid-cols-5 gap-4 p-4 cursor-pointer hover:opacity-90 transition-opacity ${getBackgroundColor()}`} 
                        style={{ paddingLeft: `${paddingLeft}px` }}
                    >
                        <div className={`flex items-center gap-2 ${getTextColor()}`}>
                            <ChevronRight className="h-4 w-4 data-[state=open]:rotate-90 transition-transform" />
                            {module.name}
                        </div>
                        <div className="text-center">
                            <Checkbox
                                checked={module.permissions?.canRead || false}
                                onCheckedChange={(checked) => onPermissionChange(module.id, 'canRead', checked as boolean, true)}
                                onClick={(e) => e.stopPropagation()}
                                className="mx-auto"
                            />
                        </div>
                        <div className="text-center">
                            <Checkbox
                                checked={module.permissions?.canCreate || false}
                                onCheckedChange={(checked) => onPermissionChange(module.id, 'canCreate', checked as boolean, true)}
                                onClick={(e) => e.stopPropagation()}
                                className="mx-auto"
                            />
                        </div>
                        <div className="text-center">
                            <Checkbox
                                checked={module.permissions?.canUpdate || false}
                                onCheckedChange={(checked) => onPermissionChange(module.id, 'canUpdate', checked as boolean, true)}
                                onClick={(e) => e.stopPropagation()}
                                className="mx-auto"
                            />
                        </div>
                        <div className="text-center">
                            <Checkbox
                                checked={module.permissions?.canDelete || false}
                                onCheckedChange={(checked) => onPermissionChange(module.id, 'canDelete', checked as boolean, true)}
                                onClick={(e) => e.stopPropagation()}
                                className="mx-auto"
                            />
                        </div>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    {module.children!.map((child) => (
                        <RenderModuleRow 
                            key={child.id} 
                            module={child} 
                            onPermissionChange={onPermissionChange}
                            depth={depth + 1}
                        />
                    ))}
                </CollapsibleContent>
            </Collapsible>
        );
    }

    return (
        <div 
            className={`grid grid-cols-5 gap-4 p-4 ${getBackgroundColor()}`} 
            style={{ paddingLeft: `${paddingLeft}px` }}
        >
            <div className={`text-sm text-foreground ${getTextColor()}`}>
                {module.name}
            </div>
            <div className="text-center">
                <Checkbox
                    checked={module.permissions?.canRead || false}
                    onCheckedChange={(checked) => onPermissionChange(module.id, 'canRead', checked as boolean, false)}
                    className="mx-auto"
                />
            </div>
            <div className="text-center">
                <Checkbox
                    checked={module.permissions?.canCreate || false}
                    onCheckedChange={(checked) => onPermissionChange(module.id, 'canCreate', checked as boolean, false)}
                    className="mx-auto"
                />
            </div>
            <div className="text-center">
                <Checkbox
                    checked={module.permissions?.canUpdate || false}
                    onCheckedChange={(checked) => onPermissionChange(module.id, 'canUpdate', checked as boolean, false)}
                    className="mx-auto"
                />
            </div>
            <div className="text-center">
                <Checkbox
                    checked={module.permissions?.canDelete || false}
                    onCheckedChange={(checked) => onPermissionChange(module.id, 'canDelete', checked as boolean, false)}
                    className="mx-auto"
                />
            </div>
        </div>
    );
};

export function RolesPageClient({ roles: initialRoles, currentUserId }: RolesPageClientProps) {
    const router = useRouter();
    const [roles, setRoles] = useState(initialRoles);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
    const [roleForPermissions, setRoleForPermissions] = useState<Role | null>(null);
    const [permissionsModules, setPermissionsModules] = useState<ModulePermission[]>([]);
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        setRoles(initialRoles);
    }, [initialRoles]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        
        const formData = new FormData(e.currentTarget);
        
        let result;
        if (editingRole) {
            result = await updateRole(editingRole.id, formData);
        } else {
            result = await createRole(formData);
        }
        
        setIsLoading(false);
        
        if (result?.success) {
            toast({
                title: editingRole ? "Role updated" : "Role created",
                description: editingRole ? "Role has been updated successfully." : "New role has been created.",
            });
            setEditingRole(null);
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

    const handleDelete = async () => {
        if (!roleToDelete) return;
        
        setIsLoading(true);
        const result = await deleteRole(roleToDelete.id);
        setIsLoading(false);

        if (result?.success) {
            toast({
                title: "Role deleted",
                description: "Role has been deleted successfully.",
            });
            setRoleToDelete(null);
            setIsDeleteDialogOpen(false);
            router.refresh();
        } else {
            toast({
                title: "Error",
                description: result?.error || "Failed to delete role",
                variant: "destructive",
            });
        }
    };

    const filteredRoles = roles.filter(role => 
        role.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openEdit = (role: Role) => {
        setEditingRole(role);
        setIsDialogOpen(true);
    };

    const openCreate = () => {
        setEditingRole(null);
        setIsDialogOpen(true);
    };

    const openDelete = (role: Role) => {
        setRoleToDelete(role);
        setIsDeleteDialogOpen(true);
    };

    const handleDialogOpen = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) setEditingRole(null);
    };

    const openPermissions = async (role: Role) => {
        setRoleForPermissions(role);
        setIsPermissionsDialogOpen(true);
        setIsLoadingPermissions(true);
        
        const result = await getRolePermissions(role.id);
        
        setIsLoadingPermissions(false);
        
        if (result.success) {
            const tree = buildModuleTree(result.modules);
            setPermissionsModules(tree);
        } else {
            toast({
                title: "Error",
                description: result.error || "Failed to load permissions",
                variant: "destructive",
            });
            setIsPermissionsDialogOpen(false);
        }
    };

    const handlePermissionChange = (moduleId: string, permission: string, checked: boolean, isParent: boolean) => {
        setPermissionsModules(prev => {
            const updateModule = (modules: ModulePermission[]): ModulePermission[] => {
                return modules.map(m => {
                    if (m.id === moduleId) {
                        return {
                            ...m,
                            permissions: {
                                canCreate: m.permissions?.canCreate ?? false,
                                canRead: m.permissions?.canRead ?? false,
                                canUpdate: m.permissions?.canUpdate ?? false,
                                canDelete: m.permissions?.canDelete ?? false,
                                [permission]: checked
                            }
                        };
                    }
                    if (m.children && m.children.length > 0) {
                        return {
                            ...m,
                            children: updateModule(m.children)
                        };
                    }
                    return m;
                });
            };

            let updatedModules = updateModule(prev);

            if (isParent) {
                const applyCascade = (modules: ModulePermission[]): ModulePermission[] => {
                    return modules.map(m => {
                        if (m.id === moduleId) {
                            const cascadeToChildren = (children: ModulePermission[]): ModulePermission[] => {
                                return children.map(child => ({
                                    ...child,
                                    permissions: {
                                        canCreate: permission === 'canCreate' ? checked : (child.permissions?.canCreate ?? false),
                                        canRead: permission === 'canRead' ? checked : (child.permissions?.canRead ?? false),
                                        canUpdate: permission === 'canUpdate' ? checked : (child.permissions?.canUpdate ?? false),
                                        canDelete: permission === 'canDelete' ? checked : (child.permissions?.canDelete ?? false),
                                    },
                                    children: child.children ? cascadeToChildren(child.children) : []
                                }));
                            };

                            return {
                                ...m,
                                children: m.children ? cascadeToChildren(m.children) : []
                            };
                        }
                        if (m.children && m.children.length > 0) {
                            return {
                                ...m,
                                children: applyCascade(m.children)
                            };
                        }
                        return m;
                    });
                };
                updatedModules = applyCascade(updatedModules);
            }

            return updatedModules;
        });
    };

    const savePermissions = async () => {
        if (!roleForPermissions) return;
        
        setIsLoadingPermissions(true);
        
        const flattenModules = (modules: ModulePermission[]): ModulePermission[] => {
            let flat: ModulePermission[] = [];
            modules.forEach(m => {
                flat.push(m);
                if (m.children && m.children.length > 0) {
                    flat = [...flat, ...flattenModules(m.children)];
                }
            });
            return flat;
        };
        
        const flatModules = flattenModules(permissionsModules);
        
        const permissions = flatModules
            .filter(m => m.permissions && (m.permissions.canCreate || m.permissions.canRead || m.permissions.canUpdate || m.permissions.canDelete))
            .map(m => ({
                moduleId: m.id,
                canCreate: m.permissions!.canCreate,
                canRead: m.permissions!.canRead,
                canUpdate: m.permissions!.canUpdate,
                canDelete: m.permissions!.canDelete
            }));
        
        const result = await updateRolePermissions(roleForPermissions.id, permissions);
        
        setIsLoadingPermissions(false);
        
        if (result.success) {
            toast({
                title: "Permissions updated",
                description: "Role permissions have been updated successfully.",
            });
            setIsPermissionsDialogOpen(false);
            router.refresh();
        } else {
            toast({
                title: "Error",
                description: result.error || "Failed to update permissions",
                variant: "destructive",
            });
        }
    };

    const isAllChecked = (permission: string) => {
        return permissionsModules.every(m => !m.permissions || !m.permissions[permission as keyof typeof m.permissions]);
    };

    const toggleAll = (permission: string, checked: boolean) => {
        setPermissionsModules(prev => prev.map(m => ({
            ...m,
            permissions: {
                canCreate: m.permissions?.canCreate ?? false,
                canRead: m.permissions?.canRead ?? false,
                canUpdate: m.permissions?.canUpdate ?? false,
                canDelete: m.permissions?.canDelete ?? false,
                [permission]: checked
            }
        })));
    };

    return (
        <div className="flex flex-col min-h-screen bg-secondary/5 p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Roles</h1>
                    <p className="text-muted-foreground mt-1">Manage system roles.</p>
                </div>
                <Button onClick={openCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Role
                </Button>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle>All Roles</CardTitle>
                    <div className="relative w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search roles..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </CardHeader>
                <CardHeader className="pt-0">
                    <div className="rounded-md border">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left p-3 text-sm font-medium">Role Name</th>
                                    <th className="text-left p-3 text-sm font-medium">Users</th>
                                    <th className="text-center p-3 text-sm font-medium">Permissions</th>
                                    <th className="text-right p-3 text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRoles.map((role) => (
                                    <tr key={role.id} className="border-t hover:bg-muted/50">
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-primary/10">
                                                    <Shield className="h-4 w-4 text-primary" />
                                                </div>
                                                <span className="font-medium capitalize">{role.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground">
                                            {role.userCount} user{role.userCount !== 1 ? 's' : ''}
                                        </td>
                                        <td className="p-3 text-center">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => openPermissions(role)}
                                            >
                                                <Key className="h-4 w-4 mr-1" />
                                                Manage
                                            </Button>
                                        </td>
                                        <td className="p-3 text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                onClick={() => openEdit(role)}
                                                title="Edit"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                onClick={() => openDelete(role)}
                                                className="text-destructive hover:text-destructive"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardHeader>
            </Card>

            {filteredRoles.length === 0 && (
                <div className="text-center py-12">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No roles found.</p>
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" className="hidden">Open</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingRole ? 'Edit Role' : 'Create Role'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingRole 
                                ? 'Update role name.'
                                : 'Fill in the form to create a new role.'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Role Name</Label>
                            <Input 
                                id="name"
                                name="name" 
                                defaultValue={editingRole?.name || ''} 
                                placeholder="e.g., editor, viewer" 
                                required 
                                autoComplete="off"
                            />
                        </div>
                        
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
                                {editingRole ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Role</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the role "{roleToDelete?.name}"?
                            {roleToDelete && roleToDelete.userCount > 0 && (
                                <p className="text-destructive mt-2">
                                    This role has {roleToDelete.userCount} user(s) assigned to it.
                                </p>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleDelete}
                            disabled={isLoading || !!(roleToDelete && roleToDelete.userCount > 0)}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
                <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Manage Permissions - <span className="capitalize">{roleForPermissions?.name}</span></DialogTitle>
                        <DialogDescription>
                            Configure what modules and actions this role can access.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {isLoadingPermissions ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto border rounded-lg">
                            <div className="grid grid-cols-5 gap-4 p-4 bg-primary text-primary-foreground sticky top-0">
                                <div className="text-left text-sm font-semibold">Module</div>
                                <div className="text-center text-sm font-semibold">Read</div>
                                <div className="text-center text-sm font-semibold">Create</div>
                                <div className="text-center text-sm font-semibold">Update</div>
                                <div className="text-center text-sm font-semibold">Delete</div>
                            </div>
                            <div className="divide-y divide-border">
                                {(() => {
                                    const flatModules = flattenModuleTree(permissionsModules);
                                    return flatModules.map((mod) => {
                                        const depth = mod.depth;
                                        const paddingLeft = 16 + (depth * 24);
                                        const isParent = mod.type === 'FOLDER';
                                        const bgColor = depth === 0 ? 'bg-secondary/30' : depth === 1 ? 'bg-secondary/10' : 'bg-card';
                                        const textColor = depth === 0 ? 'font-semibold text-primary' : '';
                                        
                                        return (
                                            <div 
                                                key={mod.id} 
                                                className={`grid grid-cols-5 gap-4 p-3 ${bgColor}`}
                                                style={{ paddingLeft: `${paddingLeft}px` }}
                                            >
                                                <div className={`flex items-center gap-2 ${textColor}`}>
                                                    {isParent && <Folder className="h-4 w-4 text-primary" />}
                                                    {mod.name}
                                                </div>
                                                <div className="text-center">
                                                    <Checkbox
                                                        checked={mod.permissions?.canRead || false}
                                                        onCheckedChange={(checked) => handlePermissionChange(mod.id, 'canRead', checked as boolean, isParent)}
                                                        className="mx-auto"
                                                    />
                                                </div>
                                                <div className="text-center">
                                                    <Checkbox
                                                        checked={mod.permissions?.canCreate || false}
                                                        onCheckedChange={(checked) => handlePermissionChange(mod.id, 'canCreate', checked as boolean, isParent)}
                                                        className="mx-auto"
                                                    />
                                                </div>
                                                <div className="text-center">
                                                    <Checkbox
                                                        checked={mod.permissions?.canUpdate || false}
                                                        onCheckedChange={(checked) => handlePermissionChange(mod.id, 'canUpdate', checked as boolean, isParent)}
                                                        className="mx-auto"
                                                    />
                                                </div>
                                                <div className="text-center">
                                                    <Checkbox
                                                        checked={mod.permissions?.canDelete || false}
                                                        onCheckedChange={(checked) => handlePermissionChange(mod.id, 'canDelete', checked as boolean, isParent)}
                                                        className="mx-auto"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    )}
                    
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsPermissionsDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={savePermissions}
                            disabled={isLoadingPermissions}
                        >
                            {isLoadingPermissions && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Permissions
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
