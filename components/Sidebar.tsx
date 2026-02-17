
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Settings,
    FileText,
    Shield,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Home,
    ShieldAlert
} from 'lucide-react';
import LogoutButton from './LogoutButton';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Map module names to Lucide icons
const iconMap: { [key: string]: any } = {
    'Dashboard': LayoutDashboard,
    'Users': Users,
    'Roles': Shield,
    'Settings': Settings,
};

export default function SidebarComponent({ user }: { user: any }) {
    const pathname = usePathname();
    const isAdminDashboard = pathname?.startsWith('/admindashboard');

    if (!user) {
        return null;
    }

    // Get user's permissions
    const rolePermissions = user.Role.RolePermission;

    // Filter permissions where canRead is true
    const accessibleModules = rolePermissions
        .filter((rp: any) => rp.canRead)
        .map((rp: any) => rp.Module)
        .sort((a: any, b: any) => a.order - b.order);

    return (
        <Sidebar collapsible="icon" className="border-r border-border/50">
            <SidebarContent className="px-3 py-4">
                <div className="h-4"></div>
                <SidebarMenu className="gap-3">
                    {user.Role?.name === 'admin' && (
                        <SidebarMenuItem>
                            {isAdminDashboard ? (
                                <SidebarMenuButton
                                    className="bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20 shadow-none cursor-default"
                                    tooltip="Admin Mode Active"
                                >
                                    <div className="flex items-center font-bold tracking-wide w-full">
                                        <ShieldAlert className="h-5 w-5 mr-3" />
                                        <span>Admin Mode Active</span>
                                    </div>
                                </SidebarMenuButton>
                            ) : (
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
                            )}
                        </SidebarMenuItem>
                    )}
                    {accessibleModules.map((module: any) => {
                        const Icon = iconMap[module.name] || FileText;
                        const isActive = pathname === `/${module.slug}`;
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
                                        <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                                        <span>{module.name}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter>
                <div className="p-2">
                    <div className="flex items-center gap-3 mb-4 px-3 py-2 bg-secondary/10 rounded-xl group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:px-0">
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
