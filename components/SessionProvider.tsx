'use client';

import { useSessionSync } from './SessionSync';

export default function SessionProvider({ children }: { children: React.ReactNode }) {
    useSessionSync();
    return <>{children}</>;
}
