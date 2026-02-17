import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin role if not exists
  let adminRole = await prisma.role.findFirst({
    where: { name: 'admin' }
  })

  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        id: 'admin-role-id',
        name: 'admin',
      }
    })
    console.log('Created admin role')
  }

  // Create guest role if not exists
  let guestRole = await prisma.role.findFirst({
    where: { name: 'guest' }
  })

  if (!guestRole) {
    guestRole = await prisma.role.create({
      data: {
        id: 'guest-role-id',
        name: 'guest',
      }
    })
    console.log('Created guest role')
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('123456', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@mail.com' },
    update: {},
    create: {
      id: 'admin-user-id',
      name: 'Admin',
      email: 'admin@mail.com',
      password: hashedPassword,
      roleId: adminRole.id,
      isActive: true,
    }
  })

  console.log('Created admin user:', adminUser.email)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
