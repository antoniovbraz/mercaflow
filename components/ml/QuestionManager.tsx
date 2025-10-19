'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle,
  Send,
  RefreshCw,
  ExternalLink,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Bot,
  User,
  Plus,
  Settings,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { QuestionCardSkeleton } from '@/components/ui/skeleton-variants';
import { NoQuestions, NoData, ErrorState } from '@/components/ui/empty-state-variants';

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

interface QuestionsResponse {
  questions: MLQuestion[];
  total: number;
  paging: {
    total: number;
    offset: number;
    limit: number;
  };
}

interface QuestionTemplate {
  id: string;
  name: string;
  template_text: string;
  keywords: string[];
  is_active: boolean;
  times_used: number;
}

export function MLQuestionManager() {
  const [questions, setQuestions] = useState<MLQuestion[]>([]);
  const [templates, setTemplates] = useState<QuestionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('UNANSWERED');
  
  // Answer form state
  const [answeringQuestion, setAnsweringQuestion] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  
  // Template form state
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    template_text: '',
    keywords: '',
  });

  // Fetch questions from API
  const fetchQuestions = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams({
        limit: '50',
      });
      
      // Only add status if it's not 'ALL'
      if (selectedStatus !== 'ALL') {
        params.set('status', selectedStatus);
      }

      const response = await fetch(`/api/ml/questions?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch questions');
      }

      const data: QuestionsResponse = await response.json();
      setQuestions(data.questions || []);
      
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch questions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedStatus]);

  // Fetch question templates
  const fetchTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/ml/questions/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchQuestions();
    fetchTemplates();
  }, [fetchQuestions, fetchTemplates]);

  // Refresh questions
  const refreshQuestions = () => {
    setRefreshing(true);
    fetchQuestions();
  };

  // Answer a question
  const handleAnswerQuestion = async (questionId: number) => {
    if (!answerText.trim()) return;
    
    setSubmittingAnswer(true);
    try {
      const response = await fetch('/api/ml/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_id: questionId,
          answer_text: answerText.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to answer question');
      }

      // Update local state
      setQuestions(prev => prev.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              status: 'ANSWERED' as const,
              answer: {
                text: answerText.trim(),
                status: 'ACTIVE' as const,
                date_created: new Date().toISOString(),
              }
            }
          : q
      ));
      
      // Reset form
      setAnsweringQuestion(null);
      setAnswerText('');
      
    } catch (error) {
      console.error('Error answering question:', error);
      setError(error instanceof Error ? error.message : 'Failed to answer question');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // Create question template
  const handleCreateTemplate = async () => {
    if (!newTemplate.name.trim() || !newTemplate.template_text.trim()) return;
    
    try {
      const response = await fetch('/api/ml/questions/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTemplate.name.trim(),
          template_text: newTemplate.template_text.trim(),
          keywords: newTemplate.keywords.split(',').map(k => k.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create template');
      }

      // Reset form and refresh templates
      setNewTemplate({ name: '', template_text: '', keywords: '' });
      setShowTemplateForm(false);
      fetchTemplates();
      
    } catch (error) {
      console.error('Error creating template:', error);
      setError(error instanceof Error ? error.message : 'Failed to create template');
    }
  };

  // Apply template to answer
  const applyTemplate = (template: QuestionTemplate) => {
    setAnswerText(template.template_text);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UNANSWERED': return 'bg-orange-100 text-orange-800';
      case 'ANSWERED': return 'bg-green-100 text-green-800';
      case 'DELETED': return 'bg-red-100 text-red-800';
      case 'BANNED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UNANSWERED': return <Clock className="w-4 h-4" />;
      case 'ANSWERED': return <CheckCircle className="w-4 h-4" />;
      case 'DELETED': case 'BANNED': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <Card>
          <CardHeader>
            <div className="space-y-3">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-96 bg-gray-100 rounded animate-pulse" />
            </div>
          </CardHeader>
        </Card>

        {/* Questions List Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <QuestionCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Perguntas Mercado Livre
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshQuestions}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filter by status */}
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-2">
              {['ALL', 'UNANSWERED', 'ANSWERED'].map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus(status)}
                >
                  {status === 'ALL' ? 'Todas' : 
                   status === 'UNANSWERED' ? 'Não Respondidas' : 'Respondidas'}
                </Button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {questions.filter(q => q.status === 'UNANSWERED').length}
              </div>
              <div className="text-xs text-muted-foreground">Pendentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {questions.filter(q => q.status === 'ANSWERED').length}
              </div>
              <div className="text-xs text-muted-foreground">Respondidas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{questions.length}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{templates.length}</div>
              <div className="text-xs text-muted-foreground">Templates</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <ErrorState
          title="Erro ao carregar perguntas"
          description={error}
          action={{
            label: "Tentar Novamente",
            onClick: () => {
              setError(null);
              fetchQuestions();
            },
          }}
        />
      )}

      {/* Main Content */}
      <Tabs defaultValue="questions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="questions">Perguntas</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="questions" className="space-y-4">
          {/* Questions List */}
          {questions.length === 0 ? (
            <NoQuestions
              action={{
                label: selectedStatus === 'ALL' ? "Atualizar" : "Ver Todas",
                onClick: () => {
                  if (selectedStatus === 'ALL') {
                    fetchQuestions();
                  } else {
                    setSelectedStatus('ALL');
                  }
                },
                variant: "outline"
              }}
              secondaryAction={{
                label: "Ver Tutorial",
                onClick: () => window.open('/ajuda/perguntas', '_self'),
              }}
            />
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <Card key={question.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Question Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(question.status)}>
                              {getStatusIcon(question.status)}
                              {question.status === 'UNANSWERED' ? 'Pendente' : 
                               question.status === 'ANSWERED' ? 'Respondida' : question.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              por {question.from.nickname}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(question.date_created), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </span>
                          </div>
                          <p className="font-medium">{question.text}</p>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://www.mercadolibre.com.br/p/${question.item_id}`, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Existing Answer */}
                      {question.answer && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Sua resposta</span>
                            <span className="text-sm text-green-600">
                              {format(new Date(question.answer.date_created), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </span>
                          </div>
                          <p className="text-sm text-green-800">{question.answer.text}</p>
                        </div>
                      )}

                      {/* Answer Form */}
                      {question.status === 'UNANSWERED' && answeringQuestion === question.id && (
                        <div className="space-y-3 border-t pt-4">
                          <div className="flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            <span className="font-medium">Responder pergunta</span>
                          </div>
                          
                          {/* Template suggestions */}
                          {templates.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-sm text-muted-foreground">Templates sugeridos:</span>
                              <div className="flex gap-2 flex-wrap">
                                {templates.slice(0, 3).map((template) => (
                                  <Button
                                    key={template.id}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyTemplate(template)}
                                  >
                                    <Bot className="w-3 h-3 mr-1" />
                                    {template.name}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <Textarea
                            placeholder="Digite sua resposta..."
                            value={answerText}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAnswerText(e.target.value)}
                            rows={3}
                          />
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleAnswerQuestion(question.id)}
                              disabled={!answerText.trim() || submittingAnswer}
                              size="sm"
                            >
                              {submittingAnswer ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <Send className="w-4 h-4 mr-2" />
                              )}
                              Enviar Resposta
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setAnsweringQuestion(null);
                                setAnswerText('');
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Answer Button */}
                      {question.status === 'UNANSWERED' && answeringQuestion !== question.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAnsweringQuestion(question.id)}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Responder
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-4">
          {/* Templates Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Templates de Resposta
                </CardTitle>
                
                <Button
                  onClick={() => setShowTemplateForm(!showTemplateForm)}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Template
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* New Template Form */}
              {showTemplateForm && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-medium">Criar Novo Template</h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome do Template</label>
                    <Input
                      placeholder="Ex: Informações de Entrega"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Texto da Resposta</label>
                    <Textarea
                      placeholder="Digite o texto padrão da resposta..."
                      value={newTemplate.template_text}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTemplate(prev => ({ ...prev, template_text: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Palavras-chave (separadas por vírgula)</label>
                    <Input
                      placeholder="entrega, prazo, envio, correios"
                      value={newTemplate.keywords}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, keywords: e.target.value }))}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleCreateTemplate} size="sm">
                      Criar Template
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowTemplateForm(false);
                        setNewTemplate({ name: '', template_text: '', keywords: '' });
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {/* Templates List */}
              {templates.length === 0 ? (
                <NoData
                  title="Nenhum template criado"
                  description="Crie templates para respostas rápidas e padronizadas. Isso economiza tempo ao responder perguntas frequentes."
                  action={{
                    label: "Criar Primeiro Template",
                    onClick: () => setShowTemplateForm(true),
                  }}
                  bare
                />
              ) : (
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{template.name}</h4>
                            {template.is_active && (
                              <Badge variant="outline">Ativo</Badge>
                            )}
                            <span className="text-sm text-muted-foreground">
                              Usado {template.times_used}x
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{template.template_text}</p>
                          {template.keywords.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {template.keywords.map((keyword, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}