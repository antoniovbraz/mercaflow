"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import ProductPriceInsight from "./ProductPriceInsight";
import ProductTitleQuality from "./ProductTitleQuality";
import ProductCompetitorPosition from "./ProductCompetitorPosition";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  ml_item_id: string;
  title: string;
  price: number;
  available_quantity: number;
  sold_quantity: number;
  status: string;
  permalink: string;
  thumbnail: string;
  category_id: string;
  last_sync_at: string;
}

interface ProductIntelligenceRowProps {
  product: Product;
  defaultExpanded?: boolean;
}

export default function ProductIntelligenceRow({
  product,
  defaultExpanded = false,
}: ProductIntelligenceRowProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <li className="border-b border-gray-200 last:border-b-0">
      {/* Compact Row */}
      <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-4">
          {/* Product Image */}
          <div className="flex-shrink-0">
            {product.thumbnail ? (
              <Image
                className="h-12 w-12 rounded-lg object-cover"
                src={product.thumbnail}
                alt={product.title}
                width={48}
                height={48}
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-gray-900 truncate pr-4">
                {product.title}
              </p>
              <Badge
                variant={product.status === "active" ? "default" : "secondary"}
                className={getStatusColor(product.status)}
              >
                {getStatusText(product.status)}
              </Badge>
            </div>

            <div className="flex items-center text-sm text-gray-500 flex-wrap gap-x-3 gap-y-1">
              <span className="font-medium text-gray-900">
                R$ {product.price.toFixed(2)}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">
                Estoque: {product.available_quantity}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">
                Vendidos: {product.sold_quantity}
              </span>
            </div>

            {/* Intelligence Badges (Compact) */}
            {!expanded && (
              <div className="flex items-center gap-2 mt-2">
                <ProductPriceInsight product={product} compactMode={true} />
                <ProductTitleQuality product={product} compactMode={true} />
                <ProductCompetitorPosition
                  product={product}
                  compactMode={true}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={product.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              <span className="hidden md:inline">Ver no ML</span>
            </a>
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center px-3 py-1.5 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Recolher</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Insights</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Expanded Intelligence Cards */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ProductPriceInsight product={product} compactMode={false} />
              <ProductTitleQuality product={product} compactMode={false} />
              <ProductCompetitorPosition
                product={product}
                compactMode={false}
              />
            </div>

            {/* Additional Product Details */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span>ID: {product.ml_item_id}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">
                  Categoria: {product.category_id || "N/A"}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                Última sincronização:{" "}
                {new Date(product.last_sync_at).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

// Helper Functions
function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "paused":
      return "bg-yellow-100 text-yellow-800";
    case "closed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getStatusText(status: string) {
  switch (status) {
    case "active":
      return "Ativo";
    case "paused":
      return "Pausado";
    case "closed":
      return "Encerrado";
    default:
      return status;
  }
}
