'use client'
import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { along, length, lineString } from '@turf/turf'
import 'mapbox-gl/dist/mapbox-gl.css'
import cameraJson from './data/camera.json'
import targetJson from './data/target.json'
import trackJson from './data/track.json'

interface MapComponentProps {
  mapboxToken: string
}

const MapComponent: React.FC<MapComponentProps> = ({ mapboxToken }) => {
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!mapContainerRef.current) return
    mapboxgl.accessToken = mapboxToken
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      zoom: 18,
      center: [114.0516, 22.557],
      style: 'mapbox://styles/anhmw2351/cligvilm4008e01r02c6o1nw3',
      interactive: false,
    })

    const geojson = {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: [] as [number, number][],
          },
        },
      ],
    }
    const cameraRoute = cameraJson['features'][0]['geometry']['coordinates']
    const targetRoute = targetJson['features'][0]['geometry']['coordinates']
    const trackRoute = trackJson['features'][0]['geometry']['coordinates']

    mapRef.current.on('load', () => {
      if (!mapRef.current) return

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

      let start: number | undefined
      function frame(time: number) {
        let count: number
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
        if (!mapRef.current) return
        const source = mapRef.current.getSource(
          'line'
        ) as mapboxgl.GeoJSONSource
        if (source) {
          source.setData(geojson)
        }

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

    setIsLoading(false)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
      }
    }
  }, [mapboxToken])

  return (
    <div>
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
          }}
        >
          Loading map...
        </div>
      )}
      <div id='map' ref={mapContainerRef} />
    </div>
  )
}

export default MapComponent
