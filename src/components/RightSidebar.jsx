const riskEmoji = (label) => {
  switch (label) {
    case 'DANGER': return '🔴'
    case 'Extreme': return '🟠'
    case 'Very Hot': return '🟡'
    case 'Hot': return '🟢'
    default: return '⚪'
  }
}

export default function RightSidebar({ stateSummary }) {
  return (
    <div className="sidebar right-sidebar">
      <div className="sidebar-header">
        <span>🗺️ STATE HOTSPOTS</span>
        <span className="sidebar-sub">PER STATE</span>
      </div>
      <div className="sidebar-list">
        {stateSummary.length === 0 && (
          <div className="sidebar-empty">Loading data...</div>
        )}
        {stateSummary.map(({ state, topCity }) => (
          <div key={state} className="state-row">
            <div className="state-info">
              <div className="state-name">{state.length > 16 ? state.substring(0, 14) + '..' : state}</div>
              <div className="state-city">{topCity.name}</div>
            </div>
            <div className="state-right">
              <div className="state-temp" style={{ color: topCity.risk?.color || '#fff' }}>
                {topCity.temp?.toFixed(1)}°C
              </div>
              <div
                className="risk-dot"
                style={{ backgroundColor: topCity.risk?.color || '#666' }}
                title={topCity.risk?.label}
              >
                {riskEmoji(topCity.risk?.label)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
