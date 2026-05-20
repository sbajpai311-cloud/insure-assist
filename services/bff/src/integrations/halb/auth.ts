import axios from 'axios';

// HALB tenant — inecosystem
// Auth: simple credential-based token (replaces Microsoft SSO when Azure AD is unavailable)
// Swap back to MSAL when Azure AD credentials are available.

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export async function getHalbToken(_agentAccountId?: string): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  // If HALB username/password are provided, exchange them for a token
  const username = process.env.INSUREMO_HALB_USERNAME;
  const password = process.env.INSUREMO_HALB_PASSWORD;
  const authUrl  = process.env.INSUREMO_HALB_AUTH_URL
    ?? 'https://inecosystem-gimc.insuremo.com/cas/ebao/v1/json/tickets';

  if (username && password) {
    const res = await axios.post(authUrl, { username, password });
    cachedToken  = res.data.access_token;
    tokenExpiry  = Date.now() + 55 * 60 * 1000;
    return cachedToken!;
  }

  // Fallback: use a mock token so the rest of the app still works in dev/demo
  cachedToken = 'MOCK_HALB_TOKEN_DEV';
  tokenExpiry  = Date.now() + 55 * 60 * 1000;
  return cachedToken;
}

export async function halbHeaders(agentAccountId?: string) {
  const token = await getHalbToken(agentAccountId);
  return {
    'Content-Type':     'application/json',
    'Authorization':    `Bearer ${token}`,
    'X-ebao-tenant-id': 'inecosystem',
  };
}

export const HALB_API_BASE = process.env.INSUREMO_HALB_API_BASE
  ?? 'https://inecosystem-gimc.insuremo.com/proposal/v1';
