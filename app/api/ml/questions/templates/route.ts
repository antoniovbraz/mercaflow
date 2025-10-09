/**
 * ML Question Templates API
 * 
 * Handles CRUD operations for question templates used in auto-response system.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, createClient } from '@/utils/supabase/server';

export interface QuestionTemplate {
  id: string;
  name: string;
  template_text: string;
  keywords: string[];
  is_active: boolean;
  priority: number;
  times_used: number;
  last_used_at?: string;
}

/**
 * GET /api/ml/questions/templates - List question templates
 */
export async function GET(): Promise<NextResponse> {
  try {
    console.log('📋 ML Question Templates GET request received');
    
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
    const { data: integration } = await supabase
      .from('ml_integrations')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .single();

    if (!integration) {
      return NextResponse.json(
        { error: 'No active ML integration found' },
        { status: 404 }
      );
    }

    // Fetch templates ordered by priority
    const { data: templates, error } = await supabase
      .from('ml_question_templates')
      .select('*')
      .eq('integration_id', integration.id)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      );
    }

    console.log('✅ Successfully fetched', templates.length, 'templates');
    return NextResponse.json({ templates });

  } catch (error) {
    console.error('ML Question Templates GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching templates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ml/questions/templates - Create new template
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('📝 ML Question Templates POST request received');
    
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, template_text, keywords, priority = 0 } = body;

    if (!name || !template_text) {
      return NextResponse.json(
        { error: 'name and template_text are required' },
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
    const { data: integration } = await supabase
      .from('ml_integrations')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .single();

    if (!integration) {
      return NextResponse.json(
        { error: 'No active ML integration found' },
        { status: 404 }
      );
    }

    // Create template
    const { data: template, error } = await supabase
      .from('ml_question_templates')
      .insert({
        integration_id: integration.id,
        name: name.trim(),
        template_text: template_text.trim(),
        keywords: keywords || [],
        priority: priority || 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      return NextResponse.json(
        { error: 'Failed to create template' },
        { status: 500 }
      );
    }

    console.log('✅ Successfully created template:', template.id);
    return NextResponse.json({ template });

  } catch (error) {
    console.error('ML Question Templates POST Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while creating template' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ml/questions/templates - Update template
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('📝 ML Question Templates PUT request received');
    
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, template_text, keywords, priority, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'template id is required' },
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
    const { data: integration } = await supabase
      .from('ml_integrations')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .single();

    if (!integration) {
      return NextResponse.json(
        { error: 'No active ML integration found' },
        { status: 404 }
      );
    }

    // Update template
    const updateData: Record<string, string | number | boolean | Date> = { updated_at: new Date().toISOString() };
    
    if (name !== undefined) updateData.name = name.trim();
    if (template_text !== undefined) updateData.template_text = template_text.trim();
    if (keywords !== undefined) updateData.keywords = keywords;
    if (priority !== undefined) updateData.priority = priority;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: template, error } = await supabase
      .from('ml_question_templates')
      .update(updateData)
      .eq('id', id)
      .eq('integration_id', integration.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating template:', error);
      return NextResponse.json(
        { error: 'Failed to update template' },
        { status: 500 }
      );
    }

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    console.log('✅ Successfully updated template:', template.id);
    return NextResponse.json({ template });

  } catch (error) {
    console.error('ML Question Templates PUT Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating template' },
      { status: 500 }
    );
  }
}