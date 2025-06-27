// Security utilities for input sanitization and validation

import DOMPurify from 'dompurify';

// IPFS URI validation and sanitization
export const sanitizeIPFSUri = (uri: string): string => {
  if (!uri) throw new Error('URI is required');
  
  // Check if it's a valid IPFS URI
  if (!uri.startsWith('ipfs://')) {
    throw new Error('Invalid IPFS URI format');
  }
  
  // Extract hash and validate
  const hash = uri.replace('ipfs://', '');
  const ipfsHashRegex = /^[A-Za-z0-9]{46,}$/;
  
  if (!ipfsHashRegex.test(hash)) {
    throw new Error('Invalid IPFS hash format');
  }
  
  // Remove any potential XSS characters
  return uri.replace(/[<>]/g, '');
};

// Ethereum address validation and sanitization
export const sanitizeAddress = (address: string): string => {
  if (!address) throw new Error('Address is required');
  
  // Check basic format
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error('Invalid Ethereum address format');
  }
  
  // Return lowercase for consistency
  return address.toLowerCase();
};

// Input sanitization for user-generated content
export const sanitizeUserInput = (input: string, options: {
  maxLength?: number;
  allowedTags?: string[];
  stripHTML?: boolean;
} = {}): string => {
  const {
    maxLength = 1000,
    allowedTags = [],
    stripHTML = true
  } = options;
  
  if (!input) return '';
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Check length
  if (sanitized.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
  }
  
  if (stripHTML) {
    // Remove all HTML if not allowed
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  } else {
    // Use DOMPurify to sanitize HTML while keeping allowed tags
    if (typeof window !== 'undefined') {
      sanitized = DOMPurify.sanitize(sanitized, { 
        ALLOWED_TAGS: allowedTags,
        ALLOWED_ATTR: []
      });
    }
  }
  
  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>]/g, '');
  
  // Prevent script injection
  if (/script|javascript|on\w+=/i.test(sanitized)) {
    throw new Error('Potentially dangerous content detected');
  }
  
  return sanitized;
};

// URL validation and sanitization
export const sanitizeURL = (url: string, allowedDomains?: string[]): string => {
  if (!url) throw new Error('URL is required');
  
  try {
    const urlObj = new URL(url);
    
    // Only allow HTTPS and IPFS protocols
    if (!['https:', 'ipfs:'].includes(urlObj.protocol)) {
      throw new Error('Only HTTPS and IPFS protocols are allowed');
    }
    
    // Check allowed domains if specified
    if (allowedDomains && urlObj.protocol === 'https:') {
      const isAllowed = allowedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
      );
      
      if (!isAllowed) {
        throw new Error('Domain not in allowed list');
      }
    }
    
    return url;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid URL')) {
      throw new Error('Invalid URL format');
    }
    throw error;
  }
};

// Number validation and sanitization
export const sanitizeNumber = (value: any, options: {
  min?: number;
  max?: number;
  integer?: boolean;
  positive?: boolean;
} = {}): number => {
  const {
    min,
    max,
    integer = false,
    positive = true
  } = options;
  
  const num = Number(value);
  
  if (isNaN(num) || !isFinite(num)) {
    throw new Error('Invalid number');
  }
  
  if (positive && num <= 0) {
    throw new Error('Number must be positive');
  }
  
  if (integer && !Number.isInteger(num)) {
    throw new Error('Number must be an integer');
  }
  
  if (min !== undefined && num < min) {
    throw new Error(`Number must be at least ${min}`);
  }
  
  if (max !== undefined && num > max) {
    throw new Error(`Number must be at most ${max}`);
  }
  
  return num;
};

// File validation and sanitization
export const validateFile = (file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
} = {}): void => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
  } = options;
  
  // Check file size
  if (file.size > maxSize) {
    throw new Error(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
  }
  
  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`);
  }
  
  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    throw new Error(`File extension ${extension} is not allowed`);
  }
  
  // Check for potential malicious file names
  if (/[<>:"/\\|?*]/.test(file.name) || file.name.includes('..')) {
    throw new Error('Invalid file name');
  }
};

// Rate limiting utilities
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
  
  getRemainingRequests(identifier: string): number {
    const requests = this.requests.get(identifier) || [];
    const now = Date.now();
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

// Global rate limiter instances
export const contractRateLimiter = new RateLimiter(5, 60000); // 5 per minute
export const ipfsRateLimiter = new RateLimiter(20, 60000); // 20 per minute
export const apiRateLimiter = new RateLimiter(30, 60000); // 30 per minute

// Content Security Policy helpers
export const getSecureHeaders = () => ({
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Needed for Next.js
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://ipfs.io https://*.ipfs.io",
    "connect-src 'self' https: wss:",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
});

// XSS Protection utility
export const escapeHTML = (str: string): string => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

// SQL Injection prevention (for any backend queries)
export const sanitizeForSQL = (input: string): string => {
  return input.replace(/['";\\]/g, '');
};

// Environment variable validation
export const validateEnvVar = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  
  // Check for potentially dangerous values
  if (value.includes('<script') || value.includes('javascript:')) {
    throw new Error(`Environment variable ${name} contains dangerous content`);
  }
  
  return value;
};

// Secure random string generation
export const generateSecureId = (length: number = 32): string => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback for environments without crypto API
  return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

// Hash sensitive data (for logging/analytics)
export const hashSensitiveData = async (data: string): Promise<string> => {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Simple hash fallback
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
};