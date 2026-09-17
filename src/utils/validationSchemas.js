import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(80, 'Full name must not exceed 80 characters')
    .regex(/^[A-Za-z\s]+$/, 'Full name must contain only letters and spaces'),
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  mobileNumber: z
    .string()
    .regex(/^(?:\+91|0091|91|0)?[\s\-]?[6-9]\d{9}$/, 'Must be a valid Indian mobile number starting with 6-9'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password must not exceed 64 characters')
    .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter (A-Z)')
    .regex(/[a-z]/, 'Password must contain at least 1 lowercase letter (a-z)')
    .regex(/[0-9]/, 'Password must contain at least 1 number (0-9)')
    .regex(/[@$!%*?&#\-_.]/, 'Password must contain at least 1 special character (@, $, !, %, *, ?, &, #, -, _, .)'),
});

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(64, 'Password must not exceed 64 characters')
  .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter (A-Z)')
  .regex(/[a-z]/, 'Password must contain at least 1 lowercase letter (a-z)')
  .regex(/[0-9]/, 'Password must contain at least 1 number (0-9)')
  .regex(/[@$!%*?&#\-_.]/, 'Password must contain at least 1 special character (@, $, !, %, *, ?, &, #, -, _, .)');

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email address or mobile number is required')
    .optional(),
  email: z
    .string()
    .min(1, 'Email address or mobile number is required')
    .optional(),
  password: z
    .string()
    .min(1, 'Password is required'),
}).refine((data) => Boolean((data.identifier && data.identifier.trim()) || (data.email && data.email.trim())), {
  message: 'Email address or mobile number is required',
  path: ['identifier'],
});

export const editProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9._]+$/, 'Username can only contain letters, numbers, dots, and underscores'),
  bio: z
    .string()
    .max(200, 'Bio must not exceed 200 characters')
    .optional()
    .or(z.literal('')),
  avatar: z.string().optional(),
});

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9._]+$/, 'Username can only contain letters, numbers, dots, and underscores'),
  bio: z
    .string()
    .max(200, 'Bio must not exceed 200 characters')
    .refine((val) => {
      if (!val || val.trim().length === 0) return true;
      const wordCount = val.trim().split(/\s+/).filter(Boolean).length;
      return wordCount >= 10;
    }, 'Bio must contain at least 10 words'),
  avatar: z.string().optional(),
});
