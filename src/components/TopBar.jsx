import { useState, useEffect } from 'react'

export default function TopBar({ hottestCity, above40Count, countdown, lastUpdate, loading }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatIST = (date) => {
    return date.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="topbar">
      <div className="topbar-title">
        <span className="fire-icon">🔥</span>
        <div className="title-wrapper">
          <span className="title-text">INDIA HEATWAVE MONITOR</span>
          <span className="mobile-clock">{formatIST(time) + ' | ' + formatDate(time)}</span>
        </div>
        {loading && <span className="loading-badge">UPDATING...</span>}
      </div>

      <div className="topbar-stats">
        {hottestCity && (
          <div className="stat-item hottest">
            <span className="stat-label">HOTTEST</span>
            <span className="stat-value hottest-val">
              {hottestCity.name}, {hottestCity.state.substring(0, 10)}
            </span>
            <span className="stat-temp" style={{ color: '#ff4444' }}>
              {hottestCity.temp?.toFixed(1)}°C
            </span>
          </div>
        )}

        <div className="stat-item">
          <span className="stat-label">CITIES &gt;40°C</span>
          <span className="stat-value" style={{ color: above40Count > 20 ? '#ff4444' : '#f97316' }}>
            {above40Count}
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-label">NEXT UPDATE</span>
          <span className="stat-value countdown">{countdown}</span>
        </div>

        {lastUpdate && (
          <div className="stat-item">
            <span className="stat-label">LAST UPDATE</span>
            <span className="stat-value">{formatIST(lastUpdate)}</span>
          </div>
        )}
      </div>

      <div className="topbar-clock">
        <div className="clock-time">{formatIST(time)}</div>
        <div className="clock-date">{formatDate(time)} IST</div>
      </div>
    </div>
  )
}
