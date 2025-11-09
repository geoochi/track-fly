mapboxgl.accessToken = 'pk.eyJ1IjoiYW5obXcyMzUxIiwiYSI6ImNtaHJpYmZpYTBvd2oybXIxYjR4cmxlbXIifQ.rHBRVuw4VyzWR-C3wZSVRw'
const map = new mapboxgl.Map({
  container: 'map',
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
let animation

map.on('load', () => {
  map.addSource('line', {
    type: 'geojson',
    data: geojson,
  })

  map.addLayer({
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
  const trackDistance = turf.lineDistance(turf.lineString(trackRoute))
  const routeDistance = turf.lineDistance(turf.lineString(targetRoute))
  const cameraRouteDistance = turf.lineDistance(turf.lineString(cameraRoute))

  let start

  function frame(time) {
    if (!start) start = time
    const phase = (time - start) / animationDuration

    if (phase > 1) {
      setTimeout(() => {
        start = 0.0
        count = 0
      }, 1500)
      geojson.features[0].geometry.coordinates = []
    }

    const alongtrack = turf.along(turf.lineString(trackRoute), trackDistance * phase).geometry.coordinates
    geojson.features[0].geometry.coordinates.push([alongtrack[0], alongtrack[1]])
    map.getSource('line').setData(geojson)

    const alongRoute = turf.along(turf.lineString(targetRoute), routeDistance * phase).geometry.coordinates

    const alongCamera = turf.along(turf.lineString(cameraRoute), cameraRouteDistance * phase).geometry.coordinates

    const camera = map.getFreeCameraOptions()

    camera.position = mapboxgl.MercatorCoordinate.fromLngLat(
      {
        lng: alongCamera[0],
        lat: alongCamera[1],
      },
      cameraAltitude
    )

    camera.lookAtPoint({
      lng: alongRoute[0],
      lat: alongRoute[1],
    })

    map.setFreeCameraOptions(camera)

    window.requestAnimationFrame(frame)
  }

  window.requestAnimationFrame(frame)
})
