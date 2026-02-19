'use client';

import SidebarComponent from '@/components/Sidebar';

export function SidebarWrapper({ user }: { user: any }) {
  return <SidebarComponent user={user} />;
}
