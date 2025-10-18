---
applyTo: "**/*.ts,**/*.tsx"
---
# TypeScript and React Coding Standards - MercaFlow

Apply the [general coding guidelines](./copilot-standards-general.md) to all code.

## TypeScript Guidelines

### 1. Type Definitions

#### Use Proper Types
```typescript
// ✅ Good
interface Product {
  id: string;
  name: string;
  price: number;
  tenant_id: string;
}

// ❌ Bad
interface Product {
  id: any;
  name: any;
  price: any;
}
```

#### Prefer Interfaces for Objects
```typescript
// ✅ Good - Use interface for data structures
interface User {
  id: string;
  email: string;
  role: "super_admin" | "admin" | "user";
}

// ✅ Good - Use type for unions and primitives
type UserRole = "super_admin" | "admin" | "user";
type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

// ❌ Bad - Don't use type when interface is more appropriate
type User = {
  id: string;
  email: string;
};
```

#### Use Const Assertions
```typescript
// ✅ Good
const CACHE_TTL = {
  SHORT: 5 * 60,
  MEDIUM: 30 * 60,
  LONG: 60 * 60,
} as const;

// ❌ Bad
const CACHE_TTL = {
  SHORT: 5 * 60,
  MEDIUM: 30 * 60,
  LONG: 60 * 60,
};
```

### 2. Null Safety

#### Use Optional Chaining and Nullish Coalescing
```typescript
// ✅ Good
const userName = user?.profile?.name ?? "Usuário";
const products = response?.data ?? [];

// ❌ Bad
const userName = user && user.profile && user.profile.name ? user.profile.name : "Usuário";
```

#### Define Optional Properties Correctly
```typescript
// ✅ Good
interface MLIntegration {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken?: string; // Optional
  expiresAt: number | null; // Can be null
}

// ❌ Bad - Don't use undefined explicitly
interface MLIntegration {
  refreshToken: string | undefined;
}
```

### 3. Function Types

#### Use Explicit Return Types
```typescript
// ✅ Good
async function getProducts(tenantId: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("tenant_id", tenantId);
  
  if (error) throw error;
  return data ?? [];
}

// ❌ Bad - Implicit return type
async function getProducts(tenantId: string) {
  // ...
}
```

#### Use Type Guards
```typescript
// ✅ Good
function isMLError(error: unknown): error is { message: string; status: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "status" in error
  );
}

// Usage
try {
  await mlApiCall();
} catch (error) {
  if (isMLError(error)) {
    logger.error("ML API error", { status: error.status, message: error.message });
  }
}
```

### 4. Generics

#### Use Generics for Reusable Functions
```typescript
// ✅ Good
async function cacheGet<T>(key: string): Promise<T | null> {
  const cached = await redis.get(key);
  if (!cached) return null;
  return JSON.parse(cached) as T;
}

// Usage
const products = await cacheGet<Product[]>("products:123");
```

#### Constrain Generics When Needed
```typescript
// ✅ Good
interface HasTenantId {
  tenant_id: string;
}

async function validateTenantResource<T extends HasTenantId>(
  resource: T,
  currentTenantId: string
): Promise<boolean> {
  return resource.tenant_id === currentTenantId;
}
```

### 5. Enums vs Union Types

#### Prefer Union Types
```typescript
// ✅ Good - Union types are more flexible
type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

// ❌ Avoid - Enums generate extra runtime code
enum OrderStatus {
  Pending = "pending",
  Paid = "paid",
  Shipped = "shipped",
}
```

### 6. Utility Types

#### Use Built-in Utility Types
```typescript
// ✅ Good
type PartialProduct = Partial<Product>; // All properties optional
type ProductKeys = keyof Product; // Union of all keys
type ProductName = Pick<Product, "name">; // Select specific properties
type ProductWithoutId = Omit<Product, "id">; // Exclude properties

// For API updates
type ProductUpdate = Partial<Omit<Product, "id" | "tenant_id" | "created_at">>;
```

---

## React Guidelines

### 1. Component Structure

#### Functional Components with TypeScript
```typescript
// ✅ Good - Explicit props interface
interface ProductCardProps {
  product: Product;
  onEdit?: (productId: string) => void;
  className?: string;
}

export function ProductCard({ product, onEdit, className }: ProductCardProps) {
  return (
    <div className={className}>
      <h3>{product.name}</h3>
      {onEdit && (
        <button onClick={() => onEdit(product.id)}>Editar</button>
      )}
    </div>
  );
}

// ❌ Bad - Using React.FC (deprecated pattern)
export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // ...
};
```

#### Server Components (Default in Next.js 15)
```typescript
// ✅ Good - Server Component (no "use client")
import { getCurrentUser } from "@/utils/supabase/server";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }
  
  return <div>Olá, {user.email}</div>;
}
```

#### Client Components (When Needed)
```typescript
// ✅ Good - Client Component with hooks
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CounterProps {
  initialCount?: number;
}

export function Counter({ initialCount = 0 }: CounterProps) {
  const [count, setCount] = useState(initialCount);
  
  return (
    <div>
      <p>Contagem: {count}</p>
      <Button onClick={() => setCount(count + 1)}>
        Incrementar
      </Button>
    </div>
  );
}
```

### 2. Hooks Usage

#### Follow Hooks Rules
```typescript
// ✅ Good
function useProducts(tenantId: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const data = await getProducts(tenantId);
        setProducts(data);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, [tenantId]); // Dependencies array
  
  return { products, loading };
}

// ❌ Bad - Conditional hooks
function useProducts(tenantId?: string) {
  if (!tenantId) return { products: [], loading: false };
  
  // This violates hooks rules
  const [products, setProducts] = useState<Product[]>([]);
}
```

#### Custom Hooks Naming
```typescript
// ✅ Good - Start with "use"
function useAuth() { /* ... */ }
function useCurrentTenant() { /* ... */ }
function useMLIntegration() { /* ... */ }

// ❌ Bad
function getAuth() { /* ... */ }
function currentTenant() { /* ... */ }
```

### 3. Component Props

#### Destructure Props
```typescript
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function CustomButton({ label, onClick, disabled = false }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
}

// ❌ Bad - Using props object
export function CustomButton(props: ButtonProps) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

#### Spread Remaining Props
```typescript
// ✅ Good - For wrapper components
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <div>
      <label>{label}</label>
      <input {...props} />
      {error && <span className="error">{error}</span>}
    </div>
  );
}
```

### 4. Event Handlers

#### Type Events Properly
```typescript
// ✅ Good
function SearchForm() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
    </form>
  );
}
```

#### Use Callbacks for Child Events
```typescript
// ✅ Good
interface ProductListProps {
  products: Product[];
  onProductClick: (productId: string) => void;
}

export function ProductList({ products, onProductClick }: ProductListProps) {
  return (
    <div>
      {products.map((product) => (
        <button key={product.id} onClick={() => onProductClick(product.id)}>
          {product.name}
        </button>
      ))}
    </div>
  );
}
```

### 5. Styling with Tailwind

#### Use Tailwind Classes
```typescript
// ✅ Good - Tailwind with conditional classes
import { cn } from "@/lib/utils";

interface CardProps {
  title: string;
  featured?: boolean;
  className?: string;
}

export function Card({ title, featured = false, className }: CardProps) {
  return (
    <div className={cn(
      "rounded-lg border p-4",
      featured && "border-blue-500 bg-blue-50",
      className
    )}>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  );
}
```

#### Component Variants with CVA
```typescript
// ✅ Good - For complex variants
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium",
  {
    variants: {
      variant: {
        default: "bg-blue-500 text-white hover:bg-blue-600",
        outline: "border border-gray-300 bg-white hover:bg-gray-50",
        ghost: "hover:bg-gray-100",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
}

export function Button({ variant, size, className, children, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </button>
  );
}
```

### 6. Data Fetching Patterns

#### Server Components (Preferred)
```typescript
// ✅ Good - Fetch in Server Component
import { createClient } from "@/utils/supabase/server";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  
  return <ProductList products={products ?? []} />;
}
```

#### Client Components (When Interactivity Needed)
```typescript
// ✅ Good - Client-side fetch with loading state
"use client";

import { useEffect, useState } from "react";

export function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchProducts() {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data.products);
      setLoading(false);
    }
    
    fetchProducts();
  }, []);
  
  if (loading) return <div>Carregando...</div>;
  
  return <ProductList products={products} />;
}
```

### 7. Forms and Validation

#### Use Zod for Form Validation
```typescript
// ✅ Good
"use client";

import { useState } from "react";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  price: z.number().positive("Preço deve ser positivo"),
  sku: z.string().regex(/^[A-Z0-9-]+$/, "SKU inválido"),
});

type ProductFormData = z.infer<typeof productSchema>;

export function ProductForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      name: formData.get("name") as string,
      price: Number(formData.get("price")),
      sku: formData.get("sku") as string,
    };
    
    const result = productSchema.safeParse(data);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
    
    // Submit validated data
    await createProduct(result.data);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="name" />
      {errors.name && <span className="error">{errors.name}</span>}
      {/* ... other fields */}
    </form>
  );
}
```

### 8. Performance Optimization

#### Memoization
```typescript
// ✅ Good - Memoize expensive computations
import { useMemo } from "react";

function ProductAnalytics({ products }: { products: Product[] }) {
  const statistics = useMemo(() => {
    return {
      total: products.length,
      averagePrice: products.reduce((sum, p) => sum + p.price, 0) / products.length,
      topProducts: products.sort((a, b) => b.sales - a.sales).slice(0, 5),
    };
  }, [products]);
  
  return <div>{/* Render statistics */}</div>;
}
```

#### Callback Memoization
```typescript
// ✅ Good - Prevent unnecessary re-renders
import { useCallback } from "react";

function ProductList({ products }: { products: Product[] }) {
  const handleDelete = useCallback(async (productId: string) => {
    await deleteProduct(productId);
  }, []); // Empty deps if it doesn't depend on props/state
  
  return (
    <>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onDelete={handleDelete} />
      ))}
    </>
  );
}
```

---

## MercaFlow-Specific Patterns

### 1. Supabase Client Usage

#### Server Components
```typescript
// ✅ Good - Server Component
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/utils/supabase/roles";

export default async function ProtectedPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }
  
  const supabase = await createClient();
  // Use supabase...
}
```

#### Client Components
```typescript
// ✅ Good - Client Component
"use client";

import { createClient } from "@/utils/supabase/client";

export function LogoutButton() {
  const supabase = createClient();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  
  return <button onClick={handleLogout}>Sair</button>;
}
```

### 2. API Routes Pattern

```typescript
// ✅ Good - app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/supabase/server";
import { getCurrentTenantId } from "@/utils/supabase/tenancy";
import { logger } from "@/utils/logger";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // 2. Get tenant context
    const tenantId = await getCurrentTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: "No tenant found" }, { status: 400 });
    }
    
    // 3. Parse and validate input
    const body = await request.json();
    const result = productSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 }
      );
    }
    
    // 4. Business logic
    const product = await createProduct({
      ...result.data,
      tenant_id: tenantId,
      user_id: user.id,
    });
    
    // 5. Success response
    return NextResponse.json({ success: true, data: product });
    
  } catch (error) {
    logger.error("Failed to create product", { error, endpoint: "/api/products" });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

### 3. Mercado Livre Integration

```typescript
// ✅ Good - ML API call with proper error handling
import { MLTokenManager } from "@/utils/mercadolivre/token-manager";
import { validateOutput, MLItemSchema } from "@/utils/validation";
import { logger } from "@/utils/logger";

async function syncMLProducts(integrationId: string) {
  const tokenManager = new MLTokenManager();
  
  try {
    // Get valid token (auto-refreshes if needed)
    const accessToken = await tokenManager.getValidToken(integrationId);
    
    // Call ML API
    const response = await fetch(
      "https://api.mercadolibre.com/users/me/items/search",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    
    if (!response.ok) {
      throw new Error(`ML API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate response
    const validatedItems = data.results.map((item: unknown) =>
      validateOutput(MLItemSchema, item)
    );
    
    return validatedItems;
    
  } catch (error) {
    logger.error("ML sync failed", { error, integrationId });
    throw error;
  }
}
```

---

## Common Pitfalls to Avoid

### ❌ Don't Mix Client and Server Logic
```typescript
// ❌ Bad - Can't use server-only functions in Client Component
"use client";

import { getCurrentUser } from "@/utils/supabase/server"; // Error!

export function UserProfile() {
  const user = await getCurrentUser(); // This won't work
}

// ✅ Good - Pass data from Server to Client Component
// app/profile/page.tsx (Server Component)
import { getCurrentUser } from "@/utils/supabase/server";
import { UserProfileClient } from "./UserProfileClient";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  return <UserProfileClient user={user} />;
}
```

### ❌ Don't Forget Tenant Context
```typescript
// ❌ Bad - No tenant validation
async function deleteProduct(productId: string) {
  await supabase.from("products").delete().eq("id", productId);
}

// ✅ Good - Validate tenant access
async function deleteProduct(productId: string) {
  const tenantId = await getCurrentTenantId();
  const product = await getProduct(productId);
  
  if (product.tenant_id !== tenantId) {
    throw new Error("Access denied");
  }
  
  await supabase.from("products").delete().eq("id", productId);
}
```

### ❌ Don't Trust Client Input
```typescript
// ❌ Bad - No validation
export async function POST(request: NextRequest) {
  const { productId } = await request.json();
  await deleteProduct(productId); // Dangerous!
}

// ✅ Good - Validate and sanitize
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { productId } = z.object({
    productId: z.string().uuid()
  }).parse(body);
  
  await deleteProduct(productId);
}
```

---

**Remember:** These standards ensure code quality, security, and maintainability across the MercaFlow platform. When in doubt, refer to the [general guidelines](./copilot-standards-general.md) and existing code patterns.
