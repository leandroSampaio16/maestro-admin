/**
 * Utility functions for generating company logo URLs using Logo.dev API
 * Replaces the deprecated Clearbit Logo API
 */

/**
 * Generates a logo URL for a company using Logo.dev API
 * @param website - The company website URL or domain
 * @param options - Optional parameters for logo customization
 * @returns Logo URL string
 */
export function generateLogoUrl(
  website: string | null | undefined,
  options: {
    size?: number;
    format?: 'png' | 'jpg';
    greyscale?: boolean;
    token?: string;
  } = {}
): string {
  // Default options
  const {
    size = 128,
    format = 'png',
    greyscale = false,
    token = 'pk_RFo3bLg8TGekf3aG3a8YMg'
  } = options;

  // Handle empty or null website
  if (!website) {
    return '';
  }

  // Extract domain from URL
  const domain = extractDomainFromUrl(website);
  
  if (!domain) {
    return '';
  }

  // Build query parameters
  const params = new URLSearchParams();
  
  if (token) {
    params.append('token', token);
  }
  
  if (size !== 128) {
    params.append('size', size.toString());
  }
  
  if (format !== 'jpg') {
    params.append('format', format);
  }
  
  if (greyscale) {
    params.append('greyscale', 'true');
  }

  const queryString = params.toString();
  const baseUrl = `https://img.logo.dev/${domain}`;
  
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Extracts domain from a URL string or generates domain variations for company names
 * @param url - URL string, domain, or company name
 * @returns Domain string or null if invalid
 */
function extractDomainFromUrl(url: string): string | null {
  const cleanInput = url.trim();
  
  // If it looks like a URL or domain, parse it normally
  if (cleanInput.includes('.') || cleanInput.startsWith('http')) {
    try {
      // Remove protocol if present
      let cleanUrl = cleanInput;
      
      // Add protocol if missing for URL parsing
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`;
      }
      
      const urlObj = new URL(cleanUrl);
      return urlObj.hostname;
    } catch {
      // If URL parsing fails, try to extract domain manually
      const match = cleanInput.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/);
      return match ? match[1] : null;
    }
  }
  
  // For company names, generate domain variations
  const companyName = cleanInput.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (companyName.length > 0) {
    // Try the most common pattern: companyname.com
    const domain = `${companyName}.com`;
    console.log(`🏢 Generated domain for "${url}": ${domain}`);
    return domain;
  }
  
  return null;
}

/**
 * Legacy function to maintain compatibility with existing Clearbit usage
 * @deprecated Use generateLogoUrl instead
 */
export function getClearbitLogoUrl(domain: string): string {
  return generateLogoUrl(domain, { format: 'png' });
}
