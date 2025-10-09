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
    const metricType = searchParams.get('type') || 'visits';
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const itemIds = searchParams.get('item_ids')?.split(',');
    const userId = searchParams.get('user_id');

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
    const mlUserId = userId || integration.ml_user_id;

    let apiUrl = '';
    const baseUrl = 'https://api.mercadolibre.com';

    // Determinar endpoint baseado no tipo de métrica
    switch (metricType) {
      case 'visits':
        if (itemIds && itemIds.length > 0) {
          // Múltiplos itens
          const idsParam = itemIds.join(',');
          apiUrl = `${baseUrl}/items/visits?ids=${idsParam}`;
          if (dateFrom) apiUrl += `&date_from=${encodeURIComponent(dateFrom)}`;
          if (dateTo) apiUrl += `&date_to=${encodeURIComponent(dateTo)}`;
        } else {
          // Visitas de usuário
          apiUrl = `${baseUrl}/users/${mlUserId}/items_visits`;
          if (dateFrom) apiUrl += `?date_from=${encodeURIComponent(dateFrom)}`;
          if (dateTo) apiUrl += `${dateFrom ? '&' : '?'}date_to=${encodeURIComponent(dateTo)}`;
        }
        break;
      
      case 'visits_time_window':
        const last = searchParams.get('last') || '7';
        const unit = searchParams.get('unit') || 'day';
        const ending = searchParams.get('ending');
        
        if (itemIds && itemIds.length > 0) {
          // Múltiplos itens com janela de tempo
          const idsParam = itemIds.join(',');
          apiUrl = `${baseUrl}/items/visits/time_window?ids=${idsParam}&last=${last}&unit=${unit}`;
          if (ending) apiUrl += `&ending=${encodeURIComponent(ending)}`;
        } else {
          // Visitas de usuário com janela de tempo
          apiUrl = `${baseUrl}/users/${mlUserId}/items_visits/time_window?last=${last}&unit=${unit}`;
          if (ending) apiUrl += `&ending=${encodeURIComponent(ending)}`;
        }
        break;

      case 'questions':
        apiUrl = `${baseUrl}/users/${mlUserId}/contacts/questions`;
        if (dateFrom) apiUrl += `?date_from=${encodeURIComponent(dateFrom)}`;
        if (dateTo) apiUrl += `${dateFrom ? '&' : '?'}date_to=${encodeURIComponent(dateTo)}`;
        break;

      case 'questions_time_window':
        const questionsLast = searchParams.get('last') || '7';
        const questionsUnit = searchParams.get('unit') || 'day';
        apiUrl = `${baseUrl}/users/${mlUserId}/contacts/questions/time_window?last=${questionsLast}&unit=${questionsUnit}`;
        break;

      case 'phone_views':
        apiUrl = `${baseUrl}/users/${mlUserId}/contacts/phone_views`;
        if (dateFrom) apiUrl += `?date_from=${encodeURIComponent(dateFrom)}`;
        if (dateTo) apiUrl += `${dateFrom ? '&' : '?'}date_to=${encodeURIComponent(dateTo)}`;
        break;

      case 'phone_views_time_window':
        const phoneLast = searchParams.get('last') || '7';
        const phoneUnit = searchParams.get('unit') || 'day';
        
        if (itemIds && itemIds.length > 0) {
          const idsParam = itemIds.join(',');
          apiUrl = `${baseUrl}/items/contacts/phone_views/time_window?ids=${idsParam}&last=${phoneLast}&unit=${phoneUnit}`;
        } else {
          apiUrl = `${baseUrl}/users/${mlUserId}/contacts/phone_views/time_window?last=${phoneLast}&unit=${phoneUnit}`;
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Tipo de métrica não suportado. Tipos disponíveis: visits, visits_time_window, questions, questions_time_window, phone_views, phone_views_time_window' },
          { status: 400 }
        );
    }

    // Buscar métricas na API do ML
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${validToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro na API ML métricas:', errorData);
      return NextResponse.json(
        { error: 'Erro ao buscar métricas na API do ML', details: errorData },
        { status: response.status }
      );
    }

    const metricsData = await response.json();
    
    return NextResponse.json({
      type: metricType,
      data: metricsData,
      api_url: apiUrl // Para debug
    });

  } catch (error) {
    console.error('Erro na API métricas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}