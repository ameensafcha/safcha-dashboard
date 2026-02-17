
'use server'

import { prisma } from '@/lib/prisma';
import { loginSession, logoutSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
// import { v4 as uuidv4 } from 'uuid'; // Standard uuid is not installed, I'll use crypto.randomUUID() for simplicity if node > 16

// Or just use a simple random string generator since UUID package isn't installed.
// Wait, prisma usually handles ID generation if configured to default(uuid()), let me check schema.
// Schema has @id but no @default(uuid()). I need to generate IDs myself or update schema.
// I'll update schema to use @default(uuid()) which is better practice, BUT user said "wait for me" earlier.
// I will generate ID manually using crypto.randomUUID().

export async function signup(prevState: any, formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
        return { error: 'Please fill in all fields' };
    }

    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { error: 'User already exists' };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Get default role (admin for now as discussed)
        const role = await prisma.role.findFirst({
            where: { name: 'admin' } // Case sensitive check? The output showed 'admin'.
        });

        if (!role) {
            return { error: 'Default role not found. Please contact administrator.' };
        }

        // Create user
        const user = await prisma.user.create({
            data: {
                id: crypto.randomUUID(),
                name,
                email,
                password: hashedPassword,
                roleId: role.id,
            },
        });

        // Create session
        await loginSession(user.id);

    } catch (error) {
        console.error('Signup error:', error);
        return { error: 'Something went wrong.' };
    }

    redirect('/dashboard');
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
            console.log('Login failed: User not found:', email);
            return { error: 'Invalid credentials' };
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
            console.log('Login failed: Password mismatch for:', email);
            return { error: 'Invalid credentials' };
        }

        console.log('Login successful for:', email);
        await loginSession(user.id);

    } catch (error) {
        console.error('Login error:', error);
        return { error: 'Something went wrong.' };
    }

    redirect('/dashboard');
}

export async function logout() {
    await logoutSession();
    redirect('/login');
}
