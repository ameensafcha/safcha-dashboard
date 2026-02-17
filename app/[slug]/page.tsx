import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ICON_MAP } from "@/lib/icons";
import { Package, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Props = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props) {
    const params = await props.params;
    const module = await prisma.module.findUnique({
        where: { slug: params.slug },
        select: { name: true }
    });

    if (!module) return { title: "Not Found" };
    return { title: `${module.name} - Dashboard` };
}

export default async function DynamicModulePage(props: Props) {
    const params = await props.params;
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const { slug } = params;

    // Fetch module with children
    const module = await prisma.module.findUnique({
        where: { slug },
        include: {
            children: {
                orderBy: { order: 'asc' }
            },
            parent: true
        }
    });

    if (!module) {
        notFound();
    }

    // Check Permissions (Basic check - if user has any permission on this module)
    // In a real app, strict checks (canRead) should be enforced.
    // Assuming the sidebar handles visibility, but for direct access:
    const userPermission = user.Role.RolePermission.find((p: any) => p.moduleId === module.id);
    const hasAccess = user.Role.name === 'admin' || (userPermission && userPermission.canRead);

    if (!hasAccess) {
        return (
            <div className="flex h-full flex-col items-center justify-center space-y-4 p-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
                    <p className="text-muted-foreground">You do not have permission to view this module.</p>
                </div>
                <Link href="/dashboard" className="text-primary hover:underline">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    // Resolve Icon
    let IconComponent: any = module.type === 'FOLDER' ? Package : FileText;
    if (module.icon && ICON_MAP[module.icon]) {
        IconComponent = ICON_MAP[module.icon];
    } else if (module.icon && module.icon.length <= 4) {
        // Emoji fallback
        IconComponent = () => <span className="text-2xl">{module.icon}</span>;
    }

    // Determine content based on type
    const isFolder = module.type === 'FOLDER';

    // Title Logic
    const isDashboardChild = module.name === "Dashboard" && module.parent;
    const pageTitle = isDashboardChild
        ? `${module.parent?.name} Dashboard`
        : `${module.name} Dashboard`;

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
                        {module.parent && (
                            <>
                                <ChevronRight className="h-4 w-4" />
                                <span className="hover:text-primary transition-colors cursor-default">{module.parent.name}</span>
                            </>
                        )}
                        {!isDashboardChild && (
                            <>
                                <ChevronRight className="h-4 w-4" />
                                <span className="font-medium text-foreground">{module.name}</span>
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
                        <h2 className="text-xl font-semibold mb-4">Submodules</h2>
                        {module.children.length === 0 ? (
                            <div className="text-muted-foreground italic border border-dashed p-8 rounded-lg text-center">
                                This folder is empty.
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {module.children.map((child) => {
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
                                                        Access the {child.name} module.
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
                            <CardTitle>Overview</CardTitle>
                            <CardDescription>
                                This is the main dashboard for the {module.name} module.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] flex items-center justify-center border-t bg-secondary/5">
                            <div className="text-center space-y-2">
                                <FileText className="h-10 w-10 text-muted-foreground mx-auto opacity-20" />
                                <p className="text-muted-foreground">Module content goes here.</p>
                                <p className="text-xs text-muted-foreground/50">
                                    Slug: {slug} | Type: {module.type}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
