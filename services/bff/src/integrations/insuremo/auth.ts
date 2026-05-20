import axios from 'axios';

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export async function getInsureMoToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const res = await axios.post(process.env.INSUREMO_AUTH_URL!, {
    username: process.env.INSUREMO_USERNAME,
    password: process.env.INSUREMO_PASSWORD,
  });

  cachedToken = res.data.access_token;
  tokenExpiry = Date.now() + 55 * 60 * 1000; // 55 min TTL
  return cachedToken!;
}

export function insureMoHeaders() {
  return {
    'Content-Type': 'application/json',
    // Tenant: LimoPOC — ID confirmed from Postman environment export (2026-05-12)
    'X-ebao-tenant-id': process.env.INSUREMO_TENANT_ID ?? 'f63cdb8d-240d-4e26-b0d9-05e9276a65ca',
  };
}
