"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
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
    Folder,
    Shield,
    Boxes,
    Factory,
    Wallet,
    User,
    Building,
    GitBranch,
    Bell,
    Megaphone,
    DollarSign,
    Calendar,
    Layout,
    CheckSquare,
    FolderKanban,
    UserPlus,
    Scale,
    FileSignature,
    BookOpen,
    File,
    Briefcase,
    Flag,
    Map,
    Target
} from "lucide-react";
import { ICON_MAP } from "@/lib/icons"; // Import unified icon map
import LogoutButton from "@/components/LogoutButton";
import { SettingsButton } from "@/components/SettingsButton";
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
    SidebarTrigger,
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

const itemStyle = (isActive: boolean) => `
    h-10 transition-all duration-200 rounded-md mx-1 mb-1
    ${isActive
        ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary pl-3 shadow-sm'
        : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground hover:pl-3'
    }
`;

export default function SidebarComponent({ user }: { user: any }) {
    // ... (rest of code)
    const pathname = usePathname();
    const isAdminDashboard = pathname?.startsWith('/admindashboard');

    if (!user) {
        return null;
    }

    // Compute admin access from permissions (permission-based, not hardcoded role name)
    const rolePermissions = user.Role?.RolePermission || [];
    const isAdmin = user.Role?.name === 'admin';

    // Load expanded modules from localStorage
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('sidebar_expanded_modules');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setExpandedModules(new Set(parsed));
            } catch (e) {
                console.error('Error parsing sidebar state:', e);
            }
        }
        setIsLoaded(true);
    }, []);

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => {
            const newSet = new Set(prev);
            if (newSet.has(moduleId)) {
                newSet.delete(moduleId);
            } else {
                newSet.add(moduleId);
            }
            localStorage.setItem('sidebar_expanded_modules', JSON.stringify([...newSet]));
            return newSet;
        });
    };

    const isModuleExpanded = (moduleId: string) => expandedModules.has(moduleId);

    const hasModulePermission = (slug: string, permission: 'canRead' | 'canCreate' | 'canUpdate' | 'canDelete' = 'canRead') => {
        const modPerm = rolePermissions.find((rp: any) => rp.Module?.slug === slug);
        return modPerm ? modPerm[permission] : false;
    };

    // Get modules that have read permission (including children)
    // First get all child modules with read permission
    const childModulesWithPermission = rolePermissions
        .filter((rp: any) => rp.canRead && rp.Module.parentId)
        .map((rp: any) => rp.Module);

    // Get parent IDs of those children
    const parentIdsWithChildren = new Set(childModulesWithPermission.map((m: any) => m.parentId));

    // Get all modules that either have read permission OR are parents of modules with permission
    const accessibleModules = rolePermissions
        .filter((rp: any) => {
            const mod = rp.Module;
            // Include if has read permission OR is a parent of something with permission
            return rp.canRead || parentIdsWithChildren.has(mod.id);
        })
        .map((rp: any) => rp.Module)
        .sort((a: any, b: any) => a.order - b.order);

    // Remove duplicates by id
    const seen = new Set();
    const uniqueModules = accessibleModules.filter((m: any) => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
    });

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

    const moduleTree = buildTree(uniqueModules);

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
    };

    const renderModule = (module: any) => {
        const isActive = pathname === `/${module.slug}`;
        const hasChildren = module.children && module.children.length > 0;

        // Custom icon style logic
        const iconClass = isActive ? "h-4 w-4 mr-3 text-primary" : "h-4 w-4 mr-3 text-muted-foreground";

        if (module.type === 'FOLDER') {
            const isExpanded = isLoaded && isModuleExpanded(module.id);
            return (
                <SidebarMenuItem key={module.id}>
                    <Collapsible 
                        className="group/collapsible" 
                        open={isExpanded}
                        onOpenChange={() => toggleModule(module.id)}
                    >
                        <SidebarMenuButton asChild tooltip={module.name}>
                            <CollapsibleTrigger asChild>
                                <div className="flex items-center w-full cursor-pointer font-medium">
                                    {renderModuleIcon(module, iconClass)}
                                    <span>{module.name}</span>
                                    <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-150 group-data-[state=open]/collapsible:rotate-90" />
                                </div>
                            </CollapsibleTrigger>
                        </SidebarMenuButton>
                        <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-up-to-0 data-[state=open]:slide-down-to-0 duration-150 overflow-hidden">
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
                    className={itemStyle(isActive)}
                >
                    <Link href={`/${module.slug}`} className="flex items-center gap-3">
                        {renderModuleIcon(module, "h-4 w-4")}
                        <span>{module.name}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    };

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="py-1">
                </SidebarHeader>
            <SidebarContent className="px-2 py-2 overflow-y-auto scrollbar-hide">
                <div className="h-1"></div>
                <SidebarMenu className="gap-1">
                    {isAdminDashboard ? (
                        <>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    className={itemStyle(pathname === '/dashboard')}
                                    tooltip="Exit Admin Mode"
                                >
                                    <Link href="/dashboard" className="flex items-center gap-3">
                                        <ShieldAlert className="h-4 w-4" />
                                        <span>Exit Admin Mode</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    className={itemStyle(pathname === '/admindashboard/users')}
                                    tooltip="Users"
                                >
                                    <Link href="/admindashboard/users" className="flex items-center gap-3">
                                        <Users className="h-4 w-4" />
                                        <span>Users</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    className={itemStyle(pathname === '/admindashboard/roles')}
                                    tooltip="Roles"
                                >
                                    <Link href="/admindashboard/roles" className="flex items-center gap-3">
                                        <Shield className="h-4 w-4" />
                                        <span>Roles</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </>
                    ) : (
                        <>
                            {isAdmin && (
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        className={itemStyle(pathname === '/admindashboard')}
                                        tooltip="Enter Admin Mode"
                                    >
                                        <Link href="/admindashboard" className="flex items-center gap-3">
                                            <ShieldAlert className="h-4 w-4" />
                                            <span>Admin Mode</span>
                                        </Link>
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
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SettingsButton />
                        </SidebarMenuItem>
                    </SidebarMenu>
                    <div className="flex items-center gap-3 px-3 py-2 mt-2 border-t pt-3">
                        <Avatar className="h-9 w-9 border-2 border-primary/20 shadow-sm">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                                {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden min-w-0">
                            <span className="text-sm font-semibold truncate text-foreground">{user.name}</span>
                            <span className="text-xs text-muted-foreground truncate font-medium capitalize">
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
