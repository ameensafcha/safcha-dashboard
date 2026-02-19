# AGENTS.md - Developer Guidelines for SAFCHA Dashboard

## Build & Development Commands

### Running the Application
```bash
cd sa-db
npm run dev          # Start development server
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

### Error Handling
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

### Database Operations (Prisma)
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

### Tailwind CSS
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

### Server Actions
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

### File Organization
- Server actions go in `@/app/actions/`
- Utility functions go in `@/lib/`
- UI components go in `@/components/ui/` (shadcn) or `@/components/`
- Page components go in `@/app/[route]/page.tsx`
- Client components have `'use client'` at the top

### Database Schema (Prisma)
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
│   ├── login/            # Authentication
│   └── [slug]/          # Dynamic routes
├── components/            # React components
│   ├── admin/           # Admin-specific components
│   └── ui/             # shadcn/ui components
├── lib/                  # Utilities
│   ├── auth.ts         # Authentication logic
│   ├── icons.ts        # Icon mappings
│   └── prisma.ts      # Prisma client
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── seed.ts        # Seed data
└── public/             # Static assets
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

### Environment Variables
- Copy `.env.example` to `.env` for local development
- Never commit secrets to version control
- Required variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

### Security Guidelines
- Always validate user input with Zod schemas
- Check authorization before database operations
- Never expose sensitive data in API responses or logs
- Use server actions for all database mutations
- Sanitize theme/customization values from database before using in CSS classes
