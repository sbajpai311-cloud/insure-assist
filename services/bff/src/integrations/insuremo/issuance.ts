import axios from 'axios';
import { getInsureMoToken, insureMoHeaders } from './auth';

export async function issuePolicy(
  proposalNumber: string,
  feeAmount: number,
  currency: number
) {
  if (process.env.MOCK_INSUREMO === 'true') {
    await new Promise(r => setTimeout(r, 500));
    const mockId = Date.now();
    return {
      policyNumber: `POL-MOCK-${mockId}`,
      riskStatus:   '1',
      installPrem:  feeAmount,
    };
  }

  const token = await getInsureMoToken();
  const randomInt = Math.floor(Math.random() * 999999999999);

  const payload = {
    clientRequestId: `Collection${randomInt}`,
    clientRequestTime: new Date().toISOString(),
    policy: {
      proposalNumber,
      payerAccount: { paymentMethod: 1 },
    },
    collection: {
      collectionDate: new Date().toISOString(),
      feeAmount,
      payMode: 1,
      currency,
    },
  };

  const res = await axios.post(
    `${process.env.INSUREMO_API_BASE}/limobs/proposals/issurance`,
    payload,
    { headers: { Authorization: `Bearer ${token}`, ...insureMoHeaders() } }
  );

  if (res.data.result !== 1) throw new Error(`Issuance failed: ${JSON.stringify(res.data)}`);

  return {
    policyNumber: res.data.policy.policyNumber,
    riskStatus: res.data.policy.riskStatus,
    installPrem: res.data.policy.installPrem,
  };
}
