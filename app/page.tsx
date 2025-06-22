import MapComponent from './MapComponent'

export default function Page() {
  const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN

  if (!mapboxToken) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          color: '#666',
        }}
      >
        Mapbox access token not configured
      </div>
    )
  }

  return (
    <div>
      <a id='logo' href='https://github.com/geoochi/track_fly' target='_blank'>
        <img src='/github.svg' />
      </a>
      <MapComponent mapboxToken={mapboxToken} />
    </div>
  )
}
