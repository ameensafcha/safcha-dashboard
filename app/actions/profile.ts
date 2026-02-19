'use server'

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const updateProfileSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, "New password must be at least 6 characters").optional(),
});

export async function getProfile() {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
        return { error: "Unauthorized" };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: currentUser.id },
            select: {
                id: true,
                name: true,
                email: true,
                roleId: true,
                Role: {
                    select: {
                        name: true
                    }
                }
            }
        });

        if (!user) {
            return { error: "User not found" };
        }

        return { 
            success: true, 
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.Role.name
            }
        };
    } catch (error) {
        console.error("Error fetching profile:", error);
        return { error: "Failed to fetch profile" };
    }
}

export async function updateProfile(formData: FormData) {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
        return { error: "Unauthorized" };
    }

    const rawData = {
        name: formData.get('name'),
        currentPassword: formData.get('currentPassword'),
        newPassword: formData.get('newPassword'),
    };

    const validatedFields = updateProfileSchema.safeParse(rawData);

    if (!validatedFields.success) {
        const firstError = Object.values(validatedFields.error.flatten().fieldErrors).flat()[0];
        return { error: firstError || "Validation failed" };
    }

    const { name, currentPassword, newPassword } = validatedFields.data;

    const isPasswordChangeRequested = newPassword && newPassword.length > 0;
    
    if (isPasswordChangeRequested && !currentPassword) {
        return { error: "Current password is required to change password" };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: currentUser.id }
        });

        if (!user) {
            return { error: "User not found" };
        }

        if (isPasswordChangeRequested) {
            const isPasswordValid = await bcrypt.compare(currentPassword!, user.password);

            if (!isPasswordValid) {
                return { error: "Current password is incorrect" };
            }
        }

        const updateData: { name: string; password?: string } = {
            name,
        };

        if (newPassword) {
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: currentUser.id },
            data: updateData
        });

        revalidatePath('/settings');
        return { success: true, user: { name: updatedUser.name } };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { error: "Failed to update profile" };
    }
}

const updateModeSchema = z.object({
    mode: z.enum(["light", "dark", "system"]).nullable()
});

export async function updateMode(formData: FormData) {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
        return { error: "Unauthorized" };
    }

    const rawData = {
        mode: formData.get('mode'),
    };

    const validatedFields = updateModeSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return { error: "Invalid mode" };
    }

    const { mode } = validatedFields.data;

    try {
        await prisma.userTheme.upsert({
            where: { userId: currentUser.id },
            update: { mode },
            create: {
                userId: currentUser.id,
                mode: mode || 'system',
            }
        });

        revalidatePath('/settings');
        return { success: true, mode };
    } catch (error) {
        console.error("Error updating mode:", error);
        return { error: "Failed to update mode" };
    }
}
