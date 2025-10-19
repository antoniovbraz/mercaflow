/**
 * Toast Helper Utilities
 * 
 * Fornece funções convenientes para exibir notificações toast consistentes
 * em toda a aplicação MercaFlow.
 * 
 * @module utils/toast-helper
 */

import { toast, type ExternalToast } from "sonner";

/**
 * Exibe uma notificação de sucesso
 * 
 * @example
 * showSuccessToast("Produto sincronizado com sucesso!");
 * 
 * @example
 * showSuccessToast("Pergunta respondida", {
 *   description: "Sua resposta foi enviada ao cliente no Mercado Livre",
 *   action: { label: "Ver", onClick: () => router.push('/perguntas') }
 * });
 */
export function showSuccessToast(
  message: string,
  options?: {
    description?: string;
    action?: { label: string; onClick: () => void };
    duration?: number;
  }
) {
  return toast.success(message, {
    description: options?.description,
    action: options?.action,
    duration: options?.duration || 4000,
  });
}

/**
 * Exibe uma notificação de erro amigável
 * 
 * @example
 * try {
 *   await syncProducts();
 * } catch (error) {
 *   showErrorToast(error);
 * }
 */
export function showErrorToast(
  error: unknown,
  options?: {
    title?: string;
    description?: string;
    action?: { label: string; onClick: () => void };
  }
) {
  const errorMessage = getErrorMessage(error);
  
  return toast.error(options?.title || errorMessage.title, {
    description: options?.description || errorMessage.message,
    action: options?.action,
    duration: 6000, // Erros ficam mais tempo visíveis
  });
}

/**
 * Exibe uma notificação de aviso
 * 
 * @example
 * showWarningToast("Estoque baixo", {
 *   description: "3 produtos com menos de 5 unidades",
 *   action: { label: "Ver produtos", onClick: () => router.push('/produtos?filter=low-stock') }
 * });
 */
export function showWarningToast(
  message: string,
  options?: {
    description?: string;
    action?: { label: string; onClick: () => void };
  }
) {
  return toast.warning(message, {
    description: options?.description,
    action: options?.action,
    duration: 5000,
  });
}

/**
 * Exibe uma notificação informativa
 * 
 * @example
 * showInfoToast("Sincronização agendada", {
 *   description: "Seus produtos serão sincronizados em 5 minutos"
 * });
 */
export function showInfoToast(
  message: string,
  options?: {
    description?: string;
    action?: { label: string; onClick: () => void };
  }
) {
  return toast.info(message, {
    description: options?.description,
    action: options?.action,
    duration: 4000,
  });
}

/**
 * Exibe um toast com loading e converte para sucesso/erro baseado na promise
 * 
 * @example
 * showPromiseToast(
 *   syncAllProducts(),
 *   {
 *     loading: "Sincronizando produtos...",
 *     success: (data) => `${data.count} produtos sincronizados!`,
 *     error: "Erro ao sincronizar produtos",
 *   }
 * );
 */
export function showPromiseToast<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  }
) {
  return toast.promise(promise, {
    loading: messages.loading,
    success: (data) => {
      return typeof messages.success === "function"
        ? messages.success(data)
        : messages.success;
    },
    error: (err) => {
      const errorMsg = typeof messages.error === "function"
        ? messages.error(err)
        : messages.error;
      
      // Log erro para debugging
      console.error("Promise toast error:", err);
      
      return errorMsg;
    },
  });
}

/**
 * Exibe um toast customizado com opções avançadas
 * 
 * @example
 * showCustomToast("Recomendação de Preço", {
 *   description: "Preço ideal: R$ 127,00 (+12% lucro)",
 *   icon: <TrendingUp className="h-4 w-4" />,
 *   action: { label: "Simular", onClick: () => openSimulator() }
 * });
 */
export function showCustomToast(
  message: string,
  options?: ExternalToast & { icon?: React.ReactNode }
) {
  return toast(message, options);
}

/**
 * Dismisses a specific toast by ID
 */
export function dismissToast(toastId: string | number) {
  toast.dismiss(toastId);
}

/**
 * Dismisses all active toasts
 */
export function dismissAllToasts() {
  toast.dismiss();
}

// ========================================
// HELPER INTERNO: Error Message Parser
// ========================================

interface ErrorMessage {
  title: string;
  message: string;
}

/**
 * Converte erros desconhecidos em mensagens amigáveis
 * 
 * @internal
 */
function getErrorMessage(error: unknown): ErrorMessage {
  // Erro padrão
  if (error instanceof Error) {
    // Erros de API do Mercado Livre
    if (error.message.includes("429")) {
      return {
        title: "Limite de requisições atingido",
        message: "Aguarde alguns minutos antes de tentar novamente.",
      };
    }

    if (error.message.includes("401") || error.message.includes("unauthorized")) {
      return {
        title: "Sessão expirada",
        message: "Sua sessão do Mercado Livre expirou. Reconecte sua conta.",
      };
    }

    if (error.message.includes("403") || error.message.includes("forbidden")) {
      return {
        title: "Acesso negado",
        message: "Você não tem permissão para realizar esta ação.",
      };
    }

    if (error.message.includes("404")) {
      return {
        title: "Não encontrado",
        message: "O recurso solicitado não foi encontrado.",
      };
    }

    if (error.message.includes("500")) {
      return {
        title: "Erro no servidor",
        message: "Ocorreu um erro em nossos servidores. Tente novamente.",
      };
    }

    // Network errors
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return {
        title: "Erro de conexão",
        message: "Verifique sua conexão com a internet e tente novamente.",
      };
    }

    // Erro genérico com mensagem personalizada
    return {
      title: "Algo deu errado",
      message: error.message,
    };
  }

  // Objeto de erro com estrutura conhecida
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;

    if (err.error && typeof err.error === "string") {
      return {
        title: "Erro",
        message: err.error,
      };
    }

    if (err.message && typeof err.message === "string") {
      return {
        title: "Erro",
        message: err.message,
      };
    }
  }

  // String como erro
  if (typeof error === "string") {
    return {
      title: "Erro",
      message: error,
    };
  }

  // Fallback genérico
  return {
    title: "Algo deu errado",
    message: "Ocorreu um erro inesperado. Nossa equipe foi notificada.",
  };
}
