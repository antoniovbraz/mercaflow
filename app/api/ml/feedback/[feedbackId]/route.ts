import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface FeedbackUpdatePayload {
  fulfilled: boolean;
  message: string;
  rating?: 'positive' | 'negative' | 'neutral';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ feedbackId: string }> }
) {
  const { feedbackId } = await params;
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

    // Buscar feedback específico na API do ML
    const response = await fetch(
      `https://api.mercadolibre.com/feedback/${feedbackId}`,
      {
        headers: {
          'Authorization': `Bearer ${validToken}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro na API ML ao buscar feedback:', errorData);
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ feedbackId: string }> }
) {
  const { feedbackId } = await params;
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
    const { fulfilled, rating, message } = body;

    // Validar campos obrigatórios
    if (typeof fulfilled !== 'boolean') {
      return NextResponse.json(
        { error: 'Campo fulfilled é obrigatório (true/false)' },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Campo message é obrigatório' },
        { status: 400 }
      );
    }

    if (fulfilled && !rating) {
      return NextResponse.json(
        { error: 'Campo rating é obrigatório quando fulfilled=true (positive, negative, neutral)' },
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
    const feedbackData: FeedbackUpdatePayload = {
      fulfilled,
      message
    };

    if (fulfilled && rating) {
      feedbackData.rating = rating as 'positive' | 'negative' | 'neutral';
    }

    // Atualizar feedback na API do ML
    const response = await fetch(
      `https://api.mercadolibre.com/feedback/${feedbackId}`,
      {
        method: 'PUT',
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
      console.error('Erro na API ML ao atualizar feedback:', errorData);
      return NextResponse.json(
        { error: 'Erro ao atualizar feedback na API do ML', details: errorData },
        { status: response.status }
      );
    }

    const updatedFeedback = await response.json();
    
    return NextResponse.json(updatedFeedback);

  } catch (error) {
    console.error('Erro na API ao atualizar feedback:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}