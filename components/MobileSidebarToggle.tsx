'use client';

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export function MobileSidebarToggle() {
    const { toggleSidebar, isMobile } = useSidebar();

    if (!isMobile) {
        return null;
    }

    return (
        <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={toggleSidebar}
        >
            <Menu className="h-5 w-5" />
        </Button>
    );
}
