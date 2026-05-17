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
  const [showLocation, setShowLocation] = useState(false)
  const [locData, setLocData] = useState(null)
  const [locLoading, setLocLoading] = useState(false)
  const [locError, setLocError] = useState(null)
  const fetchMyLocation = () => {
    setShowLocation(true)
    setLocLoading(true)
    setLocData(null)
    setLocError(null)
    if (!navigator.geolocation) { setLocError('Geolocation not supported by your browser'); setLocLoading(false); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,apparent_temperature,relative_humidity_2m,uv_index&daily=temperature_2m_max&timezone=Asia/Kolkata&forecast_days=1')
          .then(r => r.json())
          .then(d => {
            const t = d.current.temperature_2m
            const feels = d.current.apparent_temperature
            const hum = d.current.relative_humidity_2m
            const uv = d.current.uv_index
            const mxt = d.daily.temperature_2m_max[0]
            const imdL = mxt >= 47 ? 'EXTREME HEAT WAVE' : mxt >= 45 ? 'SEVERE HEAT WAVE' : mxt >= 40 ? 'HEAT WAVE' : feels >= 40 ? 'HEAT STRESS' : 'NORMAL'
            const imdC = mxt >= 47 ? '#7f1d1d' : mxt >= 45 ? '#ef4444' : mxt >= 40 ? '#f97316' : feels >= 40 ? '#eab308' : '#22c55e'
            const imdE = mxt >= 47 ? '🚨' : mxt >= 45 ? '🔴' : mxt >= 40 ? '🟠' : feels >= 40 ? '🟡' : '🟢'
            setLocData({ lat: lat.toFixed(4), lon: lon.toFixed(4), temp: t, feelsLike: feels, humidity: hum, uvIndex: uv, maxTemp: mxt, imdLabel: imdL, imdColor: imdC, imdEmoji: imdE })
            setLocLoading(false)
          })
          .catch(() => { setLocError('Failed to fetch weather data. Please try again.'); setLocLoading(false) })
      },
      () => { setLocError('Location access denied. Please allow location permission.'); setLocLoading(false) }
    )
  }
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
        <div style={{ position: 'absolute', top: '12px', right: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><button onClick={() => window.open(whatsappUrl, '_blank')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' }} title='Share on WhatsApp'><svg width='20' height='20' viewBox='0 0 24 24' fill='#25D366'><path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z'/><path d='M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L.044 23.06a.75.75 0 0 0 .897.897l5.198-1.488A11.955 11.955 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.534-5.197-1.453l-.372-.223-3.853 1.104 1.104-3.853-.223-.372A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z'/></svg></button><button onClick={() => window.open('https://t.me/indiaHeatwaveWR', '_blank')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' }} title='Join Telegram Channel'><svg width='20' height='20' viewBox='0 0 24 24' fill='#229ED9'><path d='M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.008 9.46c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.12 14.668l-2.936-.916c-.637-.2-.65-.637.136-.943l11.47-4.423c.531-.194.995.13.772.862z'/></svg></button><button className="popup-close" onClick={onClose} style={{ position: 'static' }}>X</button></div>
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
        <button onClick={() => setShowWater(!showWater)} style={{ marginTop: '8px', padding: '10px', borderRadius: '8px', backgroundColor: '#1d4ed822', border: '1px solid #60a5fa', color: '#60a5fa', cursor: 'pointer', fontWeight: '600', fontSize: '14px', width: '100%' }}>{'💧 ' + (showWater ? 'Hide Water Calculator' : 'Water Requirement Calculator')}</button>
        <button onClick={fetchMyLocation} style={{ marginTop: '8px', padding: '10px', borderRadius: '8px', backgroundColor: '#14532d22', border: '1px solid #22c55e', color: '#22c55e', cursor: 'pointer', fontWeight: '600', fontSize: '14px', width: '100%' }}>My Location — Get Local Heatwave Data</button>
        {showLocation && <div onClick={() => setShowLocation(false)} style={{ position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.75)', zIndex: '9999', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '20px', width: '320px', maxWidth: '90vw' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}><span style={{ fontWeight: '700', fontSize: '16px', color: '#22c55e' }}>My Location — Heatwave Data</span><button onClick={() => setShowLocation(false)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '18px', cursor: 'pointer' }}>X</button></div>{locLoading && <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Fetching your location...</div>}{locError && <div style={{ textAlign: 'center', padding: '20px', color: '#ef4444', fontSize: '13px' }}>{locError}</div>}{locData && <div><div style={{ fontSize: '11px', color: '#888', marginBottom: '12px' }}>{'Lat: ' + locData.lat + ' | Lon: ' + locData.lon}</div><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}><div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', textAlign: 'center' }}><div style={{ fontSize: '10px', color: '#888' }}>TEMPERATURE</div><div style={{ fontSize: '22px', fontWeight: '700', color: '#f97316' }}>{locData.temp.toFixed(1) + 'C'}</div></div><div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', textAlign: 'center' }}><div style={{ fontSize: '10px', color: '#888' }}>FEELS LIKE</div><div style={{ fontSize: '22px', fontWeight: '700', color: '#eab308' }}>{locData.feelsLike.toFixed(1) + 'C'}</div></div><div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', textAlign: 'center' }}><div style={{ fontSize: '10px', color: '#888' }}>HUMIDITY</div><div style={{ fontSize: '22px', fontWeight: '700', color: '#60a5fa' }}>{locData.humidity + '%'}</div></div><div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', textAlign: 'center' }}><div style={{ fontSize: '10px', color: '#888' }}>UV INDEX</div><div style={{ fontSize: '22px', fontWeight: '700', color: '#f97316' }}>{locData.uvIndex.toFixed(1)}</div></div></div><div style={{ padding: '10px', borderRadius: '8px', backgroundColor: locData.imdColor + '22', border: '1px solid ' + locData.imdColor, color: locData.imdColor, textAlign: 'center' }}><div style={{ fontWeight: '700', fontSize: '13px' }}>{locData.imdEmoji + ' Is My Area Safe? ' + locData.imdLabel}</div><div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>As per IMD Guidelines</div></div></div>}</div></div>}
        {showWater && <div onClick={() => setShowWater(false)} style={{ position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.75)', zIndex: '9999', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '20px', width: '320px', maxWidth: '90vw' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}><span style={{ fontWeight: '700', fontSize: '16px', color: '#60a5fa' }}>Water Requirement Calculator</span><button onClick={() => setShowWater(false)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '18px', cursor: 'pointer' }}>X</button></div><div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>{city.name + ' | Temp: ' + cityTemp.toFixed(1) + 'C'}</div><div style={{ marginBottom: '12px' }}><label style={{ fontSize: '12px', color: '#aaa' }}>{'Body Weight: ' + weight + ' kg'}</label><input type='range' min='40' max='120' value={weight} onChange={e => setWeight(Number(e.target.value))} style={{ width: '100%', marginTop: '6px' }} /></div><div style={{ marginBottom: '16px' }}><label style={{ fontSize: '12px', color: '#aaa' }}>Activity Level</label><select value={activity} onChange={e => setActivity(e.target.value)} style={{ width: '100%', marginTop: '6px', padding: '8px', borderRadius: '6px', backgroundColor: '#1e293b', color: '#fff', border: '1px solid #334155', fontSize: '13px' }}>{Object.keys(activityMap).map(k => <option key={k} value={k}>{activityLabel[k]}</option>)}</select></div><div style={{ textAlign: 'center', padding: '14px', borderRadius: '10px', backgroundColor: '#1d4ed822', border: '1px solid #60a5fa' }}><div style={{ fontSize: '12px', color: '#888' }}>Recommended Water Intake Today</div><div style={{ fontSize: '32px', fontWeight: '700', color: '#60a5fa', marginTop: '6px' }}>{totalLitres + ' L'}</div></div></div></div>}
      </div>
    </div>
  )
}
