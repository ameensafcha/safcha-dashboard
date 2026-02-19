# AGENTS.md - Developer Guidelines for SAFCHA Dashboard

## Build & Development Commands

### Running the Application
```bash
cd sa-db
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Type Checking
```bash
cd sa-db
npx tsc --noEmit    # Run TypeScript type checking
```

### Database Commands
```bash
cd sa-db
npx prisma studio    # Open Prisma database GUI
npx prisma db seed   # Run database seed file
npx prisma generate  # Generate Prisma client
npx prisma migrate   # Run database migrations
```

### Testing
This project does not have a dedicated test framework configured. For manual testing:
- Use browser developer tools
- Test functionality in development mode (`npm run dev`)
- Use Next.js error boundaries to catch rendering errors

---

## Code Style Guidelines

### TypeScript
- Use explicit types for function parameters and return types when not obvious
- Use `any` sparingly - prefer proper typing or `unknown`
- Example:
```typescript
// Good
function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

// Avoid unless necessary
function getData(data: any): any { ... }
```

### Naming Conventions
- **Components**: PascalCase (e.g., `SidebarComponent`, `UserProfile`)
- **Files**: camelCase with descriptive names (e.g., `userActions.ts`, `authUtils.ts`)
- **Variables/Functions**: camelCase (e.g., `userName`, `getUserByEmail`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **React Components**: Use `.tsx` extension for components with JSX
- **Types/Interfaces**: PascalCase (e.g., `UserRole`, `ModulePermission`)

### Imports
Order imports as follows:
1. Next.js/React imports
2. External libraries (lucide-react, zod, etc.)
3. Internal components (@/components/...)
4. Internal actions/lib (@/app/actions/..., @/lib/...)
5. Relative imports

```typescript
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { createUser, updateUser } from "@/app/actions/users";
import { prisma } from "@/lib/prisma";
import { hasAdminAccess } from "./utils";
```

### Component Structure
Follow this structure for React components:
```typescript
'use client'; // Only for client components

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

// Type definitions
type Props = {
  title: string;
  onSubmit: (data: FormData) => void;
};

// Main component
export function MyComponent({ title, onSubmit }: Props) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // initialization logic
  }, []);

  const handleClick = () => {
    // event handlers
  };

  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

---

## State Management (Zustand)

### Creating a New Store
All Zustand stores are located in `lib/stores/`. Types are centralized in `lib/types.ts`.

```typescript
// lib/stores/example-store.ts
import { create } from 'zustand';
import type { SomeType } from '@/lib/types';

interface ExampleState {
  items: SomeType[];
  selectedItem: SomeType | null;
  isLoading: boolean;
  error: string | null;
}

interface ExampleActions {
  setItems: (items: SomeType[]) => void;
  setSelectedItem: (item: SomeType | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

type ExampleStore = ExampleState & ExampleActions;

const initialState: ExampleState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
};

export const useExampleStore = create<ExampleStore>((set) => ({
  ...initialState,
  
  setItems: (items) => set({ items }),
  setSelectedItem: (item) => set({ selectedItem: item }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clear: () => set(initialState),
}));
```

### Export from Index
Always export stores from `lib/stores/index.ts`:
```typescript
export { useExampleStore } from './example-store';
export type { SomeType } from '@/lib/types';
```

---

## Server Actions & Permissions

### Authorization Pattern
All server actions must check permissions. Use the `checkModulePermission` helper:

```typescript
import { getCurrentUser, checkModulePermission, hasAdminAccess } from '@/lib/auth';

const MODULE_SLUG = 'products'; // module slug from database

export async function createProduct(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: 'Unauthorized' };

  // Check permission - admins bypass this check
  const hasPermission = await checkModulePermission(
    currentUser.roleId, 
    MODULE_SLUG, 
    'canCreate'
  );
  if (!hasPermission && !hasAdminAccess(currentUser)) {
    return { error: 'Permission denied' };
  }

  // Proceed with operation
}
```

### Permission Types
- `canCreate` - Add new records
- `canRead` - View records
- `canUpdate` - Edit existing records
- `canDelete` - Remove records

---

## Error Handling
- Always wrap async operations in try-catch
- Return proper error objects from server actions
- Display user-friendly error messages with toast notifications
```typescript
try {
  const result = await someAction();
  if (!result.success) {
    toast({ title: "Error", description: result.error });
  }
} catch (error) {
  console.error("Unexpected error:", error);
  toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
}
```

---

## Database Operations (Prisma)

### Types Import
Import types from `lib/types.ts` instead of redefining:
```typescript
// Good - use centralized types
import type { User, Product, Module } from '@/lib/types';

// Avoid redefining types
```

### Queries
- Always use transactions for multiple related operations
- Include proper error handling
- Use proper select/include for related data
```typescript
// Good - fetching related data
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    Role: {
      include: {
        RolePermission: {
          include: { Module: true }
        }
      }
    }
  }
});

// Avoid N+1 queries - use include instead of separate queries
```

---

## Performance Guidelines

### Caching Strategy
Use appropriate caching for each page type:

| Page Type | Caching Strategy |
|-----------|------------------|
| Public (login, signup) | `export const dynamic = 'force-static'` |
| Auth pages (dashboard) | `export const revalidate = 60` |
| Real-time data | Keep default (no cache) |

```typescript
// Public page - fully cached
export const dynamic = 'force-static';

// Auth page - cache for 60 seconds
export const revalidate = 60;
```

### Layout Performance
- `app/layout.tsx` should remain dynamic (`force-dynamic`) for auth state
- Use `revalidatePath()` after mutations to refresh cached data
- Avoid fetching data in layout when possible

---

## Tailwind CSS
- Use shadcn/ui components when available
- Follow existing class patterns in components
- Use `cn()` utility for conditional classes
```typescript
import { cn } from "@/lib/utils";

// Good
className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === 'outline' && "outline-variant"
)}
```

---

## Server Actions Best Practices
- Always include proper return types
- Validate input with Zod schemas
- Handle authorization checks
```typescript
'use server';

import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function createUser(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Unauthorized" };

  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
  };

  const validated = createUserSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.message };
  }

  // Proceed with validated.data
}
```

---

## File Organization
- Server actions go in `@/app/actions/`
- Utility functions go in `@/lib/`
- Zustand stores go in `@/lib/stores/`
- Types go in `@/lib/types.ts`
- UI components go in `@/components/ui/` (shadcn) or `@/components/`
- Page components go in `@/app/[route]/page.tsx`
- Client components have `'use client'` at the top

---

## Database Schema (Prisma)
- Run `npx prisma generate` after schema changes
- Run `npx prisma db seed` to populate initial data
- Use meaningful model names and relationships
- Always add indexes for frequently queried fields

---

## Project Structure

```
sa-db/
├── app/                    # Next.js App Router
│   ├── actions/           # Server actions
│   ├── admindashboard/    # Admin module pages
│   ├── login/             # Authentication
│   └── [slug]/            # Dynamic routes
├── components/            # React components
│   ├── admin/             # Admin-specific components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utilities
│   ├── stores/            # Zustand state management
│   ├── types.ts           # Centralized types
│   ├── auth.ts            # Authentication logic
│   ├── icons.ts           # Icon mappings
│   └── prisma.ts          # Prisma client
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
└── public/                # Static assets
```

---

## Common Tasks

### Adding a New Module to Sidebar
1. Add module to `prisma/seed.ts` in the correct category
2. Run `npx prisma db seed`
3. The module will automatically appear based on user permissions

### Creating a New Role
1. Go to Admin > Roles
2. Click "Add Role" button
3. Set permissions using the permission matrix

### Modifying Permissions
- Role permissions are stored in `RolePermission` table
- Use the Roles page to modify permissions
- Permissions cascade from parent to child modules

### Adding a New Store
1. Create file in `lib/stores/new-feature-store.ts`
2. Add types to `lib/types.ts` if needed
3. Export from `lib/stores/index.ts`
4. Use in components

### Environment Variables
- Copy `.env.example` to `.env` for local development
- Never commit secrets to version control
- Required variables: `DATABASE_URL`, `SESSION_SECRET`

### Security Guidelines
- Always validate user input with Zod schemas
- Check authorization before database operations
- Never expose sensitive data in API responses or logs
- Use server actions for all database mutations
- Sanitize theme/customization values from database before using in CSS classes
