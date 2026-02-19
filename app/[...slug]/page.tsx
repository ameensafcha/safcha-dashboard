import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasModulePermission } from "@/lib/auth";
import { ICON_MAP } from "@/lib/icons";
import { Package, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Props = {
    params: Promise<{ slug: string[] }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props) {
    const params = await props.params;
    const slug = params.slug.join('/');
    const currentModule = await prisma.module.findUnique({
        where: { slug },
        select: { name: true }
    });

    if (!currentModule) return { title: "Not Found" };
    return { title: `${currentModule.name} - Dashboard` };
}

export default async function DynamicModulePage(props: Props) {
    const params = await props.params;
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const slug = params.slug.join('/');

    // Fetch currentModule with children
    const currentModule = await prisma.module.findUnique({
        where: { slug },
        include: {
            children: {
                orderBy: { order: 'asc' }
            },
            parent: true
        }
    });

    if (!currentModule) {
        notFound();
    }

    // Check Permissions using hasModulePermission helper
    // This checks both RolePermission and UserPermission tables
    const hasAccess = hasModulePermission(user, currentModule.id, 'canRead');

    if (!hasAccess) {
        return (
            <div className="flex h-full flex-col items-center justify-center space-y-4 p-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
                    <p className="text-muted-foreground">You do not have permission to view this currentModule.</p>
                </div>
                <Link href="/dashboard" className="text-primary hover:underline">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    // Resolve Icon
    let IconComponent: any = currentModule.type === 'FOLDER' ? Package : FileText;
    if (currentModule.icon && ICON_MAP[currentModule.icon]) {
        IconComponent = ICON_MAP[currentModule.icon];
    } else if (currentModule.icon && currentModule.icon.length <= 4) {
        // Emoji fallback
        IconComponent = () => <span className="text-2xl">{currentModule.icon}</span>;
    }

    // Determine content based on type
    const isFolder = currentModule.type === 'FOLDER';
    const isDashboard = currentModule.type === 'DASHBOARD';

    // Title Logic
    const isDashboardChild = currentModule.type === 'DASHBOARD' && currentModule.parent;
    const pageTitle = isDashboardChild
        ? `${currentModule.parent?.name} Dashboard`
        : currentModule.name;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 border-b pb-6">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <IconComponent className="h-8 w-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{pageTitle}</h1>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                        <Link href="/dashboard" className="hover:text-primary transition-colors">Home</Link>
                        {currentModule.parent && (
                            <>
                                <ChevronRight className="h-4 w-4" />
                                <span className="hover:text-primary transition-colors cursor-default">{currentModule.parent.name}</span>
                            </>
                        )}
                        {!isDashboardChild && (
                            <>
                                <ChevronRight className="h-4 w-4" />
                                <span className="font-medium text-foreground">{currentModule.name}</span>
                            </>
                        )}
                        {/* If it IS a dashboard child, we effectively showed "Home > Parent" which maps to this dashboard contextually */}
                    </p>
                </div>
            </div>

            {/* Content Area */}
            {isFolder ? (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">SubcurrentModules</h2>
                        {currentModule.children.length === 0 ? (
                            <div className="text-muted-foreground italic border border-dashed p-8 rounded-lg text-center">
                                This folder is empty.
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {currentModule.children.map((child) => {
                                    let ChildIcon: any = child.type === 'FOLDER' ? Package : FileText;
                                    if (child.icon && ICON_MAP[child.icon]) {
                                        ChildIcon = ICON_MAP[child.icon];
                                    } else if (child.icon && child.icon.length <= 4) {
                                        ChildIcon = () => <span className="text-lg">{child.icon}</span>;
                                    }

                                    return (
                                        <Link href={`/${child.slug}`} key={child.id} className="block group">
                                            <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50">
                                                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                                                    <div className="p-2 bg-secondary rounded-md text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                                        <ChildIcon className="h-5 w-5" />
                                                    </div>
                                                    <CardTitle className="text-base font-medium group-hover:text-primary transition-colors">
                                                        {child.name}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        Access the {child.name} currentModule.
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{currentModule.name}</CardTitle>
                            <CardDescription>
                                Module: {currentModule.slug}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="min-h-[400px] flex items-center justify-center border-t bg-secondary/5">
                            <div className="text-center space-y-2">
                                <p className="text-muted-foreground">This currentModule has no content yet.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
