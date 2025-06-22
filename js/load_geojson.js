var targetRoute
$.ajax({
  url: 'data/target.geojson',
  dataType: 'json',
  async: false,
  success: function (data) {
    targetRoute = data['features'][0]['geometry']['coordinates']
  },
})

var cameraRoute
$.ajax({
  url: 'data/camera.geojson',
  dataType: 'json',
  async: false,
  success: function (data) {
    cameraRoute = data['features'][0]['geometry']['coordinates']
  },
})

var trackRoute
$.ajax({
  url: 'data/track.geojson',
  dataType: 'json',
  async: false,
  success: function (data) {
    trackRoute = data['features'][0]['geometry']['coordinates']
  },
})
