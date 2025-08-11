import crypto from 'crypto';

/**
 * Interface for search parameters used in hash generation
 * Matches the structure saved in prospects_search.search_parameters
 */
export interface SearchParametersForHash {
  companyWebsites: string[];
  companyNames: string[];
  jobRoles: string[];
  jobTitles: string[];
  searchTerm: string;
  selectedCompaniesCount: number;
  selectedPositionsCount: number;
}

/**
 * Normalizes a website URL for consistent hashing
 * Removes protocol, www prefix, trailing slashes, and converts to lowercase
 * Examples: 
 * - "https://www.bp.com/" -> "bp.com"
 * - "www.bp.com" -> "bp.com"
 * - "BP.COM" -> "bp.com"
 */
function normalizeWebsite(website: string): string {
  if (!website) return '';
  
  return website
    .toLowerCase()
    .trim()
    // Remove protocol (http://, https://)
    .replace(/^https?:\/\//, '')
    // Remove www. prefix
    .replace(/^www\./, '')
    // Remove trailing slash
    .replace(/\/$/, '');
}

/**
 * Normalizes search parameters to ensure consistent hash generation
 * - Arrays are sorted alphabetically for deterministic ordering
 * - Strings are trimmed and converted to lowercase
 * - Websites are normalized to remove protocol/www variations
 * - Empty arrays and strings are handled consistently
 */
function normalizeSearchParameters(params: SearchParametersForHash): SearchParametersForHash {
  return {
    // Sort arrays to ensure consistent ordering regardless of input order
    // Normalize websites to handle www/protocol variations
    companyWebsites: [...(params.companyWebsites || [])]
      .map(normalizeWebsite)
      .sort(),
    companyNames: [...(params.companyNames || [])].sort(),
    jobRoles: [...(params.jobRoles || [])].sort(),
    jobTitles: [...(params.jobTitles || [])].sort(),
    // Normalize string: trim whitespace and convert to lowercase
    searchTerm: (params.searchTerm || '').trim().toLowerCase(),
    // Numbers remain as-is
    selectedCompaniesCount: params.selectedCompaniesCount || 0,
    selectedPositionsCount: params.selectedPositionsCount || 0,
  };
}

/**
 * Generates a deterministic SHA-256 hash from search parameters
 * This hash is used for deduplication of prospect searches
 * 
 * @param params - Search parameters to hash
 * @returns 64-character hexadecimal SHA-256 hash
 */
export function generateSearchParametersHash(params: SearchParametersForHash): string {
  try {
    // Normalize parameters for consistent hashing
    const normalized = normalizeSearchParameters(params);
    
    // Serialize to JSON with consistent formatting
    const serialized = JSON.stringify(normalized, Object.keys(normalized).sort());
    
    // Generate SHA-256 hash
    const hash = crypto.createHash('sha256').update(serialized, 'utf8').digest('hex');
    
    console.log(`🔐 [generateSearchParametersHash] Generated hash: ${hash.substring(0, 16)}...`);
    
    return hash;
  } catch (error) {
    console.error('[generateSearchParametersHash] Error generating hash:', error);
    // Fallback: generate a random hash to prevent system failure
    return crypto.randomBytes(32).toString('hex');
  }
}

/**
 * Validates if a hash string is a valid SHA-256 hash
 * @param hash - Hash string to validate
 * @returns true if valid SHA-256 hash format
 */
export function isValidSearchHash(hash: string): boolean {
  return typeof hash === 'string' && /^[a-f0-9]{64}$/i.test(hash);
}
