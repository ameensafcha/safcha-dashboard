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

  // Create hardcoded modules
  const modulesData = [
    // Overview
    { id: 'mod-overview', name: 'Overview', slug: 'overview', type: 'FOLDER' as const, icon: 'LayoutDashboard', order: 1 },
    { id: 'mod-overview-ceo', name: 'CEO Dashboard', slug: 'overview/ceo-dashboard', type: 'PAGE' as const, icon: 'LayoutDashboard', order: 1, parentId: 'mod-overview' },
    { id: 'mod-overview-company', name: 'Company Profile', slug: 'overview/company-profile', type: 'PAGE' as const, icon: 'Building', order: 2, parentId: 'mod-overview' },

    // Sales & Orders
    { id: 'mod-sales', name: 'Sales & Orders', slug: 'sales-orders', type: 'FOLDER' as const, icon: 'ShoppingCart', order: 2 },
    { id: 'mod-sales-orders', name: 'Orders', slug: 'sales-orders/orders', type: 'PAGE' as const, icon: 'ShoppingCart', order: 1, parentId: 'mod-sales' },
    { id: 'mod-sales-clients', name: 'Clients', slug: 'sales-orders/clients', type: 'PAGE' as const, icon: 'User', order: 2, parentId: 'mod-sales' },
    { id: 'mod-sales-wholesale', name: 'Wholesale', slug: 'sales-orders/wholesale', type: 'PAGE' as const, icon: 'Truck', order: 3, parentId: 'mod-sales' },
    { id: 'mod-sales-export', name: 'Export', slug: 'sales-orders/export', type: 'PAGE' as const, icon: 'Plane', order: 4, parentId: 'mod-sales' },
    { id: 'mod-sales-invoices', name: 'Invoices', slug: 'sales-orders/invoices', type: 'PAGE' as const, icon: 'FileText', order: 5, parentId: 'mod-sales' },

    // Inventory
    { id: 'mod-inventory', name: 'Inventory', slug: 'inventory', type: 'FOLDER' as const, icon: 'Package', order: 3 },
    { id: 'mod-inventory-raw', name: 'Raw Materials', slug: 'inventory/raw-materials', type: 'PAGE' as const, icon: 'Package', order: 1, parentId: 'mod-inventory' },
    { id: 'mod-inventory-finished', name: 'Finished Products', slug: 'inventory/finished-products', type: 'PAGE' as const, icon: 'Boxes', order: 2, parentId: 'mod-inventory' },
    { id: 'mod-inventory-movements', name: 'Stock Movements', slug: 'inventory/stock-movements', type: 'PAGE' as const, icon: 'ArrowRightLeft', order: 3, parentId: 'mod-inventory' },

    // Production
    { id: 'mod-production', name: 'Production', slug: 'production', type: 'FOLDER' as const, icon: 'Factory', order: 4 },
    { id: 'mod-production-batches', name: 'Production Batches', slug: 'production/batches', type: 'PAGE' as const, icon: 'Factory', order: 1, parentId: 'mod-production' },
    { id: 'mod-production-qc', name: 'Quality Control', slug: 'production/quality-control', type: 'PAGE' as const, icon: 'CheckCircle', order: 2, parentId: 'mod-production' },
    { id: 'mod-production-rnd', name: 'R&D', slug: 'production/rnd', type: 'PAGE' as const, icon: 'FlaskConical', order: 3, parentId: 'mod-production' },

    // Products
    { id: 'mod-products', name: 'Products', slug: 'products', type: 'FOLDER' as const, icon: 'Coffee', order: 5 },
    { id: 'mod-products-catalog', name: 'Product Catalog', slug: 'products/catalog', type: 'PAGE' as const, icon: 'Coffee', order: 1, parentId: 'mod-products' },
    { id: 'mod-products-pricing', name: 'Pricing Tiers', slug: 'products/pricing', type: 'PAGE' as const, icon: 'Tag', order: 2, parentId: 'mod-products' },
    { id: 'mod-products-formulations', name: 'Formulations', slug: 'products/formulations', type: 'PAGE' as const, icon: 'Beaker', order: 3, parentId: 'mod-products' },

    // Finance
    { id: 'mod-finance', name: 'Finance', slug: 'finance', type: 'FOLDER' as const, icon: 'DollarSign', order: 6 },
    { id: 'mod-finance-revenue', name: 'Revenue', slug: 'finance/revenue', type: 'PAGE' as const, icon: 'TrendingUp', order: 1, parentId: 'mod-finance' },
    { id: 'mod-finance-expenses', name: 'Expenses', slug: 'finance/expenses', type: 'PAGE' as const, icon: 'CreditCard', order: 2, parentId: 'mod-finance' },
    { id: 'mod-finance-pnl', name: 'P&L', slug: 'finance/pnl', type: 'PAGE' as const, icon: 'BarChart', order: 3, parentId: 'mod-finance' },
    { id: 'mod-finance-statements', name: 'Financial Statements', slug: 'finance/statements', type: 'PAGE' as const, icon: 'FileText', order: 4, parentId: 'mod-finance' },
    { id: 'mod-finance-subscriptions', name: 'Subscriptions', slug: 'finance/subscriptions', type: 'PAGE' as const, icon: 'Repeat', order: 5, parentId: 'mod-finance' },

    // CRM
    { id: 'mod-crm', name: 'CRM', slug: 'crm', type: 'FOLDER' as const, icon: 'Users', order: 7 },
    { id: 'mod-crm-contacts', name: 'Contacts', slug: 'crm/contacts', type: 'PAGE' as const, icon: 'User', order: 1, parentId: 'mod-crm' },
    { id: 'mod-crm-companies', name: 'Companies', slug: 'crm/companies', type: 'PAGE' as const, icon: 'Building', order: 2, parentId: 'mod-crm' },
    { id: 'mod-crm-deals', name: 'Deals Pipeline', slug: 'crm/deals-pipeline', type: 'PAGE' as const, icon: 'GitBranch', order: 3, parentId: 'mod-crm' },
    { id: 'mod-crm-leads', name: 'Event Leads', slug: 'crm/event-leads', type: 'PAGE' as const, icon: 'Bell', order: 4, parentId: 'mod-crm' },

    // Marketing
    { id: 'mod-marketing', name: 'Marketing', slug: 'marketing', type: 'FOLDER' as const, icon: 'Megaphone', order: 8 },
    { id: 'mod-marketing-campaigns', name: 'Campaigns', slug: 'marketing/campaigns', type: 'PAGE' as const, icon: 'Megaphone', order: 1, parentId: 'mod-marketing' },
    { id: 'mod-marketing-ads', name: 'Ad Budget & ROI', slug: 'marketing/ad-budget', type: 'PAGE' as const, icon: 'DollarSign', order: 2, parentId: 'mod-marketing' },
    { id: 'mod-marketing-content', name: 'Content Calendar', slug: 'marketing/content-calendar', type: 'PAGE' as const, icon: 'Calendar', order: 3, parentId: 'mod-marketing' },

    // Events & Expos
    { id: 'mod-events', name: 'Events & Expos', slug: 'events', type: 'FOLDER' as const, icon: 'Calendar', order: 9 },
    { id: 'mod-events-calendar', name: 'Event Calendar', slug: 'events/event-calendar', type: 'PAGE' as const, icon: 'Calendar', order: 1, parentId: 'mod-events' },
    { id: 'mod-events-booth', name: 'Booth Planning', slug: 'events/booth-planning', type: 'PAGE' as const, icon: 'Layout', order: 2, parentId: 'mod-events' },
    { id: 'mod-events-inventory', name: 'Event Inventory', slug: 'events/event-inventory', type: 'PAGE' as const, icon: 'Package', order: 3, parentId: 'mod-events' },

    // Team & Tasks
    { id: 'mod-team', name: 'Team & Tasks', slug: 'team', type: 'FOLDER' as const, icon: 'CheckSquare', order: 10 },
    { id: 'mod-team-tasks', name: 'Task Board', slug: 'team/task-board', type: 'PAGE' as const, icon: 'CheckSquare', order: 1, parentId: 'mod-team' },
    { id: 'mod-team-projects', name: 'Projects', slug: 'team/projects', type: 'PAGE' as const, icon: 'FolderKanban', order: 2, parentId: 'mod-team' },
    { id: 'mod-team-directory', name: 'Team Directory', slug: 'team/team-directory', type: 'PAGE' as const, icon: 'Users', order: 3, parentId: 'mod-team' },
    { id: 'mod-team-onboarding', name: 'Onboarding', slug: 'team/onboarding', type: 'PAGE' as const, icon: 'UserPlus', order: 4, parentId: 'mod-team' },

    // Documents
    { id: 'mod-documents', name: 'Documents', slug: 'documents', type: 'FOLDER' as const, icon: 'FileText', order: 11 },
    { id: 'mod-docs-legal', name: 'Legal Docs', slug: 'documents/legal-docs', type: 'PAGE' as const, icon: 'Scale', order: 1, parentId: 'mod-documents' },
    { id: 'mod-docs-contracts', name: 'Contracts', slug: 'documents/contracts', type: 'PAGE' as const, icon: 'FileSignature', order: 2, parentId: 'mod-documents' },
    { id: 'mod-docs-sops', name: 'SOPs', slug: 'documents/sops', type: 'PAGE' as const, icon: 'BookOpen', order: 3, parentId: 'mod-documents' },
    { id: 'mod-docs-templates', name: 'Templates', slug: 'documents/templates', type: 'PAGE' as const, icon: 'File', order: 4, parentId: 'mod-documents' },

    // Strategy
    { id: 'mod-strategy', name: 'Strategy', slug: 'strategy', type: 'FOLDER' as const, icon: 'Target', order: 12 },
    { id: 'mod-strategy-plan', name: 'Business Plan', slug: 'strategy/business-plan', type: 'PAGE' as const, icon: 'Briefcase', order: 1, parentId: 'mod-strategy' },
    { id: 'mod-strategy-okrs', name: 'OKRs', slug: 'strategy/okrs', type: 'PAGE' as const, icon: 'Target', order: 2, parentId: 'mod-strategy' },
    { id: 'mod-strategy-goals', name: 'Goals', slug: 'strategy/goals', type: 'PAGE' as const, icon: 'Flag', order: 3, parentId: 'mod-strategy' },
    { id: 'mod-strategy-roadmap', name: 'Roadmap', slug: 'strategy/roadmap', type: 'PAGE' as const, icon: 'Map', order: 4, parentId: 'mod-strategy' },
  ]

  // Define system module IDs that cannot be deleted
  const systemModuleIds = [
    'mod-overview', 'mod-overview-ceo', 'mod-overview-company',
    'mod-sales', 'mod-sales-orders', 'mod-sales-clients', 'mod-sales-wholesale', 'mod-sales-export', 'mod-sales-invoices',
    'mod-inventory', 'mod-inventory-raw', 'mod-inventory-finished', 'mod-inventory-movements',
    'mod-production', 'mod-production-batches', 'mod-production-qc', 'mod-production-rnd',
    'mod-products', 'mod-products-catalog', 'mod-products-pricing', 'mod-products-formulations',
    'mod-finance', 'mod-finance-revenue', 'mod-finance-expenses', 'mod-finance-pnl', 'mod-finance-statements', 'mod-finance-subscriptions',
    'mod-crm', 'mod-crm-contacts', 'mod-crm-companies', 'mod-crm-deals', 'mod-crm-leads',
    'mod-marketing', 'mod-marketing-campaigns', 'mod-marketing-ads', 'mod-marketing-content',
    'mod-events', 'mod-events-calendar', 'mod-events-booth', 'mod-events-inventory',
    'mod-team', 'mod-team-tasks', 'mod-team-projects', 'mod-team-directory', 'mod-team-onboarding',
    'mod-documents', 'mod-docs-legal', 'mod-docs-contracts', 'mod-docs-sops', 'mod-docs-templates',
    'mod-strategy', 'mod-strategy-plan', 'mod-strategy-okrs', 'mod-strategy-goals', 'mod-strategy-roadmap'
  ]

  for (const mod of modulesData) {
    await prisma.module.upsert({
      where: { id: mod.id },
      update: {},
      create: mod
    })
    console.log(`Created module: ${mod.name}`)
  }

  // Give admin full permissions to all modules
  const allModules = await prisma.module.findMany()
  for (const mod of allModules) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_moduleId: {
          roleId: adminRole.id,
          moduleId: mod.id
        }
      },
      update: {},
      create: {
        id: `rp-admin-${mod.id}`,
        roleId: adminRole.id,
        moduleId: mod.id,
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true
      }
    })
  }
  console.log('Admin permissions set for all modules')

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
