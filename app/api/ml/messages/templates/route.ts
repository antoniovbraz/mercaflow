/**
 * ML Message Templates API
 * 
 * Handles CRUD operations for ML message templates that enable automated 
 * responses and consistent communication with buyers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, createClient } from '@/utils/supabase/server';

interface MessageTemplate {
  id?: string;
  integration_id: string;
  name: string;
  content: string;
  keywords?: string[];
  trigger_conditions?: Record<string, string | number | boolean>;
  is_active?: boolean;
  priority?: number;
}

/**
 * GET /api/ml/messages/templates
 * 
 * Retrieves message templates for the authenticated user's integrations.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const integration_id = searchParams.get('integration_id');
    const active_only = searchParams.get('active_only') === 'true';

    // Build query
    let query = supabase
      .from('ml_message_templates')
      .select(`
        *,
        ml_integrations!inner(
          id,
          integration_name,
          user_id
        )
      `)
      .eq('ml_integrations.user_id', user.id)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (integration_id) {
      query = query.eq('integration_id', integration_id);
    }

    if (active_only) {
      query = query.eq('is_active', true);
    }

    const { data: templates, error } = await query;

    if (error) {
      console.error('❌ Error fetching message templates:', error);
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }

    console.log(`✅ Successfully fetched ${templates?.length || 0} message templates`);
    
    return NextResponse.json({
      templates: templates || [],
      total: templates?.length || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Message Templates GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ml/messages/templates
 * 
 * Creates a new message template for automated responses.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      integration_id,
      name,
      content,
      keywords = [],
      trigger_conditions = {},
      is_active = true,
      priority = 1
    }: MessageTemplate = body;

    if (!integration_id || !name || !content) {
      return NextResponse.json({ 
        error: 'Missing required fields: integration_id, name, content' 
      }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify integration belongs to user
    const { data: integration, error: integrationError } = await supabase
      .from('ml_integrations')
      .select('id, integration_name')
      .eq('id', integration_id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (integrationError || !integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    // Check for duplicate template name within integration
    const { data: existingTemplate } = await supabase
      .from('ml_message_templates')
      .select('id')
      .eq('integration_id', integration_id)
      .eq('name', name)
      .single();

    if (existingTemplate) {
      return NextResponse.json({ 
        error: 'Template with this name already exists for this integration' 
      }, { status: 409 });
    }

    // Create template
    const templateData = {
      integration_id,
      name: name.trim(),
      content: content.trim(),
      keywords: keywords.filter(k => k.trim().length > 0),
      trigger_conditions,
      is_active,
      priority,
      usage_count: 0
    };

    const { data: template, error: insertError } = await supabase
      .from('ml_message_templates')
      .insert(templateData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating message template:', insertError);
      return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }

    console.log('✅ Successfully created message template:', template.id);
    
    return NextResponse.json({
      success: true,
      template: template,
      message: 'Message template created successfully'
    });

  } catch (error) {
    console.error('❌ Message Template Creation Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ml/messages/templates
 * 
 * Updates an existing message template.
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      id,
      name,
      content,
      keywords,
      trigger_conditions,
      is_active,
      priority
    } = body;

    if (!id) {
      return NextResponse.json({ 
        error: 'Template ID is required' 
      }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify template belongs to user
    const { data: existingTemplate, error: templateError } = await supabase
      .from('ml_message_templates')
      .select(`
        *,
        ml_integrations!inner(user_id)
      `)
      .eq('id', id)
      .eq('ml_integrations.user_id', user.id)
      .single();

    if (templateError || !existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Update template
    const updateData: Record<string, string | number | boolean | string[] | Record<string, string | number | boolean> | Date> = { 
      updated_at: new Date().toISOString() 
    };

    if (name !== undefined) updateData.name = name.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (keywords !== undefined) updateData.keywords = keywords.filter((k: string) => k.trim().length > 0);
    if (trigger_conditions !== undefined) updateData.trigger_conditions = trigger_conditions;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (priority !== undefined) updateData.priority = priority;

    const { data: updatedTemplate, error: updateError } = await supabase
      .from('ml_message_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating message template:', updateError);
      return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }

    console.log('✅ Successfully updated message template:', id);
    
    return NextResponse.json({
      success: true,
      template: updatedTemplate,
      message: 'Message template updated successfully'
    });

  } catch (error) {
    console.error('❌ Message Template Update Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ml/messages/templates
 * 
 * Deletes a message template.
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        error: 'Template ID is required' 
      }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify template belongs to user before deletion
    const { data: template, error: templateError } = await supabase
      .from('ml_message_templates')
      .select(`
        id,
        name,
        ml_integrations!inner(user_id)
      `)
      .eq('id', id)
      .eq('ml_integrations.user_id', user.id)
      .single();

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Delete template
    const { error: deleteError } = await supabase
      .from('ml_message_templates')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('❌ Error deleting message template:', deleteError);
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }

    console.log('✅ Successfully deleted message template:', id);
    
    return NextResponse.json({
      success: true,
      message: 'Message template deleted successfully'
    });

  } catch (error) {
    console.error('❌ Message Template Deletion Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}