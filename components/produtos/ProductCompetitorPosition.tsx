"use client";

import { Trophy, TrendingUp, TrendingDown, Users } from "lucide-react";
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

interface ProductCompetitorPositionProps {
  product: Product;
  compactMode?: boolean;
}

interface CompetitorAnalysis {
  rank: number;
  totalCompetitors: number;
  avgCompetitorPrice: number;
  avgCompetitorRating: number;
  userRating: number;
  pricePosition: "advantage" | "neutral" | "disadvantage";
  ratingPosition: "advantage" | "neutral" | "disadvantage";
  overallStatus: "leading" | "competitive" | "behind";
  recommendations: string[];
}

export default function ProductCompetitorPosition({
  product,
  compactMode = false,
}: ProductCompetitorPositionProps) {
  const analysis = analyzeCompetitorPosition(product);

  if (compactMode) {
    return (
      <Badge
        variant={
          analysis.overallStatus === "leading"
            ? "default"
            : analysis.overallStatus === "competitive"
            ? "default"
            : "destructive"
        }
        className={`${getStatusBgColor(analysis.overallStatus)} text-xs`}
      >
        #{analysis.rank} de {analysis.totalCompetitors}
      </Badge>
    );
  }

  return (
    <Card
      className={`p-3 ${getCardBackground(
        analysis.overallStatus
      )} border-l-4 ${getCardBorder(analysis.overallStatus)}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg ${getIconBackground(
              analysis.overallStatus
            )}`}
          >
            <Trophy
              className={`h-4 w-4 ${getIconColor(analysis.overallStatus)}`}
            />
          </div>
          <h4 className="text-sm font-semibold text-gray-900">
            Posição Competitiva
          </h4>
        </div>
        <Badge
          variant={
            analysis.overallStatus === "behind" ? "destructive" : "default"
          }
          className="text-xs"
        >
          {analysis.overallStatus === "leading"
            ? "Liderando"
            : analysis.overallStatus === "competitive"
            ? "Competitivo"
            : "Atrás"}
        </Badge>
      </div>

      {/* Ranking Display */}
      <div className="bg-white/50 rounded-lg p-3 mb-3 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          {getRankIcon(analysis.rank)}
          <p className="text-2xl font-bold text-gray-900">#{analysis.rank}</p>
        </div>
        <p className="text-xs text-gray-600">
          de {analysis.totalCompetitors} vendedores
        </p>
      </div>

      {/* Metrics Comparison */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Price Position */}
        <div className="bg-white/50 rounded-lg p-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-600">Preço vs Média</p>
            {analysis.pricePosition === "advantage" ? (
              <TrendingDown className="h-3 w-3 text-green-600" />
            ) : analysis.pricePosition === "disadvantage" ? (
              <TrendingUp className="h-3 w-3 text-red-600" />
            ) : (
              <Users className="h-3 w-3 text-blue-600" />
            )}
          </div>
          <p
            className={`text-sm font-bold ${
              analysis.pricePosition === "advantage"
                ? "text-green-700"
                : analysis.pricePosition === "disadvantage"
                ? "text-red-700"
                : "text-blue-700"
            }`}
          >
            R$ {product.price.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">
            Média: R$ {analysis.avgCompetitorPrice.toFixed(2)}
          </p>
        </div>

        {/* Rating Position */}
        <div className="bg-white/50 rounded-lg p-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-600">Avaliação</p>
            {analysis.ratingPosition === "advantage" ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : analysis.ratingPosition === "disadvantage" ? (
              <TrendingDown className="h-3 w-3 text-red-600" />
            ) : (
              <Users className="h-3 w-3 text-blue-600" />
            )}
          </div>
          <p
            className={`text-sm font-bold ${
              analysis.ratingPosition === "advantage"
                ? "text-green-700"
                : analysis.ratingPosition === "disadvantage"
                ? "text-red-700"
                : "text-blue-700"
            }`}
          >
            ⭐ {analysis.userRating.toFixed(1)}
          </p>
          <p className="text-xs text-gray-500">
            Média: ⭐ {analysis.avgCompetitorRating.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-gray-900">Estratégia:</p>
          {analysis.recommendations.map((rec, index) => (
            <div
              key={index}
              className="flex items-start gap-2 text-xs text-gray-700 bg-blue-50/50 rounded p-1.5"
            >
              <span className="font-medium text-blue-700">•</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// Analysis Logic
function analyzeCompetitorPosition(product: Product): CompetitorAnalysis {
  // Mock competitor data (por ml_item_id)
  const competitorData: Record<
    string,
    { rank: number; total: number; avgPrice: number; avgRating: number }
  > = {
    MLB123456: { rank: 2, total: 15, avgPrice: 950, avgRating: 4.2 },
    MLB789012: { rank: 8, total: 12, avgPrice: 120, avgRating: 4.5 },
    MLB345678: { rank: 5, total: 10, avgPrice: 350, avgRating: 4.0 },
  };

  const defaultData = {
    rank: 5,
    total: 10,
    avgPrice: product.price * 1.1,
    avgRating: 4.0,
  };
  const data = competitorData[product.ml_item_id] || defaultData;

  // Mock user rating (based on sold_quantity)
  const userRating =
    product.sold_quantity > 50 ? 4.7 : product.sold_quantity > 20 ? 4.3 : 4.0;

  // Analyze price position
  const priceDifference = product.price - data.avgPrice;
  const priceDiffPercent = (priceDifference / data.avgPrice) * 100;
  let pricePosition: CompetitorAnalysis["pricePosition"];
  if (priceDiffPercent < -5) {
    pricePosition = "advantage"; // Cheaper by >5%
  } else if (priceDiffPercent > 5) {
    pricePosition = "disadvantage"; // More expensive by >5%
  } else {
    pricePosition = "neutral";
  }

  // Analyze rating position
  const ratingDifference = userRating - data.avgRating;
  let ratingPosition: CompetitorAnalysis["ratingPosition"];
  if (ratingDifference > 0.2) {
    ratingPosition = "advantage"; // Higher rating
  } else if (ratingDifference < -0.2) {
    ratingPosition = "disadvantage"; // Lower rating
  } else {
    ratingPosition = "neutral";
  }

  // Overall status
  let overallStatus: CompetitorAnalysis["overallStatus"];
  if (data.rank <= 3) {
    overallStatus = "leading";
  } else if (data.rank <= Math.ceil(data.total / 2)) {
    overallStatus = "competitive";
  } else {
    overallStatus = "behind";
  }

  // Generate recommendations
  const recommendations: string[] = [];
  if (overallStatus === "leading") {
    recommendations.push("Mantenha qualidade e responda rápido a perguntas");
    if (pricePosition === "disadvantage") {
      recommendations.push("Considere reduzir preço para manter liderança");
    }
  } else if (overallStatus === "competitive") {
    if (pricePosition === "disadvantage") {
      recommendations.push("Reduza preço em 5-8% para ganhar posições");
    }
    if (ratingPosition === "disadvantage") {
      recommendations.push(
        "Foque em melhorar atendimento (mais avaliações 5★)"
      );
    }
    recommendations.push(
      "Invista em fotos profissionais e descrições completas"
    );
  } else {
    recommendations.push("Ação urgente: ajuste preço e melhore avaliações");
    recommendations.push(
      "Considere promoções temporárias para aumentar vendas"
    );
    if (product.sold_quantity < 10) {
      recommendations.push("Baixo volume: otimize título e use ML Ads");
    }
  }

  return {
    rank: data.rank,
    totalCompetitors: data.total,
    avgCompetitorPrice: data.avgPrice,
    avgCompetitorRating: data.avgRating,
    userRating,
    pricePosition,
    ratingPosition,
    overallStatus,
    recommendations,
  };
}

// Helper Functions
function getRankIcon(rank: number) {
  if (rank === 1) {
    return <Trophy className="h-5 w-5 text-yellow-500" />;
  } else if (rank === 2) {
    return <Trophy className="h-5 w-5 text-gray-400" />;
  } else if (rank === 3) {
    return <Trophy className="h-5 w-5 text-orange-600" />;
  }
  return null;
}

function getStatusBgColor(status: CompetitorAnalysis["overallStatus"]) {
  switch (status) {
    case "leading":
      return "bg-green-100 text-green-800";
    case "competitive":
      return "bg-blue-100 text-blue-800";
    case "behind":
      return "bg-red-100 text-red-800";
  }
}

function getCardBackground(status: CompetitorAnalysis["overallStatus"]) {
  switch (status) {
    case "leading":
      return "bg-green-50/50";
    case "competitive":
      return "bg-blue-50/50";
    case "behind":
      return "bg-red-50/50";
  }
}

function getCardBorder(status: CompetitorAnalysis["overallStatus"]) {
  switch (status) {
    case "leading":
      return "border-green-500";
    case "competitive":
      return "border-blue-500";
    case "behind":
      return "border-red-500";
  }
}

function getIconBackground(status: CompetitorAnalysis["overallStatus"]) {
  switch (status) {
    case "leading":
      return "bg-green-100";
    case "competitive":
      return "bg-blue-100";
    case "behind":
      return "bg-red-100";
  }
}

function getIconColor(status: CompetitorAnalysis["overallStatus"]) {
  switch (status) {
    case "leading":
      return "text-green-600";
    case "competitive":
      return "text-blue-600";
    case "behind":
      return "text-red-600";
  }
}
