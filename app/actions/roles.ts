'use server'

import { prisma } from '@/lib/prisma';
import { getCurrentUser, hasAdminAccess } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createRoleSchema = z.object({
    name: z.string().min(1, "Role name is required").max(50, "Role name must be less than 50 characters"),
});

const updateRoleSchema = z.object({
    name: z.string().min(1, "Role name is required").max(50, "Role name must be less than 50 characters"),
});

export async function getRoles() {
    try {
        const roles = await prisma.role.findMany({
            where: {
                name: { not: 'admin' }
            },
            include: {
                _count: {
                    select: { User: true }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
        
        const formattedRoles = roles.map(role => ({
            id: role.id,
            name: role.name,
            userCount: role._count.User,
            createdAt: role.id.startsWith('admin-') ? null : null,
        }));
        
        return { success: true, roles: formattedRoles };
    } catch (error) {
        console.error("Error fetching roles:", error);
        return { error: "Failed to fetch roles" };
    }
}

export async function createRole(formData: FormData) {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !hasAdminAccess(currentUser)) {
        return { error: "Unauthorized" };
    }

    const rawData = {
        name: formData.get('name'),
    };

    const validatedFields = createRoleSchema.safeParse(rawData);

    if (!validatedFields.success) {
        const firstError = Object.values(validatedFields.error.flatten().fieldErrors).flat()[0];
        return { error: firstError || "Validation failed" };
    }

    const { name } = validatedFields.data;

    try {
        const existingRole = await prisma.role.findUnique({
            where: { name: name.toLowerCase() }
        });

        if (existingRole) {
            return { error: "Role already exists" };
        }

        const newRole = await prisma.role.create({
            data: {
                id: `role-${crypto.randomUUID()}`,
                name: name.toLowerCase(),
            }
        });

        revalidatePath('/admindashboard/roles');
        return { success: true, role: newRole };
    } catch (error) {
        console.error("Error creating role:", error);
        return { error: "Failed to create role" };
    }
}

export async function updateRole(roleId: string, formData: FormData) {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !hasAdminAccess(currentUser)) {
        return { error: "Unauthorized" };
    }

    const rawData = {
        name: formData.get('name'),
    };

    const validatedFields = updateRoleSchema.safeParse(rawData);

    if (!validatedFields.success) {
        const firstError = Object.values(validatedFields.error.flatten().fieldErrors).flat()[0];
        return { error: firstError || "Validation failed" };
    }

    const { name } = validatedFields.data;

    try {
        const existingRole = await prisma.role.findUnique({
            where: { name: name.toLowerCase() }
        });

        if (existingRole && existingRole.id !== roleId) {
            return { error: "Role name already exists" };
        }

        const updatedRole = await prisma.role.update({
            where: { id: roleId },
            data: {
                name: name.toLowerCase(),
            }
        });

        revalidatePath('/admindashboard/roles');
        return { success: true, role: updatedRole };
    } catch (error) {
        console.error("Error updating role:", error);
        return { error: "Failed to update role" };
    }
}

export async function deleteRole(roleId: string) {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !hasAdminAccess(currentUser)) {
        return { error: "Unauthorized" };
    }

    try {
        const usersWithRole = await prisma.user.count({
            where: { roleId }
        });

        if (usersWithRole > 0) {
            return { error: `Cannot delete role. ${usersWithRole} user(s) have this role assigned.` };
        }

        await prisma.role.delete({
            where: { id: roleId }
        });

        revalidatePath('/admindashboard/roles');
        return { success: true };
    } catch (error) {
        console.error("Error deleting role:", error);
        return { error: "Failed to delete role" };
    }
}

export async function getRolePermissions(roleId: string) {
    try {
        const modules = await prisma.module.findMany({
            where: { isActive: true },
            include: {
                RolePermission: {
                    where: { roleId }
                }
            },
            orderBy: [
                { type: 'asc' },
                { order: 'asc' }
            ]
        });

        const formattedModules = modules.map(module => ({
            id: module.id,
            name: module.name,
            slug: module.slug,
            type: module.type,
            parentId: module.parentId,
            permissions: module.RolePermission[0] || null
        }));

        return { success: true, modules: formattedModules };
    } catch (error) {
        console.error("Error fetching role permissions:", error);
        return { error: "Failed to fetch permissions" };
    }
}

export async function updateRolePermissions(roleId: string, permissions: { moduleId: string; canCreate: boolean; canRead: boolean; canUpdate: boolean; canDelete: boolean }[]) {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !hasAdminAccess(currentUser)) {
        return { error: "Unauthorized" };
    }

    try {
        for (const perm of permissions) {
            const existingPerm = await prisma.rolePermission.findUnique({
                where: {
                    roleId_moduleId: {
                        roleId,
                        moduleId: perm.moduleId
                    }
                }
            });

            if (existingPerm) {
                await prisma.rolePermission.update({
                    where: { id: existingPerm.id },
                    data: {
                        canCreate: perm.canCreate,
                        canRead: perm.canRead,
                        canUpdate: perm.canUpdate,
                        canDelete: perm.canDelete
                    }
                });
            } else {
                await prisma.rolePermission.create({
                    data: {
                        id: `rp-${crypto.randomUUID()}`,
                        roleId,
                        moduleId: perm.moduleId,
                        canCreate: perm.canCreate,
                        canRead: perm.canRead,
                        canUpdate: perm.canUpdate,
                        canDelete: perm.canDelete
                    }
                });
            }
        }

        revalidatePath('/admindashboard/roles');
        return { success: true };
    } catch (error) {
        console.error("Error updating role permissions:", error);
        return { error: "Failed to update permissions" };
    }
}
