import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, 'Ime mora imati najmanje 3 karaktera')
      .max(30, 'Ime može imati najviše 30 karaktera')
      .trim(),
    email: z.string().email('Email nije validan'),
    password: z
      .string()
      .min(8, 'Lozinka mora imati najmanje 8 karaktera')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Lozinka mora sadržati veliko slovo, malo slovo i broj'
      ),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email nije validan'),
    password: z.string().min(1, 'Lozinka je obavezna'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
