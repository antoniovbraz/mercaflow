/**
 * Validation Helper Functions
 * Utility functions for Zod validation, error handling, and type-safe patterns
 */

import { z, ZodError, ZodSchema } from 'zod';
import { NextResponse } from 'next/server';

// ============================================================================
// CUSTOM ERROR CLASSES
// ============================================================================

export class ValidationError extends Error {
  public readonly statusCode = 400;
  public readonly details: z.ZodFormattedError<unknown>;

  constructor(zodError: ZodError) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.details = zodError.format();
  }

  toJSON() {
    return {
      error: 'Validation failed',
      message: this.message,
      details: this.details,
      statusCode: this.statusCode,
    };
  }
}

export class MLApiError extends Error {
  public readonly statusCode: number;
  public readonly mlError?: unknown;

  constructor(message: string, statusCode: number, mlError?: unknown) {
    super(message);
    this.name = 'MLApiError';
    this.statusCode = statusCode;
    this.mlError = mlError;
  }

  toJSON() {
    return {
      error: 'ML API Error',
      message: this.message,
      statusCode: this.statusCode,
      mlError: this.mlError,
    };
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateInput<T extends ZodSchema>(
  schema: T,
  data: unknown
): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(error);
    }
    throw error;
  }
}

export function safeValidateInput<T extends ZodSchema>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: ValidationError } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, error: new ValidationError(result.error) };
}

export function validateOutput<T extends ZodSchema>(
  schema: T,
  data: unknown
): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('ML API response validation failed:', {
        issues: error.issues,
        data: JSON.stringify(data, null, 2).substring(0, 500),
      });
      throw new MLApiError(
        'Invalid response from Mercado Livre API',
        500,
        error.format()
      );
    }
    throw error;
  }
}

export async function validateRequestBody<T extends ZodSchema>(
  schema: T,
  request: Request
): Promise<z.infer<T>> {
  try {
    const body = await request.json();
    return validateInput(schema, body);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ValidationError(
        new ZodError([
          {
            code: 'custom',
            path: [],
            message: 'Invalid JSON in request body',
          },
        ])
      );
    }
    throw error;
  }
}

export function validateQueryParams<T extends ZodSchema>(
  schema: T,
  searchParams: URLSearchParams
): z.infer<T> {
  const params: Record<string, string | string[]> = {};
  
  for (const [key, value] of searchParams.entries()) {
    if (params[key]) {
      params[key] = Array.isArray(params[key])
        ? [...params[key] as string[], value]
        : [params[key] as string, value];
    } else {
      params[key] = value;
    }
  }
  
  return validateInput(schema, params);
}

// ============================================================================
// ERROR RESPONSE BUILDERS
// ============================================================================

export function buildValidationErrorResponse(error: ValidationError): NextResponse {
  return NextResponse.json(error.toJSON(), { status: error.statusCode });
}

export function buildMLApiErrorResponse(error: MLApiError): NextResponse {
  return NextResponse.json(error.toJSON(), { status: error.statusCode });
}

export function buildGenericErrorResponse(error: unknown): NextResponse {
  if (error instanceof ValidationError) {
    return buildValidationErrorResponse(error);
  }
  
  if (error instanceof MLApiError) {
    return buildMLApiErrorResponse(error);
  }
  
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  
  return NextResponse.json(
    {
      error: 'Internal Server Error',
      message,
      statusCode: 500,
    },
    { status: 500 }
  );
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isMLApiError(error: unknown): error is MLApiError {
  return error instanceof MLApiError;
}
