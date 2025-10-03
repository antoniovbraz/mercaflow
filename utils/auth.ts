/**
 * Authentication utilities for MercaFlow
 * Provides functions for user authentication and role management
 */

/**
 * Checks if an email belongs to a super admin
 * Uses environment variable SUPER_ADMIN_EMAILS for configuration
 * 
 * @param email - Email address to check
 * @returns true if email is in super admin list, false otherwise
 */
export function isSuperAdmin(email: string): boolean {
  if (!email) return false;
  
  const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  return superAdminEmails.includes(email.toLowerCase());
}

/**
 * Determines the role for a new user based on their email
 * Super admins are determined by environment variable
 * 
 * @param email - Email address of the user
 * @returns 'super_admin' for configured emails, 'user' for others
 */
export function determineUserRole(email: string): 'super_admin' | 'user' {
  return isSuperAdmin(email) ? 'super_admin' : 'user';
}

/**
 * Gets list of super admin emails from environment
 * Used for administrative purposes and debugging
 * 
 * @returns Array of super admin email addresses
 */
export function getSuperAdminEmails(): string[] {
  return process.env.SUPER_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
}

/**
 * Validates if super admin configuration is properly set
 * 
 * @returns true if at least one super admin email is configured
 */
export function isSuperAdminConfigured(): boolean {
  const emails = getSuperAdminEmails();
  return emails.length > 0 && emails.some(email => email.length > 0);
}