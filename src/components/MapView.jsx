import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'

export default function MapView({ cities, onCityClick, getHeatColor }) {
  return (
    <div className="map-container">
      <MapContainer
        center={[22.5, 82]}
        zoom={5}
        style={{ height: '100%', width: '100%', background: '#000' }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
        />
        {cities.map((city) => {
          if (city.temp === null || city.temp === undefined) return null
          const color = getHeatColor(city.temp)
          const radius = Math.max(8, (city.temp - 25) * 0.8)
          const isDanger = city.temp >= 45

          return (
            <CircleMarker
              key={`${city.name}_${city.state}`}
              center={[city.lat, city.lon]}
              radius={radius}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: isDanger ? 0.9 : 0.7,
                weight: isDanger ? 2 : 1,
                opacity: 1,
                className: isDanger ? 'pulse-marker' : ''
              }}
              eventHandlers={{
                click: () => onCityClick(city)
              }}
            >
              <Tooltip direction="top" offset={[0, -radius]}>
                <div style={{ background: '#111', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', lineHeight: '1.5' }}>
                  <strong style={{ color: color }}>{city.name}</strong>
                  <br />
                  <span style={{ color: '#aaa' }}>{city.state}</span>
                  <br />
                  <span style={{ color: color, fontWeight: 'bold' }}>{city.temp?.toFixed(1)}°C</span>
                  <span style={{ color: '#aaa', marginLeft: '6px' }}>{city.risk?.label}</span>
                </div>
              </Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>

      <div className="map-legend">
        <div className="legend-title">HEAT RISK</div>
        {[
          { label: 'Normal', color: '#22c55e', range: '<35°C' },
          { label: 'Hot', color: '#eab308', range: '35-40°C' },
          { label: 'Very Hot', color: '#f97316', range: '40-43°C' },
          { label: 'Extreme', color: '#ef4444', range: '43-45°C' },
          { label: 'DANGER', color: '#ff0000', range: '>45°C' },
        ].map(item => (
          <div key={item.label} className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: item.color }} />
            <span className="legend-label">{item.label}</span>
            <span className="legend-range">{item.range}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
