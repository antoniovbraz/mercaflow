'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

// Simplified actions for initial deployment
export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    redirect('/login?error=Email e senha são obrigatórios')
  }

  // Temporary: redirect to success for now
  redirect('/dashboard?message=Login em desenvolvimento')
}

export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  if (!email || !password || !fullName) {
    redirect('/register?error=Todos os campos são obrigatórios')
  }

  // Temporary: show success message
  redirect('/login?success=Registro em desenvolvimento - funcionalidade será ativada em breve')
}

export async function signOutAction() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Sign out error:', error)
    redirect('/dashboard?error=Erro ao fazer logout')
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=Logout realizado com sucesso')
}