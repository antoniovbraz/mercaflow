/**
 * Client-side role utilities
 *
 * Safe functions for client components to check user roles
 */

export interface UserRoleData {
  role: string | null;
  user: {
    id: string;
    email: string;
  };
}

/**
 * Check if current user has required role (client-safe)
 */
export async function hasRole(requiredRole: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/role');

    if (!response.ok) {
      return false;
    }

    const data: UserRoleData = await response.json();

    if (!data.role) {
      return false;
    }

    // Simple role hierarchy check
    const roleLevels: Record<string, number> = {
      user: 1,
      admin: 2,
      super_admin: 3,
    };

    const userLevel = roleLevels[data.role] || 0;
    const requiredLevel = roleLevels[requiredRole] || 999;

    return userLevel >= requiredLevel;
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
}

/**
 * Get current user role data
 */
export async function getCurrentUserRole(): Promise<UserRoleData | null> {
  try {
    const response = await fetch('/api/auth/role');

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}