import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get admin role
  const adminRole = await prisma.role.findFirst({
    where: { name: 'admin' }
  })

  if (!adminRole) {
    console.log('Admin role not found')
    return
  }

  // Get all modules
  const modules = await prisma.module.findMany()

  // Create full permissions for admin on all modules
  for (const module of modules) {
    const existingPerm = await prisma.rolePermission.findFirst({
      where: {
        roleId: adminRole.id,
        moduleId: module.id
      }
    })

    if (!existingPerm) {
      await prisma.rolePermission.create({
        data: {
          id: `perm-${module.id}-${adminRole.id}`,
          roleId: adminRole.id,
          moduleId: module.id,
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
        }
      })
      console.log(`Created permission for module: ${module.name}`)
    }
  }

  console.log('Done! Admin now has full permissions.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
  })
