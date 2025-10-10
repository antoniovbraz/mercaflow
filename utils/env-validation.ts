/**
 * Environment Variables Validation
 * 
 * Validates required environment variables on startup to prevent
 * runtime errors and ensure proper configuration.
 * 
 * Note: SUPABASE_SERVICE_ROLE_KEY is intentionally NOT required here.
 * Supabase recommends using anon key + RLS policies instead of service_role
 * for better security. The service_role bypasses all RLS policies.
 */

export function validateEnvVars() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    // 'SUPABASE_SERVICE_ROLE_KEY', // ❌ NOT REQUIRED - Use RLS policies instead
    'ML_CLIENT_ID',
    'ML_CLIENT_SECRET',
    'ENCRYPTION_KEY',
  ] as const;

  const missing: string[] = [];

  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n` +
      `Please check your .env.local file and ensure all required variables are set.`
    );
  }

  // Validar comprimento mínimo de encryption key
  if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length < 32) {
    throw new Error('❌ ENCRYPTION_KEY must be at least 32 characters long');
  }

  console.log('✅ All required environment variables are set');
}

/**
 * Get super admin emails from environment
 */
export function getSuperAdminEmails(): string[] {
  return process.env.SUPER_ADMIN_EMAILS?.split(',').map(e => e.trim()).filter(Boolean) || [];
}

/**
 * Check if email is super admin
 */
export function isSuperAdminEmail(email: string): boolean {
  const superAdminEmails = getSuperAdminEmails();
  return superAdminEmails.includes(email);
}
