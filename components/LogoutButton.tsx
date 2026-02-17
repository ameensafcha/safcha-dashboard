
'use client';

import { useTransition } from 'react';
import { logout } from '@/app/actions/auth';
import { broadcastLogout } from './SessionSync';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
    const [isPending, startTransition] = useTransition();

    const handleLogout = async () => {
        broadcastLogout();
        await logout();
        // Force redirect using window.location
        window.location.href = '/login';
    };

    return (
        <button
            onClick={() => startTransition(handleLogout)}
            disabled={isPending}
            className="flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors group mt-2 disabled:opacity-50"
        >
            <LogOut className="w-5 h-5 mr-3" />
            {isPending ? 'Signing out...' : 'Sign Out'}
        </button>
    );
}
