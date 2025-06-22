import MapComponent from './MapComponent'
import './globals.css'

export default function Page() {
  const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN

  return (
    <>
      {mapboxToken ? (
        <div>
          <a
            id='logo'
            href='https://github.com/geoochi/track-fly'
            target='_blank'
          >
            <img src='/github.svg' />
          </a>
          <MapComponent mapboxToken={mapboxToken} />
        </div>
      ) : (
        <div id='no-token'>Mapbox access token not configured</div>
      )}
    </>
  )
}
