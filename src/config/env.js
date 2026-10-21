/**
 * Centralized Environment Configuration for Mann Ki Aavaj Frontend
 * Controls API base URL and Socket.IO connection URL dynamically based on VITE_ENVIRONMENT.
 */

export const ENV_MODES = {
  PRODUCTION: 'production',
  LOCAL: 'local',
  TESTING: 'testing',
};

// Helper function to sanitize URL string values and strip unwanted brackets or quotes if present
const sanitizeUrl = (url) => {
  if (!url) return '';
  return url.trim().replace(/^\[|\]$/g, '').replace(/^"|"$/g, '').replace(/^'|'$/g, '');
};

const metaEnv = import.meta.env || {};
const rawEnv = (metaEnv.VITE_ENVIRONMENT || '').trim().toLowerCase();
const currentEnvMode = rawEnv || (metaEnv.DEV ? ENV_MODES.LOCAL : ENV_MODES.PRODUCTION);

const prodApiUrl = sanitizeUrl(metaEnv.VITE_PRODUCTION_URL) || 'https://api.awaazmanki.com';
const prodSocketUrl = sanitizeUrl(metaEnv.VITE_PRODUCTION_SOCKET_URL) || 'https://socketapi.awaazmanki.com';

const localApiUrl = sanitizeUrl(metaEnv.VITE_LOCAL_URL) || 'http://localhost:8080';
const localSocketUrl = sanitizeUrl(metaEnv.VITE_LOCAL_SOCKET_URL) || 'http://localhost:8085';

const testingApiUrl = sanitizeUrl(metaEnv.VITE_TESTING_URL);
const testingSocketUrl = sanitizeUrl(metaEnv.VITE_TESTING_SOCKET_URL);

let selectedApiUrl = localApiUrl;
let selectedSocketUrl = localSocketUrl;

if (currentEnvMode === ENV_MODES.PRODUCTION) {
  selectedApiUrl = prodApiUrl;
  selectedSocketUrl = prodSocketUrl;
} else if (currentEnvMode === ENV_MODES.TESTING) {
  if (!testingApiUrl || !testingSocketUrl) {
    const errorMsg = `[Environment Config Error]: VITE_ENVIRONMENT is set to 'testing', but VITE_TESTING_URL or VITE_TESTING_SOCKET_URL is missing. Testing environment must have explicit testing URLs configured.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  selectedApiUrl = testingApiUrl;
  selectedSocketUrl = testingSocketUrl;
} else {
  selectedApiUrl = localApiUrl;
  selectedSocketUrl = localSocketUrl;
}

export const API_BASE_URL = selectedApiUrl;
export const SOCKET_URL = selectedSocketUrl;
export const ENVIRONMENT = currentEnvMode;
export const SERVER_URL = API_BASE_URL;

/**
 * Resolves relative media URLs against the API base selected for the current environment.
 */
export const getMediaUrl = (url) => {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('/src/') ||
    url.startsWith('/assets/') ||
    url.startsWith('/@')
  ) {
    return url;
  }
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${SERVER_URL}${cleanUrl}`;
};
