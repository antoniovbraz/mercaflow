import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const topic = searchParams.get('topic');
    const status = searchParams.get('status');

    let query = supabase
      .from('ml_webhook_logs')
      .select(`
        id,
        notification_id,
        topic,
        resource,
        user_id,
        application_id,
        attempts,
        sent_at,
        received_at,
        processed_at,
        status,
        error_message,
        resource_data,
        created_at
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by topic if specified
    if (topic) {
      query = query.eq('topic', topic);
    }

    // Filter by status if specified
    if (status) {
      query = query.eq('status', status);
    }

    const { data: webhooks, error: webhooksError } = await query;

    if (webhooksError) {
      console.error('Error fetching webhooks:', webhooksError);
      return NextResponse.json(
        { error: 'Erro ao buscar webhooks' },
        { status: 500 }
      );
    }

    // Get count for pagination
    const { count } = await supabase
      .from('ml_webhook_logs')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      webhooks: webhooks || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Erro na API webhooks:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}