'use client';

import { useEffect, useCallback, useState } from 'react';

const SESSION_CHANNEL = 'safcha-session-channel';

export function useSessionSync() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleLogout = useCallback(() => {
        if (!isClient) return;
        
        // Delete session cookie manually
        document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        // Force redirect to login
        window.location.href = '/login';
    }, [isClient]);

    useEffect(() => {
        if (!isClient) return;

        let broadcast: BroadcastChannel | null = null;
        try {
            broadcast = new BroadcastChannel(SESSION_CHANNEL);
            broadcast.onmessage = (event) => {
                if (event.data === 'logout' || event.data === 'session-expired') {
                    handleLogout();
                }
            };
        } catch (e) {
            console.warn('BroadcastChannel not supported');
        }

        const storageListener = (e: StorageEvent) => {
            if (e.key === 'safcha-logout' && e.newValue) {
                handleLogout();
            }
        };

        window.addEventListener('storage', storageListener);

        return () => {
            if (broadcast) broadcast.close();
            window.removeEventListener('storage', storageListener);
        };
    }, [handleLogout, isClient]);
}

export function broadcastLogout() {
    if (typeof window === 'undefined') return;
    
    try {
        const broadcast = new BroadcastChannel(SESSION_CHANNEL);
        broadcast.postMessage('logout');
        broadcast.close();
    } catch (e) {
        console.warn('BroadcastChannel not supported');
    }
    
    try {
        localStorage.setItem('safcha-logout', Date.now().toString());
    } catch (e) {
        // Ignore
    }
}
