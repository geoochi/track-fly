import json
import numpy as np


target_json = json.load(open('data/target.geojson'))
target_np = np.array(target_json['features'][0]['geometry']['coordinates'])

angle = np.linspace(np.pi, 0, len(target_np))
delta = np.ones((len(target_np), 2))
r = 8000 / (6371000 * np.pi / 180)
delta[:, 0] = delta[:, 0] * r * np.cos(angle)
delta[:, 1] = delta[:, 1] * r * np.sin(angle)
camera_np = target_np + delta
target_json['features'][0]['geometry']['coordinates'] = camera_np.tolist()
target_json['name'] = 'camera'

json.dump(target_json, open('data/camera.geojson', 'w'))
