import { corsHeaders } from './supabase.ts'

// Helper to create JSON responses with CORS headers
export const jsonResponse = (data: any, status = 200) => {
  return new Response(
    JSON.stringify(data),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

// Helper to handle CORS preflight requests
export const handleCors = () => {
  return new Response('ok', { headers: corsHeaders })
}

// Email validation utility
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Helper to validate required fields
export const validateRequired = (fields: Record<string, any>): string | null => {
  for (const [key, value] of Object.entries(fields)) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `Missing required field: ${key}`
    }
  }
  return null
}