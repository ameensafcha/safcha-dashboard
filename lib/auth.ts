
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { redirect } from 'next/navigation';

const secretKey = process.env.SESSION_SECRET || 'secret-key-change-me';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h') // Session expires in 24 hours
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function getSession() {
    const session = (await cookies()).get('session')?.value;
    if (!session) return null;
    return await decrypt(session);
}

export async function getCurrentUser() {
    const session = await getSession();

    if (!session || !session.userId) {
        return null;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            include: {
                Role: {
                    include: {
                        RolePermission: {
                            include: {
                                Module: true
                            }
                        }
                    }
                }
            }
        });

        return user;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

export async function loginSession(userId: string) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const session = await encrypt({ userId, expires });

    (await cookies()).set('session', session, {
        expires,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
}

export async function logoutSession() {
    (await cookies()).delete('session');
}
