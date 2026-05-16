import { useState } from 'react'
function TrendChart({ temps }) {
  if (!temps || temps.length < 2) return null
  const minT = Math.min(...temps) - 1
  const maxT = Math.max(...temps) + 1
  const points = temps.map((t, i) => {
    const x = (i / (temps.length - 1)) * 260
    const y = 50 - ((t - minT) / (maxT - minT)) * 40
    return x + ',' + y
  }).join(' ')
  return (
    <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
      <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>7-DAY MAX TEMP TREND</div>
      <svg width="100%" height="60" viewBox="0 0 260 60">
        <polyline points={points} fill="none" stroke="#f97316" strokeWidth="2" strokeLinejoin="round" />
        {temps.map((t, i) => {
          const x = (i / (temps.length - 1)) * 260
          const y = 50 - ((t - minT) / (maxT - minT)) * 40
          return <circle key={i} cx={x} cy={y} r="3" fill="#f97316" />
        })}
        {temps.map((t, i) => {
          const x = (i / (temps.length - 1)) * 260
          const y = 50 - ((t - minT) / (maxT - minT)) * 40
          return <text key={i} x={x} y={y - 6} textAnchor="middle" fontSize="9" fill="#aaa">{t.toFixed(0) + 'C'}</text>
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#555', marginTop: '2px' }}>
        <span>7 days ago</span><span>Today</span>
      </div>
    </div>
  )
}

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
  const uvLabel = (v) => {
    if (v >= 11) return 'Extreme'
    if (v >= 8) return 'Very High'
    if (v >= 6) return 'High'
    if (v >= 3) return 'Moderate'
    return 'Low'
  }
  const uvColor = (v) => {
    if (v >= 11) return '#ff0000'
    if (v >= 8) return '#f97316'
    if (v >= 6) return '#eab308'
    if (v >= 3) return '#22c55e'
    return '#60a5fa'
  }
  const mx = city.maxTemp != null ? city.maxTemp : 0
  const fl = city.feelsLike != null ? city.feelsLike : 0
  const imdLabel = mx >= 47 ? 'EXTREME HEAT WAVE' : mx >= 45 ? 'SEVERE HEAT WAVE' : mx >= 40 ? 'HEAT WAVE' : fl >= 40 ? 'HEAT STRESS' : 'NORMAL'
  const imdColor = mx >= 47 ? '#7f1d1d' : mx >= 45 ? '#ef4444' : mx >= 40 ? '#f97316' : fl >= 40 ? '#eab308' : '#22c55e'
  const imdEmoji = mx >= 47 ? '🚨' : mx >= 45 ? '🔴' : mx >= 40 ? '🟠' : fl >= 40 ? '🟡' : '🟢'
  const nm = city.nightMin != null ? city.nightMin : 0
  const sleepLabel = nm >= 31 ? 'Dangerous — Heat Stress Risk' : nm >= 28 ? 'Hot Night — AC Recommended' : nm >= 25 ? 'Warm Night' : 'Comfortable'
  const sleepColor = nm >= 31 ? '#ef4444' : nm >= 28 ? '#f97316' : nm >= 25 ? '#eab308' : '#22c55e'
  const sleepEmoji = nm >= 31 ? '🚨' : nm >= 28 ? '🥵' : nm >= 25 ? '😓' : '😴'
  const waText = 'Heat Alert: ' + city.name + ', ' + city.state + ' | Temp: ' + (city.temp != null ? city.temp.toFixed(1) + 'C' : '-') + ' | Feels Like: ' + (city.feelsLike != null ? city.feelsLike.toFixed(1) + 'C' : '-') + ' | UV: ' + (city.uvIndex != null ? city.uvIndex.toFixed(1) : '-') + ' | Risk: ' + (city.risk ? city.risk.label : '-') + ' | Stay safe! heatwave-dashboard.vercel.app'
  const whatsappUrl = 'https://wa.me/?text=' + encodeURIComponent(waText)
  const [showWater, setShowWater] = useState(false)
  const [weight, setWeight] = useState(70)
  const [activity, setActivity] = useState('sedentary')
  const activityMap = { sedentary: 1.0, light: 1.2, outdoor: 1.5, heavy: 1.8 }
  const activityLabel = { sedentary: 'Sedentary (Indoor AC)', light: 'Light (Indoor no AC)', outdoor: 'Outdoor Worker', heavy: 'Heavy Labour' }
  const cityTemp = city.temp != null ? city.temp : 30
  const base = weight * 35
  const heatBonus = cityTemp > 30 ? (cityTemp - 30) * 150 : 0
  const totalLitres = ((base + heatBonus) * activityMap[activity] / 1000).toFixed(1)
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={e => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>X</button>
        <div className="popup-header">
          <div className="popup-city">{city.name}</div>
          <div className="popup-state">{city.state}</div>
        </div>
        <div className="popup-temp-display" style={{ color: city.risk?.color || '#fff' }}>
          {city.temp != null ? city.temp.toFixed(1) + 'C' : '-'}
        </div>
        <div className="popup-risk-badge" style={{
          backgroundColor: city.risk?.bubbleColor + '22',
          borderColor: city.risk?.color,
          color: city.risk?.color
        }}>
          {getRiskEmoji(city.risk?.label)} {city.risk?.label}
        </div>
        <div style={{ margin: '10px 0 4px 0', padding: '6px 12px', borderRadius: '8px', backgroundColor: imdColor + '22', border: '1px solid ' + imdColor, color: imdColor, textAlign: 'center' }}><div style={{ fontWeight: '700', fontSize: '13px' }}>{'Is My City Safe Today? ' + imdLabel + ' ' + imdEmoji}</div><div style={{ fontSize: '10px', fontWeight: '400', color: '#888', marginTop: '2px' }}>As per IMD Guidelines</div></div>
        <div style={{ margin: '6px 0 4px 0', padding: '6px 12px', borderRadius: '8px', backgroundColor: sleepColor + '22', border: '1px solid ' + sleepColor, color: sleepColor, textAlign: 'center' }}><div style={{ fontWeight: '700', fontSize: '13px' }}>{'Tonight Sleep Safety - ' + sleepLabel + ' ' + sleepEmoji}</div><div style={{ fontSize: '10px', fontWeight: '400', color: '#888', marginTop: '2px' }}>Based on Night Min Temp</div></div>
        <div className="popup-details">
          <div className="popup-detail-row">
            <span className="popup-detail-label">Feels Like</span>
            <span className="popup-detail-value" style={{ color: city.risk?.color || '#fff' }}>
              {city.feelsLike != null ? city.feelsLike.toFixed(1) + 'C' : '-'}
            </span>
          </div>
          <div className="popup-detail-row">
            <span className="popup-detail-label">Night Min</span>
            <span className="popup-detail-value" style={{ color: city.nightMin > 30 ? '#ef4444' : '#60a5fa' }}>
              {city.nightMin != null ? city.nightMin.toFixed(1) + 'C' + (city.nightMin > 30 ? ' No Relief' : '') : '-'}
            </span>
          </div>
          <div className="popup-detail-row">
            <span className="popup-detail-label">Max Today</span>
            <span className="popup-detail-value" style={{ color: '#f97316' }}>
              {city.maxTemp != null ? city.maxTemp.toFixed(1) + 'C' : '-'}
            </span>
          </div>
          <div className="popup-detail-row">
            <span className="popup-detail-label">UV Index</span>
            <span className="popup-detail-value" style={{ color: city.uvIndex != null ? uvColor(city.uvIndex) : '#60a5fa' }}>
              {city.uvIndex != null ? city.uvIndex.toFixed(1) + ' - ' + uvLabel(city.uvIndex) : '-'}
            </span>
          </div>
          <div className="popup-detail-row">
            <span className="popup-detail-label">Humidity</span>
            <span className="popup-detail-value" style={{ color: '#60a5fa' }}>
              {city.humidity != null ? city.humidity + '%' : '-'}
            </span>
          </div>
          <div className="popup-detail-row">
            <span className="popup-detail-label">Coordinates</span>
            <span className="popup-detail-value" style={{ color: '#888' }}>
              {city.lat != null ? city.lat.toFixed(2) + 'N, ' + city.lon.toFixed(2) + 'E' : '-'}
            </span>
          </div>
        </div>
        {city.trend7days && city.trend7days.length > 0 && (
          <TrendChart temps={city.trend7days} />
        )}
        <button onClick={() => window.open(whatsappUrl, '_blank')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '14px', padding: '10px', borderRadius: '8px', backgroundColor: '#25D366', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px', width: '100%' }}>Share on WhatsApp</button>
        <button onClick={() => setShowWater(!showWater)} style={{ marginTop: '8px', padding: '10px', borderRadius: '8px', backgroundColor: '#1d4ed822', border: '1px solid #60a5fa', color: '#60a5fa', cursor: 'pointer', fontWeight: '600', fontSize: '14px', width: '100%' }}>{'💧 ' + (showWater ? 'Hide Water Calculator' : 'Water Requirement Calculator')}</button>
        {showWater && <div onClick={() => setShowWater(false)} style={{ position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.75)', zIndex: '9999', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '20px', width: '320px', maxWidth: '90vw' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}><span style={{ fontWeight: '700', fontSize: '16px', color: '#60a5fa' }}>Water Requirement Calculator</span><button onClick={() => setShowWater(false)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '18px', cursor: 'pointer' }}>X</button></div><div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>{city.name + ' | Temp: ' + cityTemp.toFixed(1) + 'C'}</div><div style={{ marginBottom: '12px' }}><label style={{ fontSize: '12px', color: '#aaa' }}>{'Body Weight: ' + weight + ' kg'}</label><input type='range' min='40' max='120' value={weight} onChange={e => setWeight(Number(e.target.value))} style={{ width: '100%', marginTop: '6px' }} /></div><div style={{ marginBottom: '16px' }}><label style={{ fontSize: '12px', color: '#aaa' }}>Activity Level</label><select value={activity} onChange={e => setActivity(e.target.value)} style={{ width: '100%', marginTop: '6px', padding: '8px', borderRadius: '6px', backgroundColor: '#1e293b', color: '#fff', border: '1px solid #334155', fontSize: '13px' }}>{Object.keys(activityMap).map(k => <option key={k} value={k}>{activityLabel[k]}</option>)}</select></div><div style={{ textAlign: 'center', padding: '14px', borderRadius: '10px', backgroundColor: '#1d4ed822', border: '1px solid #60a5fa' }}><div style={{ fontSize: '12px', color: '#888' }}>Recommended Water Intake Today</div><div style={{ fontSize: '32px', fontWeight: '700', color: '#60a5fa', marginTop: '6px' }}>{totalLitres + ' L'}</div></div></div></div>}
      </div>
    </div>
  )
}
