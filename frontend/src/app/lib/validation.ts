import { z } from 'zod';

// Common validation patterns
export const addressRegex = /^0x[a-fA-F0-9]{40}$/;
export const ipfsHashRegex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;

// Base schemas
export const addressSchema = z.string()
  .regex(addressRegex, 'Invalid Ethereum address')
  .length(42, 'Address must be 42 characters');

export const bigintSchema = z.union([
  z.string().transform((val) => {
    try {
      return BigInt(val);
    } catch {
      throw new Error('Invalid number format');
    }
  }),
  z.bigint(),
]);

export const positiveNumberSchema = z.number()
  .positive('Must be a positive number')
  .finite('Must be a finite number');

export const currencySchema = z.string()
  .regex(/^\d+(\.\d{1,6})?$/, 'Invalid currency format')
  .transform((val) => parseFloat(val))
  .refine((val) => val > 0, 'Amount must be greater than 0');

// Property NFT minting schema
export const propertyMintSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_.,()]+$/, 'Name contains invalid characters'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  
  location: z.string()
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location must be less than 200 characters'),
  
  propertyType: z.enum(['residential', 'commercial', 'industrial', 'land'], {
    errorMap: () => ({ message: 'Please select a valid property type' }),
  }),
  
  value: currencySchema
    .refine((val) => val >= 1000, 'Property value must be at least $1,000')
    .refine((val) => val <= 100_000_000, 'Property value must be less than $100M'),
  
  sqft: z.number()
    .int('Square footage must be a whole number')
    .min(100, 'Square footage must be at least 100')
    .max(1_000_000, 'Square footage must be less than 1,000,000'),
  
  yearBuilt: z.number()
    .int('Year must be a whole number')
    .min(1800, 'Year built must be after 1800')
    .max(new Date().getFullYear(), 'Year built cannot be in the future')
    .optional(),
  
  bedrooms: z.number()
    .int('Bedrooms must be a whole number')
    .min(0, 'Bedrooms must be 0 or more')
    .max(50, 'Bedrooms must be less than 50')
    .optional(),
  
  bathrooms: z.number()
    .min(0, 'Bathrooms must be 0 or more')
    .max(50, 'Bathrooms must be less than 50')
    .optional(),
  
  image: z.instanceof(File, { message: 'Please select an image file' })
    .refine((file) => file.size <= 10 * 1024 * 1024, 'Image must be less than 10MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Image must be JPEG, PNG, or WebP'
    ),
});

// Loan creation schema with dynamic validation
export const createLoanSchema = z.object({
  tokenId: z.string()
    .min(1, 'Please select a property'),
  
  amount: currencySchema
    .refine((val) => val >= 1000, 'Loan amount must be at least $1,000'),
  
  interestRate: z.number()
    .min(0.1, 'Interest rate must be at least 0.1%')
    .max(50, 'Interest rate must be less than 50%')
    .optional(),
  
  duration: z.number()
    .int('Duration must be a whole number')
    .min(1, 'Duration must be at least 1 month')
    .max(360, 'Duration must be less than 360 months')
    .optional(),
}).superRefine((data, ctx) => {
  // Custom validation logic can be added here
  // For example, checking if the loan amount doesn't exceed property LTV
});

// Enhanced loan creation schema with property context
export const createLoanSchemaWithProperty = (propertyValue: number) => 
  createLoanSchema.extend({
    amount: currencySchema
      .refine((val) => val >= 1000, 'Loan amount must be at least $1,000')
      .refine(
        (val) => val <= propertyValue * 0.8, 
        `Loan amount cannot exceed 80% of property value ($${(propertyValue * 0.8).toLocaleString()})`
      ),
  });

// USDC approval schema
export const approvalSchema = z.object({
  amount: currencySchema
    .refine((val) => val > 0, 'Approval amount must be greater than 0'),
  
  spender: addressSchema,
});

// Risk assessment schema
export const riskAssessmentSchema = z.object({
  propertyValue: positiveNumberSchema
    .min(1000, 'Property value must be at least $1,000')
    .max(100_000_000, 'Property value must be less than $100M'),
  
  propertyType: z.enum(['residential', 'commercial', 'industrial', 'land']),
  
  location: z.string()
    .min(2, 'Location must be at least 2 characters')
    .max(200, 'Location must be less than 200 characters'),
  
  yearBuilt: z.number()
    .int('Year must be a whole number')
    .min(1800, 'Year built must be after 1800')
    .max(new Date().getFullYear(), 'Year built cannot be in the future'),
  
  squareFootage: z.number()
    .int('Square footage must be a whole number')
    .min(100, 'Square footage must be at least 100')
    .max(1_000_000, 'Square footage must be less than 1,000,000'),
  
  loanAmount: positiveNumberSchema
    .min(1000, 'Loan amount must be at least $1,000'),
  
  borrowerCreditScore: z.number()
    .int('Credit score must be a whole number')
    .min(300, 'Credit score must be at least 300')
    .max(850, 'Credit score must be at most 850')
    .optional(),
  
  debtToIncomeRatio: z.number()
    .min(0, 'Debt-to-income ratio must be 0% or higher')
    .max(100, 'Debt-to-income ratio must be 100% or lower')
    .optional(),
});

// Search and filter schemas
export const propertyFilterSchema = z.object({
  priceRange: z.tuple([z.number(), z.number()])
    .refine(([min, max]) => min < max, 'Minimum price must be less than maximum price')
    .optional(),
  
  riskLevel: z.enum(['low', 'medium', 'high']).optional(),
  
  propertyType: z.enum(['residential', 'commercial', 'industrial', 'land']).optional(),
  
  location: z.string()
    .max(100, 'Location filter must be less than 100 characters')
    .optional(),
  
  sqftRange: z.tuple([z.number(), z.number()])
    .refine(([min, max]) => min < max, 'Minimum sqft must be less than maximum sqft')
    .optional(),
});

export const searchSchema = z.object({
  query: z.string()
    .max(200, 'Search query must be less than 200 characters')
    .optional(),
  
  filters: propertyFilterSchema.optional(),
});

// Cross-chain transaction schema
export const crossChainTransactionSchema = z.object({
  destinationChainId: z.number()
    .int('Chain ID must be a whole number')
    .positive('Chain ID must be positive'),
  
  amount: currencySchema,
  
  recipient: addressSchema.optional(),
  
  gasLimit: z.number()
    .int('Gas limit must be a whole number')
    .min(21000, 'Gas limit must be at least 21,000')
    .max(10_000_000, 'Gas limit must be less than 10,000,000')
    .optional(),
});

// Form field validation helpers
export const validateFormField = <T>(
  schema: z.ZodSchema<T>,
  value: unknown
): { isValid: boolean; error?: string } => {
  try {
    schema.parse(value);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.errors[0]?.message || 'Invalid input',
      };
    }
    return {
      isValid: false,
      error: 'Validation failed',
    };
  }
};

// Real-time validation debounced
export const createDebouncedValidator = <T>(
  schema: z.ZodSchema<T>,
  delay: number = 300
) => {
  let timeout: NodeJS.Timeout;
  
  return (value: unknown, callback: (result: { isValid: boolean; error?: string }) => void) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback(validateFormField(schema, value));
    }, delay);
  };
};

// Type exports for form data
export type PropertyMintFormData = z.infer<typeof propertyMintSchema>;
export type CreateLoanFormData = z.infer<typeof createLoanSchema>;
export type RiskAssessmentFormData = z.infer<typeof riskAssessmentSchema>;
export type PropertyFilterFormData = z.infer<typeof propertyFilterSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type CrossChainTransactionFormData = z.infer<typeof crossChainTransactionSchema>;