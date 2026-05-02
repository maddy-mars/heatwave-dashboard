const riskEmoji = (label) => {
  switch (label) {
    case 'DANGER': return '🔴'
    case 'Extreme': return '🟠'
    case 'Very Hot': return '🟡'
    case 'Hot': return '🟢'
    default: return '⚪'
  }
}

export default function LeftSidebar({ top10 }) {
  return (
    <div className="sidebar left-sidebar">
      <div className="sidebar-header">
        <span>🏆 TOP 10 HOTTEST</span>
        <span className="sidebar-sub">NATIONAL</span>
      </div>
      <div className="sidebar-list">
        {top10.length === 0 && (
          <div className="sidebar-empty">Loading data...</div>
        )}
        {top10.map((city, i) => (
          <div key={`${city.name}_${city.state}`} className="city-row">
            <div className="city-rank" style={{
              color: i === 0 ? '#ff4444' : i < 3 ? '#f97316' : '#888'
            }}>
              #{i + 1}
            </div>
            <div className="city-info">
              <div className="city-name">{city.name}</div>
              <div className="city-state">{city.state}</div>
            </div>
            <div className="city-right">
              <div className="city-temp" style={{ color: city.risk?.color || '#fff' }}>
                {city.temp?.toFixed(1)}°C
              </div>
              <div className="risk-badge" style={{ backgroundColor: city.risk?.bubbleColor + '33', color: city.risk?.color, borderColor: city.risk?.color }}>
                {riskEmoji(city.risk?.label)} {city.risk?.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
