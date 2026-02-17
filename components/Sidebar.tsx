"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Settings,
    Users,
    ShoppingCart,
    BarChart3,
    FileText,
    Package,
    ShieldAlert,
    ChevronLeft,
    ChevronRight,
    Folder
} from "lucide-react";
import { ICON_MAP } from "@/lib/icons"; // Import unified icon map
import LogoutButton from "@/components/LogoutButton";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarRail,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Map module names to Lucide icons (Fallback for system modules)
// We can now use Fa icons here too if we want, or keep Lucide for system ones
const iconMap: { [key: string]: any } = {
    "Dashboard": LayoutDashboard,
    "Users": Users,
    "Products": Package,
    "Orders": ShoppingCart,
    "Analytics": BarChart3,
    "Reports": FileText,
    "Settings": Settings,
};

export default function SidebarComponent({ user }: { user: any }) {
    // ... (rest of code)
    const pathname = usePathname();
    const isAdminDashboard = pathname?.startsWith('/admindashboard');

    if (!user) {
        return null;
    }

    // Get user's permissions
    const rolePermissions = user.Role.RolePermission;

    // Filter permissions where canRead is true and flatten Module structure
    const accessibleModules = rolePermissions
        .filter((rp: any) => rp.canRead)
        .map((rp: any) => rp.Module)
        .sort((a: any, b: any) => a.order - b.order);

    // Build Module Tree
    const buildTree = (modules: any[]) => {
        const moduleMap: { [key: string]: any } = {};
        const tree: any[] = [];

        // Deep copy items to avoid mutating originals if referenced elsewhere
        modules.forEach(m => {
            moduleMap[m.id] = { ...m, children: [] };
        });

        modules.forEach(m => {
            if (m.parentId && moduleMap[m.parentId]) {
                moduleMap[m.parentId].children.push(moduleMap[m.id]);
            } else if (!m.parentId) {
                // Only push top-level items to tree
                tree.push(moduleMap[m.id]);
            }
        });

        return tree;
    };

    const moduleTree = buildTree(accessibleModules);

    const renderModuleIcon = (module: any, className: string) => {
        if (module.icon) {
            // Check if it's in our Global Icon Map
            const IconComponent = ICON_MAP[module.icon];
            if (IconComponent) {
                return <IconComponent className={className} />;
            }
            // If it's not in ICON_MAP, it might be an Emoji OR a broken icon name.
            // We assume it's an emoji only if it's short (e.g. unicode char).
            // Prevent rendering "LayoutDashboard" as text.
            if (module.icon.length <= 4) {
                return <span className={className + " flex items-center justify-center not-italic leading-none text-lg"}>{module.icon}</span>;
            }
        }

        // Fallback
        const Icon = iconMap[module.name] || (module.type === 'FOLDER' ? Folder : FileText);
        return <Icon className={className} />;
    }

    const renderModule = (module: any) => {
        const isActive = pathname === `/${module.slug}`;
        const hasChildren = module.children && module.children.length > 0;

        // Custom icon style logic
        const iconClass = isActive ? "h-4 w-4 mr-3 text-primary" : "h-4 w-4 mr-3 text-muted-foreground";

        if (module.type === 'FOLDER') {
            return (
                <SidebarMenuItem key={module.id}>
                    <Collapsible className="group/collapsible" defaultOpen={isActive}>
                        <SidebarMenuButton asChild tooltip={module.name}>
                            <CollapsibleTrigger asChild>
                                <div className="flex items-center w-full cursor-pointer font-medium">
                                    {renderModuleIcon(module, iconClass)}
                                    <span>{module.name}</span>
                                    <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                </div>
                            </CollapsibleTrigger>
                        </SidebarMenuButton>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {module.children.map((child: any) => renderModule(child))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </Collapsible>
                </SidebarMenuItem>
            );
        }

        return (
            <SidebarMenuItem key={module.id}>
                <SidebarMenuButton
                    asChild
                    tooltip={module.name}
                    isActive={isActive}
                    className={`
                        h-10 transition-all duration-200 rounded-md mx-1 mb-1
                        ${isActive
                            ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary pl-3 shadow-sm'
                            : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground hover:pl-3'
                        }
                    `}
                >
                    <Link href={`/${module.slug}`} className="flex items-center gap-3">
                        {renderModuleIcon(module, isActive ? "h-4 w-4" : "h-4 w-4")}
                        <span>{module.name}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    };

    return (
        <Sidebar collapsible="icon" className="border-r border-border/50">
            <SidebarContent className="px-3 py-4">
                <div className="h-4"></div>
                <SidebarMenu className="gap-3">
                    {isAdminDashboard ? (
                        <>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    className="bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20 shadow-none cursor-default h-12"
                                    tooltip="Admin Mode Active"
                                >
                                    <div className="flex items-center justify-center font-bold tracking-wide w-full">
                                        <ShieldAlert className="h-5 w-5 mr-3" />
                                        <span>Admin Mode</span>
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild className="hover:bg-sidebar-accent/50" tooltip="Modules">
                                    <Link href="/admindashboard/modules" className="font-medium">
                                        <div className="flex items-center justify-center h-4 w-4 mr-3 border border-dashed border-primary/50 rounded-sm text-primary">
                                            <span className="text-xs font-bold">+</span>
                                        </div>
                                        <span>Modules</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild className="hover:bg-sidebar-accent/50 text-muted-foreground" tooltip="Back to Dashboard">
                                    <Link href="/dashboard" className="font-medium">
                                        <ChevronLeft className="h-4 w-4 mr-3" />
                                        <span>Back to Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </>
                    ) : (
                        <>
                            {user.Role?.name === 'admin' && (
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground hover:from-primary hover:to-primary/90 shadow-md hover:shadow-lg transition-all duration-300 border border-primary/20"
                                        tooltip="Enter Admin Mode"
                                    >
                                        <a href="/admindashboard" className="font-semibold tracking-wide">
                                            <ShieldAlert className="h-4 w-4 mr-2" />
                                            <span>Admin Mode</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}
                            {moduleTree.map((module: any) => renderModule(module))}
                        </>
                    )}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter>
                <div className="p-2">
                    {user.Role?.name === 'admin' && (
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Settings">
                                    <Link href="/settings" className="flex items-center gap-3">
                                        <Settings className="h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    )}
                    <div className="flex items-center gap-3 mb-1 px-3 py-2 bg-secondary/10 rounded-xl group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:px-0 mt-2">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden transition-all duration-300 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
                            <span className="text-sm font-semibold truncate text-foreground">{user.name}</span>
                            <span className="text-xs text-muted-foreground truncate font-medium capitalize flex items-center gap-1">
                                {user.Role?.name || 'User'}
                            </span>
                        </div>
                    </div>
                    <div className="group-data-[collapsible=icon]:hidden px-1">
                        <LogoutButton />
                    </div>
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
