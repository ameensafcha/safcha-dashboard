
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { redirect } from 'next/navigation';


const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
    throw new Error("SESSION_SECRET environment variable is required. Please set it in your .env file.");
}
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
                },
                UserPermission: {
                    include: {
                        Module: true
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

export function hasAdminAccess(user: any): boolean {
    if (!user || !user.Role) return false;

    if (user.Role.name === 'admin') return true;

    const permissions = user.Role.RolePermission || [];

    const adminPermission = permissions.find((p: any) =>
        p.canCreate === true &&
        p.canUpdate === true &&
        p.canDelete === true &&
        p.canRead === true
    );

    return !!adminPermission;
}

export function hasModulePermission(user: any, moduleId: string, permission: 'canRead' | 'canCreate' | 'canUpdate' | 'canDelete'): boolean {
    if (!user) return false;

    const rolePermissions = user.Role?.RolePermission || [];
    const userPermissions = user.UserPermission || [];

    const rolePerm = rolePermissions.find((p: any) => p.moduleId === moduleId && p[permission] === true);
    if (rolePerm) return true;

    const userPerm = userPermissions.find((p: any) => p.moduleId === moduleId && p[permission] === true);
    return !!userPerm;
}
