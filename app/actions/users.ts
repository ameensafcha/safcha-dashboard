
'use server'

import { prisma } from '@/lib/prisma';
import { getCurrentUser, hasAdminAccess } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const createUserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    roleId: z.string().min(1, "Role is required"),
    isActive: z.boolean().optional(),
});

const updateUserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters").optional().nullable(),
    roleId: z.string().min(1, "Role is required"),
    isActive: z.boolean().optional(),
});

export async function getUsers() {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !hasAdminAccess(currentUser)) {
        return { error: "Unauthorized" };
    }

    try {
        // Get admin role first
        const adminRole = await prisma.role.findFirst({
            where: { name: 'admin' }
        });

        const users = await prisma.user.findMany({
            where: {
                roleId: adminRole ? { not: adminRole.id } : undefined
            },
            include: {
                Role: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return { success: true, users };
    } catch (error) {
        console.error("Error fetching users:", error);
        return { error: "Failed to fetch users" };
    }
}

export async function getRoles() {
    try {
        const roles = await prisma.role.findMany({
            where: {
                name: { not: 'admin' }
            },
            orderBy: {
                name: 'asc'
            }
        });
        return { success: true, roles };
    } catch (error) {
        console.error("Error fetching roles:", error);
        return { error: "Failed to fetch roles" };
    }
}

export async function createUser(formData: FormData) {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !hasAdminAccess(currentUser)) {
        return { error: "Unauthorized" };
    }

    const rawData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        roleId: formData.get('roleId'),
        isActive: formData.get('isActive') === 'on' ? true : false,
    };

    const validatedFields = createUserSchema.safeParse(rawData);

    if (!validatedFields.success) {
        const firstError = Object.values(validatedFields.error.flatten().fieldErrors).flat()[0];
        return { error: firstError || "Validation failed" };
    }

    const { name, email, password, roleId, isActive } = validatedFields.data;

    try {
        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { error: "Email already exists" };
        }

        const newUser = await prisma.user.create({
            data: {
                id: crypto.randomUUID(),
                name,
                email,
                password: await bcrypt.hash(password!, 10),
                roleId,
                isActive: isActive ?? true,
            }
        });

        revalidatePath('/admindashboard/users');
        return { success: true, user: newUser };

    } catch (error) {
        console.error("Error creating user:", error);
        return { error: "Failed to create user" };
    }
}

export async function updateUser(userId: string, formData: FormData) {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !hasAdminAccess(currentUser)) {
        return { error: "Unauthorized" };
    }

    const rawData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        roleId: formData.get('roleId'),
        isActive: formData.get('isActive') === 'on' ? true : false,
    };

    const validatedFields = updateUserSchema.safeParse(rawData);

    if (!validatedFields.success) {
        const firstError = Object.values(validatedFields.error.flatten().fieldErrors).flat()[0];
        return { error: firstError || "Validation failed" };
    }

    const { name, email, password, roleId, isActive } = validatedFields.data;

    try {
        // Check if email already exists (excluding current user)
        const existingUser = await prisma.user.findFirst({
            where: {
                email,
                NOT: { id: userId }
            }
        });

        if (existingUser) {
            return { error: "Email already exists" };
        }

        // If password is provided, hash it
        const updateData: any = {
            name,
            email,
            roleId,
            isActive: isActive ?? true,
        };

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        revalidatePath('/admindashboard/users');
        return { success: true, user: updatedUser };

    } catch (error) {
        console.error("Error updating user:", error);
        return { error: "Failed to update user" };
    }
}

export async function toggleUserActive(userId: string) {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !hasAdminAccess(currentUser)) {
        return { error: "Unauthorized" };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return { error: "User not found" };
        }

        // Prevent deactivating yourself
        if (user.id === currentUser.id) {
            return { error: "You cannot deactivate your own account" };
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isActive: !user.isActive }
        });

        revalidatePath('/admindashboard/users');
        return { success: true, user: updatedUser };

    } catch (error) {
        console.error("Error toggling user status:", error);
        return { error: "Failed to update user status" };
    }
}

export async function deleteUser(userId: string) {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !hasAdminAccess(currentUser)) {
        return { error: "Unauthorized" };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return { error: "User not found" };
        }

        // Prevent deleting yourself
        if (user.id === currentUser.id) {
            return { error: "You cannot delete your own account" };
        }

        // Delete user (cascades to UserPermission)
        await prisma.user.delete({
            where: { id: userId }
        });

        revalidatePath('/admindashboard/users');
        return { success: true };

    } catch (error) {
        console.error("Error deleting user:", error);
        return { error: "Failed to delete user" };
    }
}
