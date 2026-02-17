"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const createModuleSchema = z.object({
    name: z.string().min(1, "Name is required"),
    // slug and order are auto-generated
    type: z.enum(["PAGE", "FOLDER"]).default("PAGE"),
    parentId: z.string().optional().nullable(),
    icon: z.string().optional(),
});

export async function createModule(formData: FormData) {
    const user = await getCurrentUser();

    if (!user || user.Role?.name !== "admin") {
        return { error: "Unauthorized" };
    }

    let rawParentId = formData.get("parentId");
    if (rawParentId === "null" || rawParentId === "") {
        rawParentId = null;
    }

    const rawData = {
        name: formData.get("name"),
        type: formData.get("type"),
        parentId: rawParentId,
        icon: formData.get("icon") || undefined, // Convert null/empty string to undefined
    };

    const validatedFields = createModuleSchema.safeParse(rawData);

    if (!validatedFields.success) {
        console.error("Module validation failed:", validatedFields.error.flatten().fieldErrors);
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { name, type, parentId, icon } = validatedFields.data;

    // Auto-generate Slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Auto-generate Order
    // Find the max order among siblings (same parentId)
    const maxOrderModule = await prisma.module.findFirst({
        where: { parentId: parentId },
        orderBy: { order: 'desc' },
        select: { order: true }
    });
    const order = (maxOrderModule?.order ?? 0) + 1; // Start at 1 if no siblings

    console.log("Creating module:", { name, slug, order, type, parentId, icon });

    try {
        // 1. Create Module
        const newModule = await prisma.module.create({
            data: {
                name,
                slug,
                order,
                type,
                parentId,
                icon,
            },
        });

        // 2. Auto-assign permission to Admin Role for the new module
        if (user.roleId) {
            await prisma.rolePermission.create({
                data: {
                    id: crypto.randomUUID(),
                    roleId: user.roleId,
                    moduleId: newModule.id,
                    canCreate: true,
                    canRead: true,
                    canUpdate: true,
                    canDelete: true,
                },
            });
        }

        // 3. Auto-create "Dashboard" child if it's a FOLDER
        if (type === "FOLDER") {
            const dashboardSlug = `${slug}-dashboard`;
            // Ensure uniqueness (basic check, assume parent slug is unique enough for now)

            try {
                const dashboardModule = await prisma.module.create({
                    data: {
                        name: "Dashboard",
                        slug: dashboardSlug,
                        type: "PAGE",
                        parentId: newModule.id,
                        order: 1, // First item
                        icon: "FaChartBar", // Default dashboard icon
                    }
                });

                // Assign permission for the child dashboard as well
                if (user.roleId) {
                    await prisma.rolePermission.create({
                        data: {
                            id: crypto.randomUUID(),
                            roleId: user.roleId,
                            moduleId: dashboardModule.id,
                            canCreate: true,
                            canRead: true, // Visible
                            canUpdate: true,
                            canDelete: true,
                        },
                    });
                }
            } catch (err) {
                console.error("Failed to auto-create dashboard child:", err);
                // Don't fail the whole request if this optional step fails
            }
        }

        revalidatePath("/"); // Update sidebar
        revalidatePath("/admindashboard/modules");
        return { success: true };
    } catch (error: any) {
        console.error("Error creating module:", error);
        if (error.code === 'P2002') {
            return { error: `A module with the slug '${slug}' already exists. Please choose a different name.` };
        }
        return { error: "Failed to create module" };
    }
}

// Helper for recursive deletion
async function deleteModuleRecursive(moduleId: string) {
    // 1. Find all children
    const children = await prisma.module.findMany({
        where: { parentId: moduleId },
        select: { id: true }
    });

    // 2. Recursively delete children
    for (const child of children) {
        await deleteModuleRecursive(child.id);
    }

    // 3. Delete permissions for this module
    await prisma.rolePermission.deleteMany({
        where: { moduleId: moduleId },
    });

    await prisma.userPermission.deleteMany({
        where: { moduleId: moduleId },
    });

    // 4. Delete the module itself
    await prisma.module.delete({
        where: { id: moduleId },
    });
}

export async function deleteModule(moduleId: string) {
    const user = await getCurrentUser();

    if (!user || user.Role?.name !== "admin") {
        return { error: "Unauthorized" };
    }

    try {
        await deleteModuleRecursive(moduleId);

        revalidatePath("/");
        revalidatePath("/admindashboard/modules");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting module:", error);
        return { error: "Failed to delete module" };
    }
}
