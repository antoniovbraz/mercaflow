import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log do webhook recebido
    console.log('Webhook recebido do Mercado Livre:', {
      timestamp: new Date().toISOString(),
      topic: body.topic,
      resource: body.resource,
      user_id: body.user_id,
      application_id: body.application_id
    })

    // Aqui você processaria o webhook baseado no tópico
    switch (body.topic) {
      case 'orders_v2':
        console.log('Nova venda ou atualização de pedido')
        break
      case 'items':
        console.log('Atualização em produto')
        break
      case 'messages':
        console.log('Nova mensagem')
        break
      case 'catalog_item_competition_status':
        console.log('Mudança na competição de preços!')
        break
      case 'price_suggestion':
        console.log('Nova sugestão de preço do ML!')
        break
      default:
        console.log('Tópico desconhecido:', body.topic)
    }

    // Sempre retornar 200 OK rapidamente
    return NextResponse.json({ status: 'received' }, { status: 200 })
    
  } catch (error) {
    console.error('Erro processando webhook:', error)
    return NextResponse.json({ status: 'error' }, { status: 200 }) // Ainda retorna 200 para não reenviar
  }
}