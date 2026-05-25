import axios from 'axios';
import { getInsureMoToken, insureMoHeaders } from './auth';

export interface CustomerInput {
  holderFirstName: string;
  holderLastName: string;
  holderGender: string;
  holderDOB: string;
  holderSmoking: boolean;
  insuredFirstName: string;
  insuredLastName: string;
  insuredGender: string;
  insuredDOB: string;
  insuredSmoking: boolean;
  mobile: string;
  email: string;
  address1: string;
  address2?: string;
  city: string;
  postCode: string;
  sumAssured: number;
  coverageYear: number;
  chargeYear: number;
  occupationCode?: string;
}

export async function submitApplication(customerData: CustomerInput) {
  if (process.env.MOCK_INSUREMO !== 'false') {
    await new Promise(r => setTimeout(r, 600));
    const mockId = Date.now();
    const installPrem = Math.round(customerData.sumAssured * 0.0025);
    return {
      proposalNumber: `PROP-MOCK-${mockId}`,
      currency:       28,
      installPrem:    installPrem,
    };
  }

  const token = await getInsureMoToken();
  const randomInt = Math.floor(Math.random() * 9999999999999999);

  const payload = {
    clientRequestId: `OPT00${randomInt}`,
    clientRequestTime: new Date().toISOString(),
    policy: {
      policyType: 1,
      applyDate: new Date().toISOString(),
      submissionDate: new Date().toISOString(),
      inceptionDate: new Date().toISOString(),
      expiryDate: null,
      quotationCode: `${randomInt}`,
      currency: 28,
      discountType: '2',
      coverages: [{
        coverageSerialId: 1,
        chargePeriod: '2',
        chargeYear: customerData.chargeYear,
        coveragePeriod: '2',
        coverageYear: customerData.coverageYear,
        productCode: 'GTR1',
        currentPremium: {
          paymentFreq: '1',
          sumAssured: customerData.sumAssured,
        },
        insureds: [{ orderId: 1, partySerialId: 2 }],
      }],
      policyHolder: {
        extendedProps: { jobRelated: 'Y' },
        partySerialId: 1,
        relationToLA: 3,
      },
      insureds: [{
        partySerialId: 2,
        relationToPH: 3,
        medicalIndi: 'N',
        socialSecurityIndi: 'N',
        medicalExamIndi: 'N',
      }],
      beneficiaries: [{
        partySerialId: 1,
        insuredPartySerialId: 2,
        beneType: 2,
        designation: 1,
        shareOrder: 1,
        shareRate: 1,
      }],
      payers: [{ partySerialId: 1, relationToPH: 1, shareRate: 1 }],
      payerAccounts: [{ paymentMethod: 1, paymentMethodNext: 1 }],
      trustees: [],
      customers: [
        {
          partySerialId: 1,
          partyType: 1,
          person: {
            gender: customerData.holderGender,
            birthdate: customerData.holderDOB,
            certiType: 1,
            certiCode: `PHILPID${randomInt}`,
            firstName: customerData.holderFirstName,
            lastName: customerData.holderLastName,
            nationality: '99',
            preferredLifeIndi: '0',
            smoking: customerData.holderSmoking ? 'Y' : 'N',
            occupationCode: customerData.occupationCode || '2',
            marriageStatus: '6',
            employedIndi: 'N',
          },
          partyContact: {
            mobileTel: customerData.mobile,
            email: customerData.email,
          },
          address: {
            address1: customerData.address1,
            address2: customerData.address2 || '',
            address3: '',
            address4: customerData.city,
            postCode: customerData.postCode,
          },
        },
        {
          partySerialId: 2,
          partyType: 1,
          person: {
            gender: customerData.insuredGender,
            birthdate: customerData.insuredDOB,
            certiType: 1,
            certiCode: `LAILPID${randomInt}`,
            firstName: customerData.insuredFirstName,
            lastName: customerData.insuredLastName,
            nationality: '99',
            preferredLifeIndi: '0',
            smoking: customerData.insuredSmoking ? 'Y' : 'N',
            occupationCode: customerData.occupationCode || '2',
            marriageStatus: '6',
            employedIndi: 'N',
          },
          partyContact: {
            mobileTel: customerData.mobile,
            email: customerData.email,
          },
          address: {
            address1: customerData.address1,
            address2: customerData.address2 || '',
            address3: '',
            address4: customerData.city,
            postCode: customerData.postCode,
          },
        },
      ],
      declarations: [],
      agentDeclarations: [],
    },
  };

  const res = await axios.post(
    `${process.env.INSUREMO_API_BASE}/limobs/proposals/application`,
    payload,
    { headers: { Authorization: `Bearer ${token}`, ...insureMoHeaders() } }
  );

  if (res.data.result !== 1) throw new Error(`Application failed: ${JSON.stringify(res.data)}`);

  return {
    proposalNumber: res.data.policy.proposalNumber,
    currency: res.data.policy.currency,
    installPrem: res.data.policy.installPrem,
  };
}
