
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('session')?.value;
    const token = session ? await decrypt(session) : null;

    const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup');

    if (!token && !isAuthPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token && isAuthPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
