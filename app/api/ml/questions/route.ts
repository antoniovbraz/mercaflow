import { logger } from '@/utils/logger';
/**
 * ML Questions API
 * 
 * Handles ML Questions/Answers functionality with auto-response capabilities.
 * Integrates with ML Questions API to fetch, manage, and automatically respond
 * to customer questions using AI-powered templates.
 * 
 * @security Implements Zod validation for query params
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, createClient } from '@/utils/supabase/server';
import { MLTokenManager } from '@/utils/mercadolivre/token-manager';
import {
  QuestionsSearchQuerySchema,
  validateQueryParams,
  ValidationError,
} from '@/utils/validation';

const tokenManager = new MLTokenManager();

interface MLQuestion {
  id: number;
  item_id: string;
  text: string;
  status: 'UNANSWERED' | 'ANSWERED' | 'DELETED' | 'BANNED';
  date_created: string;
  from: {
    id: number;
    nickname: string;
  };
  answer?: {
    text: string;
    status: 'ACTIVE';
    date_created: string;
  };
}

interface MLQuestionsResponse {
  questions: MLQuestion[];
  total: number;
  paging: {
    total: number;
    offset: number;
    limit: number;
  };
}

/**
 * GET /api/ml/questions - List user's questions
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('🔍 ML Questions GET request received');
    
    // Validate query parameters
    try {
      validateQueryParams(QuestionsSearchQuerySchema, request.nextUrl.searchParams);
    } catch (error) {
      if (error instanceof ValidationError) {
        return NextResponse.json(
          { error: 'Invalid query parameters', details: error.details },
          { status: 400 }
        );
      }
      throw error;
    }
    
    // Verify authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Get user profile for tenant ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    const tenantId = profile?.tenant_id || user.id;

    // Get active ML integration
    const { data: integration, error } = await supabase
      .from('ml_integrations')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .maybeSingle(); // Use maybeSingle() to allow 0 results without 406 error

    if (error || !integration) {
      logger.error('No ML integration found for tenant:', tenantId);
      return NextResponse.json(
        { error: 'No active ML integration found. Please connect your Mercado Livre account.' },
        { status: 404 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const searchParams = new URLSearchParams();
    
    // Forward allowed parameters (based on ML official docs for /my/received_questions/search)
    const allowedParams = ['offset', 'limit', 'status', 'item_id'];
    for (const param of allowedParams) {
      const value = url.searchParams.get(param);
      if (value) {
        searchParams.set(param, value);
      }
    }

    // Set default limit if not provided
    if (!searchParams.has('limit')) {
      searchParams.set('limit', '50');
    }

    // Add API version for new structure (according to ML docs)
    searchParams.set('api_version', '4');

    logger.info('📝 Fetching questions with params:', searchParams.toString());

    // Make authenticated request to ML Questions API using the correct endpoint
    // According to ML docs, use /my/received_questions/search for user's questions
    const mlResponse = await tokenManager.makeMLRequest(
      integration.id,
      `/my/received_questions/search?${searchParams.toString()}`
    );

    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();
      logger.error('ML Questions API Error:', mlResponse.status, errorText);
      
      // Log error
      await tokenManager['logSync'](integration.id, 'questions', 'error', {
        action: 'questions_fetch_failed',
        error: errorText,
        status_code: mlResponse.status,
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch questions from Mercado Livre',
          details: errorText,
          status: mlResponse.status,
        },
        { status: mlResponse.status }
      );
    }

    const data: MLQuestionsResponse = await mlResponse.json();

    // Store/update questions in local database for faster access
    if (data.questions && data.questions.length > 0) {
      await syncQuestionsToDatabase(integration.id, data.questions);
    }

    // Log successful sync
    await tokenManager['logSync'](integration.id, 'questions', 'success', {
      action: 'questions_fetched',
      count: data.questions?.length || 0,
      total: data.total || 0,
    });

    logger.info('✅ Successfully fetched ML questions:', data.questions.length);
    return NextResponse.json(data);

  } catch (error) {
    logger.error('ML Questions GET Error:', error);
    
    if (error instanceof Error && error.message.includes('No valid ML token')) {
      return NextResponse.json(
        { error: 'ML token expired. Please reconnect your account.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error while fetching questions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ml/questions - Answer a question or setup auto-response
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('📝 ML Questions POST request received');
    
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { question_id, answer_text, template_name, is_template } = body;

    if (!question_id || !answer_text) {
      return NextResponse.json(
        { error: 'question_id and answer_text are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get user profile for tenant ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    const tenantId = profile?.tenant_id || user.id;

    // Get active ML integration
    const { data: integration, error } = await supabase
      .from('ml_integrations')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .maybeSingle(); // Use maybeSingle() to allow 0 results without 406 error

    if (error || !integration) {
      return NextResponse.json(
        { error: 'No active ML integration found' },
        { status: 404 }
      );
    }

    logger.info('💬 Answering question:', question_id);

    // Answer the question on ML
    const mlResponse = await tokenManager.makeMLRequest(
      integration.id,
      `/questions/${question_id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: answer_text,
        }),
      }
    );

    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();
      logger.error('ML Answer API Error:', mlResponse.status, errorText);
      
      return NextResponse.json(
        { 
          error: 'Failed to answer question on Mercado Livre',
          details: errorText,
        },
        { status: mlResponse.status }
      );
    }

    const responseData = await mlResponse.json();

    // Update question in local database
    const { error: updateError } = await supabase
      .from('ml_questions')
      .update({
        answer_text,
        answer_date: new Date().toISOString(),
        status: 'ANSWERED',
        answer_source: is_template ? 'ai_template' : 'manual',
        updated_at: new Date().toISOString(),
      })
      .eq('integration_id', integration.id)
      .eq('ml_question_id', question_id);

    if (updateError) {
      logger.error('Error updating question in database:', updateError);
    }

    // If this is a template, save it for future use
    if (is_template && template_name) {
      await createQuestionTemplate(
        integration.id,
        template_name,
        answer_text,
        body.keywords || []
      );
    }

    // Log successful answer
    await tokenManager['logSync'](integration.id, 'questions', 'success', {
      action: 'question_answered',
      question_id: question_id.toString(),
      is_template: !!is_template,
    });

    logger.info('✅ Successfully answered ML question:', question_id);
    return NextResponse.json(responseData);

  } catch (error) {
    logger.error('ML Questions POST Error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error while answering question' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to sync questions to local database
 */
async function syncQuestionsToDatabase(integrationId: string, questions: MLQuestion[]) {
  const supabase = await createClient();
  
  const questionsToUpsert = questions.map(q => ({
    integration_id: integrationId,
    ml_question_id: q.id,
    ml_item_id: q.item_id,
    from_user_id: q.from.id,
    from_user_nickname: q.from.nickname,
    question_text: q.text,
    status: q.status,
    date_created: q.date_created,
    answer_text: q.answer?.text || null,
    answer_date: q.answer?.date_created || null,
    raw_data: q,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('ml_questions')
    .upsert(questionsToUpsert, {
      onConflict: 'integration_id,ml_question_id',
    });

  if (error) {
    logger.error('Error syncing questions to database:', error);
  } else {
    logger.info('✅ Synced', questionsToUpsert.length, 'questions to database');
  }
}

/**
 * Helper function to create question template
 */
async function createQuestionTemplate(
  integrationId: string,
  name: string,
  templateText: string,
  keywords: string[]
) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('ml_question_templates')
    .insert({
      integration_id: integrationId,
      name,
      template_text: templateText,
      keywords,
      is_active: true,
      priority: 0,
    });

  if (error) {
    logger.error('Error creating question template:', error);
  } else {
    logger.info('✅ Created question template:', name);
  }
}