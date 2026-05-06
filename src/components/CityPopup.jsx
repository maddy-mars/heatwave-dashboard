export default function CityPopup({ city, onClose }) {
  const getRiskEmoji = (label) => {
    switch (label) {
      case 'DANGER': return '🔴'
      case 'Extreme': return '🟠'
      case 'Very Hot': return '🟡'
      case 'Hot': return '🟢'
      default: return '⚪'
    }
  }

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={e => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>✕</button>

        <div className="popup-header">
          <div className="popup-city">{city.name}</div>
          <div className="popup-state">{city.state}</div>
        </div>

        <div className="popup-temp-display" style={{ color: city.risk?.color || '#fff' }}>
          {city.temp?.toFixed(1)}°C
        </div>

        <div className="popup-risk-badge" style={{
          backgroundColor: city.risk?.bubbleColor + '22',
          borderColor: city.risk?.color,
          color: city.risk?.color
        }}>
          {getRiskEmoji(city.risk?.label)} {city.risk?.label}
        </div>

        <div className="popup-details">
          <div className="popup-detail-row">
            <span className="popup-detail-label">🌡️ Feels Like</span>
            <span className="popup-detail-value" style={{ color: city.risk?.color || '#fff' }}>
              {city.feelsLike != null ? `${city.feelsLike.toFixed(1)}°C` : '—'}
            </span>
          </div>
          <div className="popup-detail-row">
            <span className="popup-detail-label">🌑 Night Min</span>
            <span className="popup-detail-value" style={{ color: city.nightMin > 30 ? '#ef4444' : '#60a5fa' }}>
              {city.nightMin != null ? `${city.nightMin.toFixed(1)}°C${city.nightMin > 30 ? ' 🌙 No Relief' : ''}` : '—'}
            </span>
          </div>
          <div className="popup-detail-row">
            <span className="popup-detail-label">🌡️ Max Today</span>
            <span className="popup-detail-value" style={{ color: '#f97316' }}>
              {city.maxTemp != null ? `${city.maxTemp.toFixed(1)}°C` : '—'}
            </span>
          </div>
          <div className="popup-detail-row">
            <span className="popup-detail-label">💧 Humidity</span>
            <span className="popup-detail-value" style={{ color: '#60a5fa' }}>
              {city.humidity != null ? `${city.humidity}%` : '—'}
            </span>
          </div>
          <div className="popup-detail-row">
            <span className="popup-detail-label">📍 Coordinates</span>
            <span className="popup-detail-value" style={{ color: '#888' }}>
              {city.lat?.toFixed(2)}°N, {city.lon?.toFixed(2)}°E
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
