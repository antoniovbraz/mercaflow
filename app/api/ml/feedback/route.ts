import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface FeedbackPayload {
  fulfilled: boolean;
  message: string;
  rating?: 'positive' | 'negative' | 'neutral';
  reason?: string;
  restock_item?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar profile e tenant
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile não encontrado' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID do pedido é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar token ML
    const { data: integration } = await supabase
      .from('ml_integrations')
      .select('access_token, ml_user_id')
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (!integration?.access_token) {
      return NextResponse.json(
        { error: 'Token ML não encontrado' },
        { status: 404 }
      );
    }

    const validToken = integration.access_token;

    // Buscar feedback do pedido na API do ML
    const response = await fetch(
      `https://api.mercadolibre.com/orders/${orderId}/feedback`,
      {
        headers: {
          'Authorization': `Bearer ${validToken}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro na API ML feedback:', errorData);
      return NextResponse.json(
        { error: 'Erro ao buscar feedback na API do ML', details: errorData },
        { status: response.status }
      );
    }

    const feedbackData = await response.json();
    
    return NextResponse.json(feedbackData);

  } catch (error) {
    console.error('Erro na API feedback:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar profile e tenant
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile não encontrado' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { order_id, fulfilled, rating, message, reason, restock_item } = body;

    if (!order_id) {
      return NextResponse.json(
        { error: 'ID do pedido é obrigatório' },
        { status: 400 }
      );
    }

    // Validar campos obrigatórios
    if (typeof fulfilled !== 'boolean') {
      return NextResponse.json(
        { error: 'Campo fulfilled é obrigatório (true/false)' },
        { status: 400 }
      );
    }

    if (!message || message.length > 160) {
      return NextResponse.json(
        { error: 'Campo message é obrigatório (máximo 160 caracteres)' },
        { status: 400 }
      );
    }

    if (fulfilled && !rating) {
      return NextResponse.json(
        { error: 'Campo rating é obrigatório quando fulfilled=true (positive, negative, neutral)' },
        { status: 400 }
      );
    }

    if (!fulfilled && !reason) {
      return NextResponse.json(
        { error: 'Campo reason é obrigatório quando fulfilled=false' },
        { status: 400 }
      );
    }

    // Buscar token ML
    const { data: integration } = await supabase
      .from('ml_integrations')
      .select('access_token, ml_user_id')
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (!integration?.access_token) {
      return NextResponse.json(
        { error: 'Token ML não encontrado' },
        { status: 404 }
      );
    }

    const validToken = integration.access_token;

    // Preparar dados do feedback
    const feedbackData: FeedbackPayload = {
      fulfilled,
      message
    };

    if (fulfilled) {
      feedbackData.rating = rating as 'positive' | 'negative' | 'neutral';
    } else {
      feedbackData.reason = reason;
      if (restock_item !== undefined) {
        feedbackData.restock_item = restock_item;
      }
    }

    // Criar feedback na API do ML
    const response = await fetch(
      `https://api.mercadolibre.com/orders/${order_id}/feedback`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${validToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData)
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro na API ML ao criar feedback:', errorData);
      return NextResponse.json(
        { error: 'Erro ao criar feedback na API do ML', details: errorData },
        { status: response.status }
      );
    }

    const createdFeedback = await response.json();
    
    return NextResponse.json(createdFeedback);

  } catch (error) {
    console.error('Erro na API ao criar feedback:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}