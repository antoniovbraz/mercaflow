"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { logger } from "@/utils/logger";

interface Question {
  id: string;
  ml_question_id: string;
  text: string;
  status: string;
  date_created: string;
  item_id: string;
  from_user_id: string;
  answer?: {
    text: string;
    date_created: string;
  };
}

export function PerguntasContent() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("UNANSWERED");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      const { data: integration } = await supabase
        .from("ml_integrations")
        .select("id")
        .eq("tenant_id", profile.tenant_id)
        .maybeSingle();

      if (!integration) {
        setLoading(false);
        return;
      }

      let query = supabase
        .from("ml_questions")
        .select("*")
        .eq("integration_id", integration.id)
        .order("date_created", { ascending: false });

      if (filter !== "ALL") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;

      if (error) {
        logger.error("Error loading questions", { error });
        return;
      }

      setQuestions(data || []);
    } catch (error) {
      logger.error("Error in loadQuestions", { error });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  async function submitAnswer() {
    if (!selectedQuestion || !answerText.trim()) return;

    try {
      setSubmitting(true);

      const response = await fetch("/api/ml/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: selectedQuestion.ml_question_id,
          answer: answerText.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit answer");
      }

      // Reload questions
      await loadQuestions();
      setSelectedQuestion(null);
      setAnswerText("");
    } catch (error) {
      logger.error("Error submitting answer", { error });
    } finally {
      setSubmitting(false);
    }
  }

  const stats = {
    total: questions.length,
    unanswered: questions.filter((q) => q.status === "UNANSWERED").length,
    answered: questions.filter((q) => q.status === "ANSWERED").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perguntas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Perguntas Mercado Livre
        </h1>
        <p className="text-gray-600">Responda perguntas dos seus clientes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Perguntas</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Não Respondidas</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {stats.unanswered}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Respondidas</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {stats.answered}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              <SelectItem value="UNANSWERED">Não Respondidas</SelectItem>
              <SelectItem value="ANSWERED">Respondidas</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Questions List */}
      {questions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">Nenhuma pergunta encontrada</p>
              <p className="text-sm mt-1">
                As perguntas dos clientes aparecerão aqui
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <Card
              key={question.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        className={
                          question.status === "UNANSWERED"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }
                      >
                        {question.status === "UNANSWERED"
                          ? "Aguardando Resposta"
                          : "Respondida"}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(question.date_created).toLocaleDateString(
                          "pt-BR"
                        )}
                      </span>
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {question.text}
                    </p>

                    {question.answer && (
                      <div className="mt-4 pl-4 border-l-4 border-green-500">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Sua Resposta:
                        </p>
                        <p className="text-gray-600">{question.answer.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(
                            question.answer.date_created
                          ).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {question.status === "UNANSWERED" && (
                  <div className="mt-4">
                    {selectedQuestion?.id === question.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          placeholder="Digite sua resposta..."
                          rows={3}
                          className="w-full"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={submitAnswer}
                            disabled={submitting || !answerText.trim()}
                            size="sm"
                          >
                            {submitting ? "Enviando..." : "Enviar Resposta"}
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedQuestion(null);
                              setAnswerText("");
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setSelectedQuestion(question)}
                        size="sm"
                      >
                        Responder
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
