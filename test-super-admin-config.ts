/**
 * Test script to validate super admin configuration
 * Run with: npx tsx test-super-admin-config.ts
 */

import dotenv from 'dotenv'
import { isSuperAdmin, determineUserRole, getSuperAdminEmails, isSuperAdminConfigured } from './utils/auth'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Test configuration
console.log('🧪 Testing Super Admin Configuration\n')

// Test 1: Check if configuration is loaded
console.log('1. Configuration Status:')
console.log(`   Configured: ${isSuperAdminConfigured()}`)
console.log(`   Super Admin Emails: ${getSuperAdminEmails().join(', ')}\n`)

// Test 2: Test specific emails
const testEmails = [
  'peepers.shop@gmail.com',
  'antoniovbraz@gmail.com',
  'random@example.com',
  'test@test.com'
]

console.log('2. Email Role Testing:')
testEmails.forEach(email => {
  const isSuper = isSuperAdmin(email)
  const role = determineUserRole(email)
  console.log(`   ${email}: ${isSuper ? '✅ Super Admin' : '❌ Regular User'} (role: ${role})`)
})

console.log('\n3. Edge Cases:')
console.log(`   Empty string: ${isSuperAdmin('')} (should be false)`)
console.log(`   Null: ${isSuperAdmin(null as any)} (should be false)`)
console.log(`   Case sensitivity: ${isSuperAdmin('PEEPERS.SHOP@GMAIL.COM')} (should be true)`)

console.log('\n✅ Super Admin configuration test completed!')