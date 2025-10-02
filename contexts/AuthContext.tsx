'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, PlatformOwner, Tenant, TenantUser } from '@/lib/supabase'

interface UserContext {
  user: User | null
  session: Session | null
  isLoading: boolean
  isSuperAdmin: boolean
  currentTenant: Tenant | null
  userTenants: Tenant[]
  platformOwner: PlatformOwner | null
  tenantUser: TenantUser | null
}

interface AuthContextType extends UserContext {
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  switchTenant: (tenantId: string) => Promise<void>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null)
  const [userTenants, setUserTenants] = useState<Tenant[]>([])
  const [platformOwner, setPlatformOwner] = useState<PlatformOwner | null>(null)
  const [tenantUser, setTenantUser] = useState<TenantUser | null>(null)

  const refreshUserData = async () => {
    if (!user) {
      console.log('❌ No user found in refreshUserData')
      return
    }

    try {
      // Verificar se é super admin
      console.log('🔍 Checking super admin for email:', user.email)
      console.log('🔍 User ID:', user.id)
      
      // Primeira tentativa: buscar por email
      const { data: platformOwnerData, error } = await supabase
        .from('platform_owners')
        .select('*')
        .eq('email', user.email)
        .maybeSingle() // Use maybeSingle instead of single to avoid errors

      console.log('🔍 Platform owner query result:', { platformOwnerData, error })
      
      // Segunda tentativa: buscar por ID se não encontrou por email
      if (!platformOwnerData && !error) {
        console.log('🔍 Trying by user ID...')
        const { data: platformOwnerByIdData, error: idError } = await supabase
          .from('platform_owners')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()
        
        console.log('🔍 Platform owner by ID result:', { platformOwnerByIdData, idError })
        
        if (platformOwnerByIdData) {
          console.log('✅ Found platform owner by ID:', platformOwnerByIdData)
          setPlatformOwner(platformOwnerByIdData)
          const isSuper = platformOwnerByIdData.role === 'super_admin'
          console.log('👑 Is super admin?', isSuper)
          setIsSuperAdmin(isSuper)
          return // Exit early if found
        }
      }

      if (platformOwnerData) {
        console.log('✅ Found platform owner:', platformOwnerData)
        setPlatformOwner(platformOwnerData)
        const isSuper = platformOwnerData.role === 'super_admin'
        console.log('👑 Is super admin?', isSuper)
        setIsSuperAdmin(isSuper)

        // Se é super admin, buscar todos os tenants
        const { data: allTenants } = await supabase
          .from('tenants')
          .select('*')
          .order('created_at', { ascending: false })

        setUserTenants(allTenants || [])

        // Definir tenant pessoal como padrão se disponível
        if (platformOwnerData.personal_tenant_enabled && platformOwnerData.personal_tenant_id) {
          const personalTenant = allTenants?.find(t => t.id === platformOwnerData.personal_tenant_id)
          if (personalTenant) {
            setCurrentTenant(personalTenant)
          }
        }
      } else {
        // Usuário normal - buscar tenants onde tem acesso
        const { data: tenantUsersData } = await supabase
          .from('tenant_users')
          .select(`
            *,
            tenant:tenants(*)
          `)
          .eq('user_id', user.id)

        if (tenantUsersData && tenantUsersData.length > 0) {
          const tenants = tenantUsersData.map((tu: any) => tu.tenant).filter(Boolean)
          setUserTenants(tenants)
          setCurrentTenant(tenants[0]) // Primeiro tenant como padrão
          setTenantUser(tenantUsersData[0])
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (!error && data.user) {
      console.log('✅ SignIn successful, refreshing user data for:', data.user.email)
      // Forçar atualização dos dados do usuário após login
      setTimeout(() => {
        refreshUserData()
      }, 1000) // Delay para garantir que o trigger teve tempo de executar
    }
    
    setIsLoading(false)
    return { error }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    setIsLoading(true)
    console.log('🚀 Starting signUp for:', email)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })
    
    console.log('📝 SignUp result:', { data, error })
    
    if (error) {
      console.error('❌ SignUp error:', error)
      setIsLoading(false)
      throw new Error(error.message)
    }
    
    if (data?.user) {
      console.log('✅ User created successfully:', data.user.email)
      // Redirect to login with success message
      window.location.href = '/login?message=Cadastro realizado! Faça login para continuar.'
    }
    
    setIsLoading(false)
    return { error: null }
  }

  const signOut = async () => {
    setIsLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setIsSuperAdmin(false)
    setCurrentTenant(null)
    setUserTenants([])
    setPlatformOwner(null)
    setTenantUser(null)
    setIsLoading(false)
  }

  const switchTenant = async (tenantId: string) => {
    const tenant = userTenants.find(t => t.id === tenantId)
    if (tenant) {
      setCurrentTenant(tenant)
      
      // Atualizar tenant_user se não for super admin
      if (!isSuperAdmin) {
        const { data } = await supabase
          .from('tenant_users')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('user_id', user?.id)
          .single()
        
        setTenantUser(data)
      }
    }
  }

  useEffect(() => {
    // Verificar sessão inicial
    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession()
      setSession(initialSession)
      setUser(initialSession?.user ?? null)
      setIsLoading(false)
    }

    getInitialSession()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)

        if (event === 'SIGNED_IN' && session?.user) {
          await refreshUserData()
        } else if (event === 'SIGNED_OUT') {
          setIsSuperAdmin(false)
          setCurrentTenant(null)
          setUserTenants([])
          setPlatformOwner(null)
          setTenantUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      refreshUserData()
    }
  }, [user])

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isSuperAdmin,
    currentTenant,
    userTenants,
    platformOwner,
    tenantUser,
    signIn,
    signUp,
    signOut,
    switchTenant,
    refreshUserData,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}