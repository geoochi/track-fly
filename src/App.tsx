import { useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import { along, length, lineString } from '@turf/turf'
import 'mapbox-gl/dist/mapbox-gl.css'
import './App.css'
import cameraJson from './data/camera.json'
import targetJson from './data/target.json'
import trackJson from './data/track.json'

const App: React.FC = () => {
  const mapRef = useRef(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      zoom: 18,
      center: [114.0516, 22.557],
      style: 'mapbox://styles/anhmw2351/cligvilm4008e01r02c6o1nw3',
      interactive: false,
    })
    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [],
          },
        },
      ],
    }
    const cameraRoute = cameraJson['features'][0]['geometry']['coordinates']
    const targetRoute = targetJson['features'][0]['geometry']['coordinates']
    const trackRoute = trackJson['features'][0]['geometry']['coordinates']

    mapRef.current.on('load', () => {
      mapRef.current.addSource('line', {
        type: 'geojson',
        data: geojson,
      })

      mapRef.current.addLayer({
        id: 'line-animation',
        type: 'line',
        source: 'line',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#e55e51',
          'line-width': 8,
          'line-opacity': 1,
        },
      })

      const animationDuration = 30000
      const cameraAltitude = 4000
      const trackDistance = length(lineString(trackRoute))
      const targetDistance = length(lineString(targetRoute))
      const cameraDistance = length(lineString(cameraRoute))

      let start
      function frame(time) {
        let count
        if (!start) start = time
        const phase = (time - start) / animationDuration

        if (phase > 1) {
          setTimeout(() => {
            start = 0.0
            count = 0
          }, 1500)
          geojson.features[0].geometry.coordinates = []
        }

        const alongTrack = along(lineString(trackRoute), trackDistance * phase)
          .geometry.coordinates
        geojson.features[0].geometry.coordinates.push([
          alongTrack[0],
          alongTrack[1],
        ])
        mapRef.current.getSource('line').setData(geojson)

        const alongTarget = along(
          lineString(targetRoute),
          targetDistance * phase
        ).geometry.coordinates

        const alongCamera = along(
          lineString(cameraRoute),
          cameraDistance * phase
        ).geometry.coordinates

        const camera = mapRef.current.getFreeCameraOptions()

        camera.position = mapboxgl.MercatorCoordinate.fromLngLat(
          [alongCamera[0], alongCamera[1]],
          cameraAltitude
        )

        camera.lookAtPoint([alongTarget[0], alongTarget[1]])

        mapRef.current.setFreeCameraOptions(camera)

        window.requestAnimationFrame(frame)
      }

      window.requestAnimationFrame(frame)
    })

    return () => {
      mapRef.current.remove()
    }
  }, [])

  return (
    <div>
      <div id='logo'>
        <a href='https://github.com/geoochi/track_fly' target='_blank'>
          <img src='/github.svg' />
        </a>
      </div>
      <div id='map' ref={mapContainerRef} />
    </div>
  )
}

export default App
