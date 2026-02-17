
'use client';

import { logout } from '@/app/actions/auth';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
    return (
        <button
            onClick={() => logout()}
            className="flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors group mt-2"
        >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
        </button>
    );
}
