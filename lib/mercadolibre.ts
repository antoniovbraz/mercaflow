// Configuração da API do Mercado Livre
import axios from 'axios'

const ML_API_BASE_URL = 'https://api.mercadolibre.com'

// Cliente HTTP para Mercado Livre
export const mlApi = axios.create({
  baseURL: ML_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Configurações OAuth
export const ML_OAUTH_CONFIG = {
  clientId: process.env.ML_CLIENT_ID!,
  clientSecret: process.env.ML_CLIENT_SECRET!,
  redirectUri: process.env.ML_REDIRECT_URI!,
  authUrl: 'https://auth.mercadolivre.com.br/authorization',
  tokenUrl: `${ML_API_BASE_URL}/oauth/token`,
}

// Funções para OAuth
export async function exchangeCodeForToken(code: string, state?: string) {
  try {
    const response = await axios.post(ML_OAUTH_CONFIG.tokenUrl, {
      grant_type: 'authorization_code',
      client_id: ML_OAUTH_CONFIG.clientId,
      client_secret: ML_OAUTH_CONFIG.clientSecret,
      code: code,
      redirect_uri: ML_OAUTH_CONFIG.redirectUri,
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    return response.data
  } catch (error) {
    console.error('Erro ao trocar code por token:', error)
    throw error
  }
}

export async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await axios.post(ML_OAUTH_CONFIG.tokenUrl, {
      grant_type: 'refresh_token',
      client_id: ML_OAUTH_CONFIG.clientId,
      client_secret: ML_OAUTH_CONFIG.clientSecret,
      refresh_token: refreshToken,
    }, {
      headers: {
        'Accept': 'application/json',  
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    return response.data
  } catch (error) {
    console.error('Erro ao renovar token:', error)
    throw error
  }
}

// Função para fazer chamadas autenticadas
export async function mlApiCall(endpoint: string, accessToken: string, method: 'GET' | 'POST' | 'PUT' = 'GET', data?: any) {
  try {
    const response = await mlApi({
      method,
      url: endpoint,
      data,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    return response.data
  } catch (error) {
    console.error(`Erro na chamada ML API ${endpoint}:`, error)
    throw error
  }
}

// Tipos para as respostas da API
export interface MLTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
  user_id: number
  refresh_token: string
}

export interface MLUser {
  id: number
  nickname: string
  email: string
  first_name: string
  last_name: string
  country_id: string
  site_id: string
}