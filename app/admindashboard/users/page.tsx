
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { UsersPageClient } from "./UsersPageClient";

async function getUsers() {
    const users = await prisma.user.findMany({
        include: {
            Role: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    
    return users.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt?.toISOString() || '-',
    }));
}

async function getRoles() {
    return await prisma.role.findMany({
        orderBy: {
            name: 'asc'
        }
    });
}

export default async function UsersPage() {
    const user = await getCurrentUser();

    if (!user || !user.Role?.RolePermission?.some(
        (p: any) => p.canCreate && p.canUpdate && p.canDelete && p.canRead
    )) {
        redirect("/dashboard");
    }

    const users = await getUsers();
    const roles = await getRoles();

    return <UsersPageClient users={users} roles={roles} currentUserId={user.id} />;
}
