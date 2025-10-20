"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Star,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { logger } from "@/utils/logger";

interface CompetitorData {
  id: string;
  name: string;
  rank: number;
  price: number;
  sales: number;
  rating: number;
  reviews: number;
  reputation: string;
  shipping: string;
  priceChange: number;
  isYou: boolean;
}

interface CompetitorAnalysisProps {
  productId?: string;
  category?: string;
}

export function CompetitorAnalysis({
  productId,
  category = "Eletrônicos",
}: CompetitorAnalysisProps) {
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [yourPosition, setYourPosition] = useState<number>(0);
  const [marketAverage, setMarketAverage] = useState<number>(0);

  useEffect(() => {
    const fetchCompetitorData = async () => {
      try {
        setIsLoading(true);

        // TODO: Substituir com API real /api/analytics/competitors
        // const response = await fetch(`/api/analytics/competitors${productId ? `?productId=${productId}` : `?category=${category}`}`);
        // const result = await response.json();

        // Mock data - 15 competidores realistas
        const mockCompetitors: CompetitorData[] = [
          {
            id: "1",
            name: "TechStore Premium",
            rank: 1,
            price: 899,
            sales: 1250,
            rating: 4.9,
            reviews: 3240,
            reputation: "Platinum",
            shipping: "Full",
            priceChange: -2.5,
            isYou: false,
          },
          {
            id: "2",
            name: "Você",
            rank: 2,
            price: 950,
            sales: 1100,
            rating: 4.7,
            reviews: 2180,
            reputation: "Gold",
            shipping: "Full",
            priceChange: 0,
            isYou: true,
          },
          {
            id: "3",
            name: "MegaEletronics",
            rank: 3,
            price: 920,
            sales: 980,
            rating: 4.8,
            reviews: 2890,
            reputation: "Platinum",
            shipping: "Full",
            priceChange: 1.2,
            isYou: false,
          },
          {
            id: "4",
            name: "GadgetsPro",
            rank: 4,
            price: 970,
            sales: 850,
            rating: 4.6,
            reviews: 1670,
            reputation: "Gold",
            shipping: "Standard",
            priceChange: -0.8,
            isYou: false,
          },
          {
            id: "5",
            name: "ElectroMart",
            rank: 5,
            price: 1000,
            sales: 720,
            rating: 4.5,
            reviews: 1450,
            reputation: "Gold",
            shipping: "Full",
            priceChange: 3.5,
            isYou: false,
          },
          {
            id: "6",
            name: "TechZone",
            rank: 6,
            price: 880,
            sales: 690,
            rating: 4.4,
            reviews: 980,
            reputation: "Silver",
            shipping: "Standard",
            priceChange: -1.5,
            isYou: false,
          },
          {
            id: "7",
            name: "SmartDeals",
            rank: 7,
            price: 1050,
            sales: 620,
            rating: 4.7,
            reviews: 1320,
            reputation: "Gold",
            shipping: "Full",
            priceChange: 2.1,
            isYou: false,
          },
          {
            id: "8",
            name: "EletroPlus",
            rank: 8,
            price: 890,
            sales: 580,
            rating: 4.3,
            reviews: 760,
            reputation: "Silver",
            shipping: "Standard",
            priceChange: -0.5,
            isYou: false,
          },
          {
            id: "9",
            name: "SuperTech",
            rank: 9,
            price: 1100,
            sales: 520,
            rating: 4.6,
            reviews: 1140,
            reputation: "Gold",
            shipping: "Full",
            priceChange: 4.2,
            isYou: false,
          },
          {
            id: "10",
            name: "TechnoSeller",
            rank: 10,
            price: 940,
            sales: 480,
            rating: 4.2,
            reviews: 620,
            reputation: "Silver",
            shipping: "Standard",
            priceChange: 1.8,
            isYou: false,
          },
          {
            id: "11",
            name: "GadgetHub",
            rank: 11,
            price: 860,
            sales: 450,
            rating: 4.1,
            reviews: 540,
            reputation: "Bronze",
            shipping: "Standard",
            priceChange: -2.1,
            isYou: false,
          },
          {
            id: "12",
            name: "ElectroShop",
            rank: 12,
            price: 1080,
            sales: 420,
            rating: 4.4,
            reviews: 890,
            reputation: "Silver",
            shipping: "Full",
            priceChange: 3.8,
            isYou: false,
          },
          {
            id: "13",
            name: "TechWorld",
            rank: 13,
            price: 910,
            sales: 380,
            rating: 4.0,
            reviews: 450,
            reputation: "Bronze",
            shipping: "Standard",
            priceChange: 0.5,
            isYou: false,
          },
          {
            id: "14",
            name: "MegaTech",
            rank: 14,
            price: 1120,
            sales: 340,
            rating: 4.3,
            reviews: 720,
            reputation: "Silver",
            shipping: "Full",
            priceChange: 5.2,
            isYou: false,
          },
          {
            id: "15",
            name: "Eletronics24",
            rank: 15,
            price: 850,
            sales: 310,
            rating: 3.9,
            reviews: 380,
            reputation: "Bronze",
            shipping: "Standard",
            priceChange: -3.2,
            isYou: false,
          },
        ];

        setCompetitors(mockCompetitors);

        // Calcular posição e média
        const yourData = mockCompetitors.find((c) => c.isYou);
        setYourPosition(yourData?.rank || 0);

        const avgPrice =
          mockCompetitors.reduce((sum, c) => sum + c.price, 0) /
          mockCompetitors.length;
        setMarketAverage(avgPrice);

        logger.info("Competitor data loaded", {
          competitors: mockCompetitors.length,
          yourRank: yourPosition,
        });
      } catch (error) {
        logger.error("Failed to fetch competitor data", { error });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompetitorData();
  }, [productId, category, yourPosition]);

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Analisando concorrência...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getReputationColor = (reputation: string) => {
    switch (reputation) {
      case "Platinum":
        return "bg-purple-100 text-purple-800";
      case "Gold":
        return "bg-yellow-100 text-yellow-800";
      case "Silver":
        return "bg-gray-100 text-gray-800";
      case "Bronze":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-5 h-5 text-orange-600" />;
    return <span className="text-sm text-gray-600">#{rank}</span>;
  };

  const yourData = competitors.find((c) => c.isYou);
  const priceDiffFromAvg = yourData
    ? ((yourData.price - marketAverage) / marketAverage) * 100
    : 0;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Sua Posição */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Sua Posição
              </span>
              <Trophy className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{yourPosition}º</p>
            <p className="text-xs text-gray-500 mt-2">De 15 vendedores</p>
          </CardContent>
        </Card>

        {/* Seu Preço */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Seu Preço
              </span>
              <AlertCircle className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(yourData?.price || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {priceDiffFromAvg > 0 ? "+" : ""}
              {priceDiffFromAvg.toFixed(1)}% vs média
            </p>
          </CardContent>
        </Card>

        {/* Preço Médio */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Preço Médio
              </span>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(marketAverage)}
            </p>
            <p className="text-xs text-gray-500 mt-2">Mercado</p>
          </CardContent>
        </Card>

        {/* Vantagem Competitiva */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Vantagem
              </span>
              <Star className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {yourData?.rating.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {yourData?.reviews} avaliações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Competitor Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Ranking Competitivo - {category}
              </h3>
              <p className="text-xs text-gray-600">
                Comparação com principais concorrentes do mercado
              </p>
            </div>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right">Vendas</TableHead>
                  <TableHead className="text-center">Rating</TableHead>
                  <TableHead>Reputação</TableHead>
                  <TableHead>Envio</TableHead>
                  <TableHead className="text-right">Variação</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitors.map((competitor) => (
                  <TableRow
                    key={competitor.id}
                    className={
                      competitor.isYou
                        ? "bg-green-50 hover:bg-green-100 border-l-4 border-green-500"
                        : ""
                    }
                  >
                    <TableCell className="font-medium">
                      {getRankIcon(competitor.rank)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-medium ${
                            competitor.isYou
                              ? "text-green-700"
                              : "text-gray-900"
                          }`}
                        >
                          {competitor.name}
                        </span>
                        {competitor.isYou && (
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-700 border-green-300"
                          >
                            Você
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(competitor.price)}
                    </TableCell>
                    <TableCell className="text-right text-gray-600">
                      {competitor.sales.toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {competitor.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({competitor.reviews})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getReputationColor(competitor.reputation)}
                      >
                        {competitor.reputation}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          competitor.shipping === "Full"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-gray-50 text-gray-700"
                        }
                      >
                        {competitor.shipping}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className={`flex items-center justify-end space-x-1 ${
                          competitor.priceChange > 0
                            ? "text-red-600"
                            : competitor.priceChange < 0
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}
                      >
                        {competitor.priceChange > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : competitor.priceChange < 0 ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : null}
                        <span className="text-sm font-medium">
                          {competitor.priceChange > 0 ? "+" : ""}
                          {competitor.priceChange.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="w-8 h-8">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Oportunidade */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            💡 Oportunidade Detectada
          </h4>
          <p className="text-xs text-blue-800">
            {priceDiffFromAvg > 5
              ? `Seu preço está ${Math.abs(priceDiffFromAvg).toFixed(
                  1
                )}% acima da média. Considere reduzir para aumentar competitividade.`
              : priceDiffFromAvg < -5
              ? `Seu preço está ${Math.abs(priceDiffFromAvg).toFixed(
                  1
                )}% abaixo da média. Você pode aumentar margem sem perder vendas.`
              : "Seu preço está alinhado com o mercado. Mantenha competitividade via qualidade e atendimento."}
          </p>
        </div>

        {/* Estratégia */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center">
            <Trophy className="w-4 h-4 mr-2" />
            🎯 Estratégia Sugerida
          </h4>
          <p className="text-xs text-green-800">
            {yourPosition <= 3
              ? "Posição forte! Foque em manter qualidade, responder perguntas rápido e oferecer envio Full."
              : yourPosition <= 7
              ? "Melhore avaliações respondendo compradores e otimize fotos/descrição para subir no ranking."
              : "Considere promoção temporária + envio Full para ganhar tração e melhorar posicionamento."}
          </p>
        </div>
      </div>
    </div>
  );
}
