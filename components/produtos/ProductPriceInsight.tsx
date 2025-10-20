"use client";

import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react";
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

interface ProductPriceInsightProps {
  product: Product;
  compactMode?: boolean;
}

interface PriceAnalysis {
  currentPrice: number;
  optimalPrice: number;
  difference: number;
  differencePercent: number;
  elasticity: number;
  estimatedROI: number;
  recommendation: string;
  status: "optimal" | "opportunity" | "critical";
}

export default function ProductPriceInsight({
  product,
  compactMode = false,
}: ProductPriceInsightProps) {
  const analysis = analyzePriceOptimization(product);

  if (compactMode) {
    return (
      <Badge
        variant={
          analysis.status === "optimal"
            ? "default"
            : analysis.status === "opportunity"
              ? "default"
              : "destructive"
        }
        className={`${getStatusBgColor(analysis.status)} text-xs`}
      >
        {analysis.differencePercent > 0 ? "↑" : "↓"}{" "}
        {Math.abs(analysis.differencePercent).toFixed(0)}% preço
      </Badge>
    );
  }

  return (
    <Card className={`p-3 ${getCardBackground(analysis.status)} border-l-4 ${getCardBorder(analysis.status)}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${getIconBackground(analysis.status)}`}>
            <DollarSign className={`h-4 w-4 ${getIconColor(analysis.status)}`} />
          </div>
          <h4 className="text-sm font-semibold text-gray-900">
            Otimização de Preço
          </h4>
        </div>
        <Badge
          variant={analysis.status === "critical" ? "destructive" : "default"}
          className="text-xs"
        >
          {analysis.status === "optimal"
            ? "Ótimo"
            : analysis.status === "opportunity"
              ? "Oportunidade"
              : "Crítico"}
        </Badge>
      </div>

      {/* Current vs Optimal */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white/50 rounded-lg p-2">
          <p className="text-xs text-gray-600 mb-1">Preço Atual</p>
          <p className="text-lg font-bold text-gray-900">
            R$ {analysis.currentPrice.toFixed(2)}
          </p>
        </div>
        <div className="bg-white/50 rounded-lg p-2">
          <p className="text-xs text-gray-600 mb-1">Preço Ótimo</p>
          <p className="text-lg font-bold text-green-700">
            R$ {analysis.optimalPrice.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Recommendation */}
      <div className="flex items-start gap-2 mb-3">
        {analysis.differencePercent > 0 ? (
          <TrendingUp className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
        ) : (
          <TrendingDown className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-900">
            {analysis.recommendation}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Elasticidade: {analysis.elasticity.toFixed(2)} (
            {Math.abs(analysis.elasticity) > 1.5
              ? "Muito elástico"
              : Math.abs(analysis.elasticity) > 1.0
                ? "Moderado"
                : "Inelástico"}
            )
          </p>
        </div>
      </div>

      {/* ROI Estimate */}
      {analysis.estimatedROI > 0 && (
        <div className="flex items-center gap-2 p-2 bg-blue-50/50 rounded-lg border border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <p className="text-xs text-blue-900">
            <strong>ROI estimado:</strong> R${" "}
            {analysis.estimatedROI.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            por mês
          </p>
        </div>
      )}
    </Card>
  );
}

// Analysis Logic
function analyzePriceOptimization(product: Product): PriceAnalysis {
  const currentPrice = product.price;

  // Mock elasticity map (por ml_item_id)
  const elasticityMap: Record<string, number> = {
    MLB123456: -1.8, // Muito elástico
    MLB789012: -0.4, // Inelástico
    MLB345678: -1.2, // Moderado
  };

  const elasticity = elasticityMap[product.ml_item_id] || -1.0;

  // Calculate optimal price based on elasticity
  // Elástico (< -1): pode baixar preço para aumentar volume
  // Inelástico (> -1): pode subir preço sem perder muito volume
  let optimalPrice: number;
  if (Math.abs(elasticity) > 1.5) {
    // Muito elástico: reduzir 10-15%
    optimalPrice = currentPrice * 0.88;
  } else if (Math.abs(elasticity) < 0.8) {
    // Inelástico: aumentar 8-12%
    optimalPrice = currentPrice * 1.1;
  } else {
    // Moderado: ajuste fino ±5%
    optimalPrice = currentPrice * (elasticity > -1 ? 1.05 : 0.96);
  }

  const difference = optimalPrice - currentPrice;
  const differencePercent = (difference / currentPrice) * 100;

  // Estimate ROI (simplified)
  const monthlySales = product.sold_quantity > 0 ? product.sold_quantity : 5; // default 5/month
  const revenueChange = difference * monthlySales;
  const volumeChange =
    difference < 0
      ? monthlySales * Math.abs(elasticity) * 0.15
      : -monthlySales * Math.abs(elasticity) * 0.1;
  const estimatedROI = Math.max(0, revenueChange + volumeChange * optimalPrice);

  // Determine status
  let status: PriceAnalysis["status"];
  if (Math.abs(differencePercent) < 3) {
    status = "optimal";
  } else if (Math.abs(differencePercent) < 15) {
    status = "opportunity";
  } else {
    status = "critical";
  }

  // Generate recommendation
  let recommendation: string;
  if (difference > 0) {
    recommendation = `Aumente ${Math.abs(differencePercent).toFixed(1)}% para R$ ${optimalPrice.toFixed(2)}`;
  } else if (difference < 0) {
    recommendation = `Reduza ${Math.abs(differencePercent).toFixed(1)}% para R$ ${optimalPrice.toFixed(2)}`;
  } else {
    recommendation = "Preço está no ponto ótimo";
  }

  return {
    currentPrice,
    optimalPrice,
    difference,
    differencePercent,
    elasticity,
    estimatedROI,
    recommendation,
    status,
  };
}

// Helper Functions
function getStatusBgColor(status: PriceAnalysis["status"]) {
  switch (status) {
    case "optimal":
      return "bg-green-100 text-green-800";
    case "opportunity":
      return "bg-blue-100 text-blue-800";
    case "critical":
      return "bg-red-100 text-red-800";
  }
}

function getCardBackground(status: PriceAnalysis["status"]) {
  switch (status) {
    case "optimal":
      return "bg-green-50/50";
    case "opportunity":
      return "bg-blue-50/50";
    case "critical":
      return "bg-red-50/50";
  }
}

function getCardBorder(status: PriceAnalysis["status"]) {
  switch (status) {
    case "optimal":
      return "border-green-500";
    case "opportunity":
      return "border-blue-500";
    case "critical":
      return "border-red-500";
  }
}

function getIconBackground(status: PriceAnalysis["status"]) {
  switch (status) {
    case "optimal":
      return "bg-green-100";
    case "opportunity":
      return "bg-blue-100";
    case "critical":
      return "bg-red-100";
  }
}

function getIconColor(status: PriceAnalysis["status"]) {
  switch (status) {
    case "optimal":
      return "text-green-600";
    case "opportunity":
      return "text-blue-600";
    case "critical":
      return "text-red-600";
  }
}
