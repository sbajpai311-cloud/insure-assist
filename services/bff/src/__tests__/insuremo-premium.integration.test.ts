import nock from 'nock';
import { calculatePremium } from '../integrations/insuremo/premium';

// Reset env vars for tests
beforeAll(() => {
  process.env.INSUREMO_AUTH_URL = 'https://portal.insuremo.com/cas/ebao/v1/json/tickets';
  process.env.INSUREMO_API_BASE = 'https://portal-gw.insuremo.com/ebaoli/1.0';
  process.env.INSUREMO_TENANT_ID = 'f63cdb8d-240d-4e26-b0d9-05e9276a65ca';
  // Force real InsureMO path so nock interceptors are exercised
  process.env.MOCK_INSUREMO = 'false';
});

afterAll(() => {
  delete process.env.MOCK_INSUREMO;
});

afterEach(() => {
  nock.cleanAll();
});

describe('InsureMO Premium Calculation', () => {
  beforeEach(() => {
    nock('https://portal.insuremo.com')
      .post('/cas/ebao/v1/json/tickets')
      .reply(200, { access_token: 'mock-token-abc123' });

    nock('https://portal-gw.insuremo.com')
      .post('/ebaoli/1.0/pd/products/benefitPremiumSA')
      .reply(200, {
        result: 1,
        calculatePolicyResult: {
          installPrem: 1250.50,
          calculateCoverageResults: [{
            productCode: 'GTR1',
            stdPremAf: 15006,
            sumAssured: 1000000,
          }],
        },
      });
  });

  it('returns premium for valid request', async () => {
    const result = await calculatePremium({
      gender: 'M',
      birthdate: '1994-11-21T08:00:00',
      sumAssured: 1000000,
      coverageYear: 5,
      chargeYear: 5,
      paymentFreq: 1,
    });

    expect(result.installPrem).toBe(1250.50);
    expect(result.sumAssured).toBe(1000000);
  });

  it('throws on result !== 1', async () => {
    nock.cleanAll();
    nock('https://portal.insuremo.com')
      .post('/cas/ebao/v1/json/tickets')
      .reply(200, { access_token: 'mock-token-abc123' });
    nock('https://portal-gw.insuremo.com')
      .post('/ebaoli/1.0/pd/products/benefitPremiumSA')
      .reply(200, { result: 0, errorMessage: 'Invalid product' });

    await expect(calculatePremium({
      gender: 'M', birthdate: '1994-11-21T08:00:00',
      sumAssured: 1000000, coverageYear: 5, chargeYear: 5, paymentFreq: 1,
    })).rejects.toThrow('InsureMO error');
  });
});
