-- Script para verificar status dos usuários super admin
-- Execute no SQL Editor do Supabase Dashboard

-- Verificar todos os usuários e seus roles
SELECT 
  au.email,
  au.email_confirmed_at IS NOT NULL as email_confirmado,
  au.created_at as usuario_criado_em,
  p.role as role_atual,
  p.updated_at as role_atualizado_em,
  CASE 
    WHEN p.role = 'super_admin' THEN '🔥 SUPER ADMIN ATIVO'
    WHEN p.role = 'admin' THEN '⚡ ADMIN'
    WHEN p.role = 'user' THEN '👤 USUÁRIO'
    ELSE '❓ SEM ROLE'
  END as status_visual
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
ORDER BY 
  CASE p.role 
    WHEN 'super_admin' THEN 1 
    WHEN 'admin' THEN 2 
    WHEN 'user' THEN 3 
    ELSE 4 
  END,
  au.email;