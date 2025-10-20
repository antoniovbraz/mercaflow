"use client";

import { FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  ml_item_id: string;
  title: string;
  price: number;
  available_quantity: number;
  sold_quantity: number;
  status: string;
}

interface ProductTitleQualityProps {
  product: Product;
  compactMode?: boolean;
}

interface TitleAnalysis {
  score: number;
  breakdown: {
    length: number;
    keywords: number;
    forbidden: number;
  };
  suggestions: string[];
  status: "excellent" | "good" | "needs-improvement" | "critical";
}

export default function ProductTitleQuality({
  product,
  compactMode = false,
}: ProductTitleQualityProps) {
  const analysis = analyzeTitleQuality(product.title);

  if (compactMode) {
    return (
      <Badge
        variant={
          analysis.status === "excellent" || analysis.status === "good"
            ? "default"
            : "destructive"
        }
        className={`${getStatusBgColor(analysis.status)} text-xs`}
      >
        {getStatusIcon(analysis.status)} {analysis.score}/100
      </Badge>
    );
  }

  return (
    <Card
      className={`p-3 ${getCardBackground(analysis.status)} border-l-4 ${getCardBorder(analysis.status)}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg ${getIconBackground(analysis.status)}`}
          >
            <FileText
              className={`h-4 w-4 ${getIconColor(analysis.status)}`}
            />
          </div>
          <h4 className="text-sm font-semibold text-gray-900">
            Qualidade do Título
          </h4>
        </div>
        <Badge
          variant={
            analysis.status === "critical" ||
            analysis.status === "needs-improvement"
              ? "destructive"
              : "default"
          }
          className="text-xs"
        >
          {analysis.status === "excellent"
            ? "Excelente"
            : analysis.status === "good"
              ? "Bom"
              : analysis.status === "needs-improvement"
                ? "Melhorar"
                : "Crítico"}
        </Badge>
      </div>

      {/* Score Display */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600">Score Total</span>
          <span className="text-xs font-medium text-gray-900">
            {analysis.score}/100
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${getScoreBarColor(analysis.status)}`}
            style={{ width: `${analysis.score}%` }}
          ></div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-white/50 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-600 mb-1">Tamanho</p>
          <p
            className={`text-sm font-bold ${analysis.breakdown.length >= 30 ? "text-green-700" : "text-red-700"}`}
          >
            {analysis.breakdown.length > 0 ? "✓" : "✗"}
          </p>
        </div>
        <div className="bg-white/50 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-600 mb-1">Keywords</p>
          <p
            className={`text-sm font-bold ${analysis.breakdown.keywords >= 25 ? "text-green-700" : "text-yellow-700"}`}
          >
            {Math.round((analysis.breakdown.keywords / 35) * 3)}/3
          </p>
        </div>
        <div className="bg-white/50 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-600 mb-1">Proibidos</p>
          <p
            className={`text-sm font-bold ${analysis.breakdown.forbidden === 0 ? "text-green-700" : "text-red-700"}`}
          >
            {analysis.breakdown.forbidden > 0 ? "✗" : "✓"}
          </p>
        </div>
      </div>

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-gray-900">Sugestões:</p>
          {analysis.suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-start gap-2 text-xs text-gray-700"
            >
              <AlertCircle className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
              <span>{suggestion}</span>
            </div>
          ))}
        </div>
      )}

      {/* Success Message */}
      {analysis.suggestions.length === 0 && (
        <div className="flex items-center gap-2 p-2 bg-green-50/50 rounded-lg border border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
          <p className="text-xs text-green-900 font-medium">
            Título otimizado! Mantém boas práticas do ML.
          </p>
        </div>
      )}
    </Card>
  );
}

// Analysis Logic
function analyzeTitleQuality(title: string): TitleAnalysis {
  const length = title.length;

  // Length Score (35 points max)
  // Ideal: 40-60 characters
  const lengthScore =
    length >= 40 && length <= 60
      ? 35
      : Math.max(0, 35 - Math.abs(50 - length));

  // Keywords Score (35 points max)
  // Top ML keywords: original, novo, garantia, frete grátis, entrega
  const topKeywords = [
    "original",
    "novo",
    "garantia",
    "entrega",
    "grátis",
    "promoção",
  ];
  const keywordsFound = topKeywords.filter((k) =>
    title.toLowerCase().includes(k)
  ).length;
  const keywordScore = Math.min(35, keywordsFound * 12);

  // Forbidden Terms (penalty)
  // ML prohibits superlatives and fake urgency
  const forbiddenTerms = [
    "barato",
    "imperdível",
    "última unidade",
    "oferta relâmpago",
    "super oferta",
    "melhor preço",
    "não perca",
    "compre já",
  ];
  const forbiddenFound = forbiddenTerms.filter((f) =>
    title.toLowerCase().includes(f)
  ).length;
  const forbiddenPenalty = forbiddenFound * 15;

  // Base score (30 points for not being empty)
  const baseScore = title.trim().length > 0 ? 30 : 0;

  // Final Score (0-100)
  const finalScore = Math.max(
    0,
    Math.min(100, baseScore + lengthScore + keywordScore - forbiddenPenalty)
  );

  // Generate suggestions
  const suggestions: string[] = [];
  if (length < 40) {
    suggestions.push(
      `Adicione mais detalhes (${length}/40 caracteres mínimos)`
    );
  }
  if (length > 60) {
    suggestions.push(
      `Reduza para 60 caracteres (atual: ${length}). Foco em info essencial.`
    );
  }
  if (keywordsFound < 2) {
    suggestions.push(
      'Inclua palavras-chave: "original", "garantia", "novo", "entrega grátis"'
    );
  }
  if (forbiddenFound > 0) {
    suggestions.push(
      `Remova ${forbiddenFound} termo(s) proibido(s) pelo ML (superlatives/urgência falsa)`
    );
  }

  // Determine status
  let status: TitleAnalysis["status"];
  if (finalScore >= 80) {
    status = "excellent";
  } else if (finalScore >= 60) {
    status = "good";
  } else if (finalScore >= 40) {
    status = "needs-improvement";
  } else {
    status = "critical";
  }

  return {
    score: finalScore,
    breakdown: {
      length: lengthScore,
      keywords: keywordScore,
      forbidden: forbiddenPenalty,
    },
    suggestions,
    status,
  };
}

// Helper Functions
function getStatusIcon(status: TitleAnalysis["status"]) {
  switch (status) {
    case "excellent":
      return "✓";
    case "good":
      return "○";
    case "needs-improvement":
      return "!";
    case "critical":
      return "✗";
  }
}

function getStatusBgColor(status: TitleAnalysis["status"]) {
  switch (status) {
    case "excellent":
      return "bg-green-100 text-green-800";
    case "good":
      return "bg-blue-100 text-blue-800";
    case "needs-improvement":
      return "bg-yellow-100 text-yellow-800";
    case "critical":
      return "bg-red-100 text-red-800";
  }
}

function getCardBackground(status: TitleAnalysis["status"]) {
  switch (status) {
    case "excellent":
      return "bg-green-50/50";
    case "good":
      return "bg-blue-50/50";
    case "needs-improvement":
      return "bg-yellow-50/50";
    case "critical":
      return "bg-red-50/50";
  }
}

function getCardBorder(status: TitleAnalysis["status"]) {
  switch (status) {
    case "excellent":
      return "border-green-500";
    case "good":
      return "border-blue-500";
    case "needs-improvement":
      return "border-yellow-500";
    case "critical":
      return "border-red-500";
  }
}

function getIconBackground(status: TitleAnalysis["status"]) {
  switch (status) {
    case "excellent":
      return "bg-green-100";
    case "good":
      return "bg-blue-100";
    case "needs-improvement":
      return "bg-yellow-100";
    case "critical":
      return "bg-red-100";
  }
}

function getIconColor(status: TitleAnalysis["status"]) {
  switch (status) {
    case "excellent":
      return "text-green-600";
    case "good":
      return "text-blue-600";
    case "needs-improvement":
      return "text-yellow-600";
    case "critical":
      return "text-red-600";
  }
}

function getScoreBarColor(status: TitleAnalysis["status"]) {
  switch (status) {
    case "excellent":
      return "bg-green-500";
    case "good":
      return "bg-blue-500";
    case "needs-improvement":
      return "bg-yellow-500";
    case "critical":
      return "bg-red-500";
  }
}
