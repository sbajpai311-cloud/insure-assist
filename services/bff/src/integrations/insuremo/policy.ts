import axios from 'axios';
import { getInsureMoToken, insureMoHeaders } from './auth';

export async function queryPolicy(policyNumber: string) {
  const token = await getInsureMoToken();

  const res = await axios.get(
    `${process.env.INSUREMO_API_BASE}/limobs/policies/${policyNumber}`,
    { headers: { Authorization: `Bearer ${token}`, ...insureMoHeaders() } }
  );

  return {
    coverageNo: res.data.coverages?.[0]?.coverageNo,
    insuredPartyId: res.data.insureds?.[0]?.partyId,
    raw: res.data,
  };
}
