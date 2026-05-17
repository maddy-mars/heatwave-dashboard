import { useState, useEffect, useCallback } from 'react'
import MapView from './components/MapView'
import LeftSidebar from './components/LeftSidebar'
import RightSidebar from './components/RightSidebar'
import TopBar from './components/TopBar'
import Ticker from './components/Ticker'
import CityPopup from './components/CityPopup'
import './App.css'

async function fetchWeatherData(cities) {
  const lats = cities.map(c => c.lat).join(',')
  const lons = cities.map(c => c.lon).join(',')
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,apparent_temperature&daily=temperature_2m_max,temperature_2m_min,uv_index_max&timezone=Asia%2FKolkata&forecast_days=1&past_days=7`
  const res = await fetch(url)
  const data = await res.json()
  return Array.isArray(data) ? data : [data]
}

export default function App() {
  const [cities, setCities] = useState([])
  const [weatherData, setWeatherData] = useState({})
  const [selectedCity, setSelectedCity] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [countdown, setCountdown] = useState(1800)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const citiesRes = await fetch('/india_cities.json')
      const citiesData = await citiesRes.json()
      setCities(citiesData)

      const weatherResults = await fetchWeatherData(citiesData)

      const weatherMap = {}
      citiesData.forEach((city, i) => {
        const w = weatherResults[i]
        if (w && w.current) {
          weatherMap[`${city.name}_${city.state}`] = {
            temp: w.current.temperature_2m,
            feelsLike: w.current.apparent_temperature ?? null,
            humidity: w.current.relative_humidity_2m,
            maxTemp: w.daily?.temperature_2m_max?.[0] ?? null,
            nightMin: w.daily?.temperature_2m_min?.[0] ?? null,
            uvIndex: w.daily?.uv_index_max?.[0] ?? null,
            trend7days: w.daily?.temperature_2m_max?.slice(0, 7) ?? [],
          }
        }
      })

      setWeatherData(weatherMap)
      setLastUpdate(new Date())
      setCountdown(1800)
    } catch (err) {
      console.error('Failed to fetch weather:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          loadData()
          return 1800
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [loadData])

  const getHeatRisk = (temp) => {
    if (temp < 35) return { label: 'Normal', color: '#22c55e', bubbleColor: '#16a34a' }
    if (temp < 40) return { label: 'Hot', color: '#eab308', bubbleColor: '#ca8a04' }
    if (temp < 43) return { label: 'Very Hot', color: '#f97316', bubbleColor: '#ea580c' }
    if (temp < 45) return { label: 'Extreme', color: '#ef4444', bubbleColor: '#dc2626' }
    return { label: 'DANGER', color: '#7f1d1d', bubbleColor: '#991b1b', pulsing: true }
  }

  const enrichedCities = cities.map(city => {
    const key = `${city.name}_${city.state}`
    const weather = weatherData[key] || {}
    const temp = weather.temp ?? null
    const risk = temp !== null ? getHeatRisk(temp) : { label: 'Loading', color: '#666', bubbleColor: '#444' }
    return { ...city, ...weather, risk }
  })

  const top10 = [...enrichedCities]
    .filter(c => c.temp !== undefined && c.temp !== null)
    .sort((a, b) => b.temp - a.temp)
    .slice(0, 10)

  const stateGroups = {}
  enrichedCities.forEach(city => {
    if (!stateGroups[city.state]) stateGroups[city.state] = []
    stateGroups[city.state].push(city)
  })

  const top3PerState = Object.values(stateGroups).flatMap(stateCities =>
    [...stateCities]
      .filter(c => c.temp !== null && c.temp !== undefined)
      .sort((a, b) => b.temp - a.temp)
      .slice(0, 3)
  )

  const hottestCity = top10[0] || null
  const above40Count = enrichedCities.filter(c => c.temp >= 40).length

  const stateSummary = Object.entries(stateGroups).map(([state, stateCities]) => {
    const sorted = [...stateCities]
      .filter(c => c.temp !== null && c.temp !== undefined)
      .sort((a, b) => b.temp - a.temp)
    return { state, topCity: sorted[0] || null }
  }).filter(s => s.topCity)
    .sort((a, b) => b.topCity.temp - a.topCity.temp)

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="app">
      <TopBar
        hottestCity={hottestCity}
        above40Count={above40Count}
        countdown={formatCountdown(countdown)}
        lastUpdate={lastUpdate}
        loading={loading}
      />
      <div className="main-layout">
        <LeftSidebar top10={top10} />
        <MapView
          cities={top3PerState}
          onCityClick={setSelectedCity}
          getHeatColor={(temp) => {
            if (temp < 35) return '#22c55e'
            if (temp < 40) return '#eab308'
            if (temp < 43) return '#f97316'
            if (temp < 45) return '#ef4444'
            return '#ff0000'
          }}
        />
        <RightSidebar stateSummary={stateSummary} />
      </div>
      <Ticker cities={enrichedCities} />
      {selectedCity && (
        <CityPopup city={selectedCity} onClose={() => { setSelectedCity(null); document.body.style.overflow = ''; document.body.style.position = ''; document.body.style.top = ''; window.scrollTo(0, 0); }} />
      )}
    </div>
  )
}
