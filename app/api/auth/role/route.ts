/**
 * Auth Role API - Check user role
 *
 * Returns the current user's role for client-side role checking
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/utils/supabase/server';
import { getUserRole } from '@/utils/supabase/roles';

/**
 * GET /api/auth/role - Get current user role
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Verify authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user role
    const userRole = await getUserRole();

    return NextResponse.json({
      role: userRole,
      user: {
        id: user.id,
        email: user.email,
      }
    });

  } catch (error) {
    console.error('Auth Role API Error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}