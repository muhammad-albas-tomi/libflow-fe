import type * as z from 'zod';

import { buildZodErrors } from '~/lib/utils';

export function buildZodErrorResponse(issues: z.core.$ZodIssue[]) {
  const errors = buildZodErrors(issues);

  return {
    type: 'validation_error',
    errors,
    timestamp: new Date().toISOString(),
  };
}
