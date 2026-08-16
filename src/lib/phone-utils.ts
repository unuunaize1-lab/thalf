/**
 * Phone Number Utilities for E.164 Normalization and Indian Mobile Validation
 */

/**
 * Normalizes any Indian mobile input into standard E.164 format: +919876543210
 * Handles:
 * - 9876543210 -> +919876543210
 * - +91 9876543210 -> +919876543210
 * - 09876543210 -> +919876543210
 * - +919876543210 -> +919876543210
 */
export function normalizePhoneNumber(input: string): string {
  if (!input) return '';

  // Remove all non-digit characters except leading +
  const trimmed = input.trim();
  const hasLeadingPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');

  if (digitsOnly.length === 10) {
    // Standard 10-digit Indian number without country code
    return `+91${digitsOnly}`;
  }

  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    // 11-digit number with leading 0 (e.g. 09876543210)
    return `+91${digitsOnly.substring(1)}`;
  }

  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    // 12-digit number starting with 91 (e.g. 919876543210)
    return `+${digitsOnly}`;
  }

  if (hasLeadingPlus && digitsOnly.length >= 10) {
    return `+${digitsOnly}`;
  }

  // Return formatted or original cleaned string
  return digitsOnly ? `+${digitsOnly}` : input;
}

/**
 * Validates whether the given string is a valid Indian mobile number.
 * Accepts either a raw 10-digit number or a normalized E.164 string (+91...).
 */
export function isValidIndianMobile(input: string): boolean {
  if (!input) return false;

  const normalized = normalizePhoneNumber(input);
  // Must match strict E.164 pattern: +91 followed by 10 digits starting with 6, 7, 8, 9
  const indianMobileRegex = /^\+91[6-9]\d{9}$/;
  return indianMobileRegex.test(normalized);
}
