
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Roles ---');
    const roles = await prisma.role.findMany();
    console.log(roles);

    console.log('\n--- Modules ---');
    const modules = await prisma.module.findMany();
    console.log(modules);

    console.log('\n--- User (First) ---');
    const user = await prisma.user.findFirst({
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
    if (user) {
        console.log(`User: ${user.name}, Role: ${user.Role.name}`);
        console.log('Permissions:', user.Role.RolePermission.map(rp => rp.Module.name));
    } else {
        console.log('No user found.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
