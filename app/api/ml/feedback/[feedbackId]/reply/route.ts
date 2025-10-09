import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { feedbackId: string } }
) {
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

    const { feedbackId } = params;
    const body = await request.json();
    const { reply } = body;

    if (!reply) {
      return NextResponse.json(
        { error: 'Campo reply é obrigatório' },
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

    // Responder ao feedback na API do ML
    const response = await fetch(
      `https://api.mercadolibre.com/feedback/${feedbackId}/reply`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${validToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reply })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro na API ML ao responder feedback:', errorData);
      return NextResponse.json(
        { error: 'Erro ao responder feedback na API do ML', details: errorData },
        { status: response.status }
      );
    }

    const replyData = await response.json();
    
    return NextResponse.json(replyData);

  } catch (error) {
    console.error('Erro na API ao responder feedback:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}