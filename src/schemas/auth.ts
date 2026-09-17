import * as z from 'zod';

export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export type SignInSchema = z.infer<typeof signInSchema>;
