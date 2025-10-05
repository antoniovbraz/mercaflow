'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { determineUserRole } from '@/utils/auth'

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    redirect('/login?error=Email e senha são obrigatórios')
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login error:', error)
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  if (!email || !password || !fullName) {
    redirect('/register?error=Todos os campos são obrigatórios')
  }

  const supabase = await createClient()

  // Determine user role based on environment configuration
  const userRole = determineUserRole(email)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    console.error('Registration error:', error)
    redirect(`/register?error=${encodeURIComponent(error.message)}`)
  }

  // If user needs super admin role and registration was successful, update the profile
  if (userRole === 'super_admin' && data.user) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'super_admin' })
      .eq('id', data.user.id)

    if (updateError) {
      console.error('Super admin promotion error:', updateError)
      // Continue with normal flow even if promotion fails
    } else {
      console.log(`Super admin role granted to: ${email}`)
    }
  }

  const successMessage = userRole === 'super_admin' 
    ? 'Conta de Super Admin criada! Verifique seu email para confirmar.'
    : 'Conta criada! Verifique seu email para confirmar.'

  redirect(`/login?success=${encodeURIComponent(successMessage)}`)
}

export async function signOutAction() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Sign out error:', error)
    redirect('/dashboard?error=Erro ao fazer logout')
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}