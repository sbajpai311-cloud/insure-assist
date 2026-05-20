import React from 'react';

// SC Mobile Color Palette
const colors = {
  tealPrimary: '#00AAB5',
  tealDark: '#007E87',
  navy: '#1A2B4A',
  white: '#FFFFFF',
  grey100: '#F5F6F7',
};

export default function App() {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: colors.grey100, minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{ backgroundColor: colors.tealPrimary, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ color: colors.white, fontSize: 20, fontWeight: 700 }}>InsureAssist Admin</span>
          <span style={{ color: '#E6F7F8', fontSize: 12, marginLeft: 8 }}>Powered by SC</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Dashboard', 'Policies', 'Agents', 'Reports'].map(item => (
            <a key={item} href="#" style={{ color: '#E6F7F8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>{item}</a>
          ))}
        </div>
      </nav>

      {/* Header */}
      <div style={{ backgroundColor: colors.navy, padding: '32px 32px 48px', color: colors.white }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Admin Dashboard</h1>
        <p style={{ margin: '8px 0 0', color: '#94A3B8', fontSize: 14 }}>InsureAssist Agent Portal — Management Console</p>
      </div>

      {/* KPIs */}
      <div style={{ padding: '0 32px', marginTop: -24, display: 'flex', gap: 16 }}>
        {[
          { label: 'Total Policies', value: '1,284', color: colors.tealPrimary },
          { label: 'Active Agents', value: '48', color: '#8B5CF6' },
          { label: 'This Month Premium', value: '₹42.6L', color: '#16A34A' },
          { label: 'Pending Applications', value: '23', color: '#D97706' },
        ].map(kpi => (
          <div key={kpi.label} style={{
            flex: 1,
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: 20,
            borderTop: `4px solid ${kpi.color}`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ padding: 32, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Recent Policies */}
        <div style={{ backgroundColor: colors.white, borderRadius: 12, padding: 24, boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: colors.navy }}>Recent Policies</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${colors.grey100}` }}>
                {['Policy No', 'Product', 'Agent', 'Status', 'Premium'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { no: 'GTR1-20260120', product: 'Life Term', agent: 'Raj K.', status: 'Active', premium: '₹1,250' },
                { no: 'HALB-20260119', product: 'Wellness WB2', agent: 'Priya S.', status: 'Active', premium: '₹57' },
                { no: 'GTR1-20260118', product: 'Life Term', agent: 'Amit R.', status: 'Pending', premium: '₹980' },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${colors.grey100}` }}>
                  <td style={{ padding: '12px', color: colors.tealDark, fontWeight: 600 }}>{row.no}</td>
                  <td style={{ padding: '12px', color: colors.navy }}>{row.product}</td>
                  <td style={{ padding: '12px', color: '#6B7280' }}>{row.agent}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      backgroundColor: row.status === 'Active' ? '#D1FAE5' : '#FEF3C7',
                      color: row.status === 'Active' ? '#065F46' : '#92400E',
                      padding: '2px 8px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                    }}>{row.status}</span>
                  </td>
                  <td style={{ padding: '12px', color: colors.navy, fontWeight: 600 }}>{row.premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bundle Summary */}
        <div style={{ backgroundColor: colors.white, borderRadius: 12, padding: 24, boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: colors.navy }}>Wellness Bundles</h2>
          {[
            { id: 'WB1', name: 'Wellness Basic', enrollments: 312, price: '₹35/mo' },
            { id: 'WB2', name: 'Wellness Premium', enrollments: 189, price: '₹57/mo' },
            { id: 'WB3', name: 'Premium + Insurance', enrollments: 43, price: 'Custom' },
          ].map(b => (
            <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${colors.grey100}` }}>
              <div>
                <div style={{ fontWeight: 600, color: colors.navy, fontSize: 14 }}>{b.name}</div>
                <div style={{ color: '#6B7280', fontSize: 12, marginTop: 2 }}>{b.price}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: colors.tealPrimary }}>{b.enrollments}</div>
                <div style={{ color: '#6B7280', fontSize: 11 }}>enrollments</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
