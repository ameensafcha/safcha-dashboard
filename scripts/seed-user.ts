
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });

    // Create User Role if not exists
    let userRole = await prisma.role.findUnique({ where: { name: 'user' } });
    if (!userRole) {
        userRole = await prisma.role.create({
            data: {
                id: 'role-user',
                name: 'user',
            }
        });
        console.log('Created user role');
    }

    // Get modules
    const dashboardModule = await prisma.module.findFirst({ where: { slug: 'dashboard' } });
    const settingsModule = await prisma.module.findFirst({ where: { slug: 'settings' } }); // Assuming settings exists or used generic
    // If settings doesn't exist, let's create it
    let settings = settingsModule;
    if (!settings) {
        settings = await prisma.module.create({
            data: {
                id: 'mod-settings',
                name: 'Settings',
                slug: 'settings',
                type: 'PAGE',
                order: 99,
                isActive: true
            }
        });
        console.log('Created Settings module');
    }

    // Assign permissions to User Role (Only Dashboard and Settings, no Sales/Orders)
    if (dashboardModule) {
        await prisma.rolePermission.upsert({
            where: { roleId_moduleId: { roleId: userRole.id, moduleId: dashboardModule.id } },
            update: {},
            create: {
                id: 'rp-user-dashboard',
                roleId: userRole.id,
                moduleId: dashboardModule.id,
                canRead: true
            }
        });
    }

    if (settings) {
        await prisma.rolePermission.upsert({
            where: { roleId_moduleId: { roleId: userRole.id, moduleId: settings.id } },
            update: {},
            create: {
                id: 'rp-user-settings',
                roleId: userRole.id,
                moduleId: settings.id,
                canRead: true
            }
        });
    }

    // Create a Demo User
    const email = 'user@safcha.com';
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!existingUser) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        await prisma.user.create({
            data: {
                id: 'user-id-123',
                name: 'Demo User',
                email,
                password: hashedPassword,
                roleId: userRole.id
            }
        });
        console.log(`Created user: ${email} with password: password123`);
    } else {
        console.log(`User ${email} already exists.`);
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
