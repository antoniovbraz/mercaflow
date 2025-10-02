import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code) {
    return NextResponse.json({ error: 'Authorization code not provided' }, { status: 400 })
  }

  try {
    // Aqui você faria a troca do code por access_token
    // Por enquanto, só retornamos sucesso para teste
    
    return NextResponse.json({
      message: 'Authorization successful',
      code: code,
      state: state,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process authorization' },
      { status: 500 }
    )
  }
}