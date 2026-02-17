
'use server'

import { prisma } from '@/lib/prisma';
import { loginSession, logoutSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function signup(prevState: any, formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
        return { error: 'Please fill in all fields' };
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { error: 'User already exists' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let role = await prisma.role.findFirst({
            where: { name: 'guest' }
        });

        if (!role) {
            role = await prisma.role.create({
                data: {
                    id: crypto.randomUUID(),
                    name: 'guest',
                }
            });
        }

        const user = await prisma.user.create({
            data: {
                id: crypto.randomUUID(),
                name,
                email,
                password: hashedPassword,
                roleId: role.id,
            },
        });

        await loginSession(user.id);

        return { success: true, redirect: '/dashboard' };

    } catch (error) {
        console.error('Signup error:', error);
        return { error: 'Something went wrong.' };
    }
}

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Please fill in all fields' };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return { error: 'Invalid credentials' };
        }

        if (!user.isActive) {
            return { error: 'Your account is deactivated. Talk to CEO.' };
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
            return { error: 'Invalid credentials' };
        }

        await loginSession(user.id);

        return { success: true, redirect: '/dashboard' };

    } catch (error) {
        console.error('Login error:', error);
        return { error: 'Something went wrong.' };
    }
}

export async function logout() {
    await logoutSession();
    return { success: true, redirect: '/login' };
}
