const getRiskEmoji = (label) => {
  switch (label) {
    case 'DANGER': return '🔴'
    case 'Extreme': return '🟠'
    case 'Very Hot': return '🟡'
    case 'Hot': return '🟢'
    default: return '⚪'
  }
}

const getStateAbbr = (state) => {
  const abbrs = {
    'Andhra Pradesh': 'AP', 'Arunachal Pradesh': 'AR', 'Assam': 'AS',
    'Bihar': 'BR', 'Chhattisgarh': 'CG', 'Goa': 'GA', 'Gujarat': 'GJ',
    'Haryana': 'HR', 'Himachal Pradesh': 'HP', 'Jharkhand': 'JH',
    'Karnataka': 'KA', 'Kerala': 'KL', 'Madhya Pradesh': 'MP',
    'Maharashtra': 'MH', 'Manipur': 'MN', 'Meghalaya': 'ML',
    'Mizoram': 'MZ', 'Nagaland': 'NL', 'Odisha': 'OD', 'Punjab': 'PB',
    'Rajasthan': 'RJ', 'Sikkim': 'SK', 'Tamil Nadu': 'TN',
    'Telangana': 'TS', 'Tripura': 'TR', 'Uttar Pradesh': 'UP',
    'Uttarakhand': 'UK', 'West Bengal': 'WB',
    'Andaman and Nicobar Islands': 'AN', 'Chandigarh': 'CH',
    'Dadra and Nagar Haveli and Daman and Diu': 'DD', 'Delhi': 'DL',
    'Jammu and Kashmir': 'JK', 'Ladakh': 'LA', 'Lakshadweep': 'LD',
    'Puducherry': 'PY'
  }
  return abbrs[state] || state.substring(0, 2).toUpperCase()
}

export default function Ticker({ cities }) {
  const sorted = [...cities]
    .filter(c => c.temp !== null && c.temp !== undefined)
    .sort((a, b) => b.temp - a.temp)

  if (sorted.length === 0) return (
    <div className="ticker">
      <div className="ticker-label">LIVE</div>
      <div className="ticker-track">
        <span className="ticker-content">Loading temperature data...</span>
      </div>
    </div>
  )

  const tickerText = sorted.map(city =>
    `${getRiskEmoji(city.risk?.label)} ${city.name.toUpperCase()}, ${getStateAbbr(city.state)} — ${city.temp?.toFixed(1)}°C | ${city.risk?.label?.toUpperCase()}`
  ).join('   ·   ')

  return (
    <div className="ticker">
      <div className="ticker-label">🔴 LIVE</div>
      <div className="ticker-track">
        <span className="ticker-content">{tickerText}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{tickerText}</span>
      </div>
    </div>
  )
}
