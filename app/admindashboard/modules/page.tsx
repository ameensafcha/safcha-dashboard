
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ModuleTree } from "@/components/admin/ModuleTree";

async function getModules() {
    return await prisma.module.findMany({
        orderBy: { order: 'asc' },
    });
}

export default async function ModulesPage() {
    const user = await getCurrentUser();

    if (!user || user.Role?.name !== "admin") {
        redirect("/dashboard");
    }

    const modules = await getModules();

    return (
        <div className="flex flex-col min-h-screen bg-secondary/5 p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Modules</h1>
                    <p className="text-muted-foreground mt-1">Manage system modules and configurations.</p>
                </div>
            </div>

            {/* Modules Tree View */}
            <div className="bg-card border rounded-lg p-6 shadow-sm">
                <ModuleTree modules={modules} />
            </div>
        </div>
    );
}
