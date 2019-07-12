# cv libs
import cv2
import numpy as np
from cv2 import aruco

# socket libs
from aiohttp import web
import socketio

# CV STUFF

# init camera
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FPS, 50)

# set aruco dictionary
dictionary_name = aruco.DICT_4X4_50
dictionary = aruco.getPredefinedDictionary(dictionary_name)

parameters = aruco.DetectorParameters_create()
# Thresholding
parameters.adaptiveThreshWinSizeMin = 3 # >= 3
parameters.adaptiveThreshWinSizeStep = 2 # 10
parameters.adaptiveThreshWinSizeMax = 14 # 23
parameters.adaptiveThreshConstant = 7 # 7
# Contour Filtering
parameters.minMarkerPerimeterRate = 0.03 # 0.03
parameters.maxMarkerPerimeterRate = 0.1 # 4.0
parameters.minCornerDistanceRate = 0.05 # 0.05
parameters.minMarkerDistanceRate = 0.05 # 0.05
parameters.minDistanceToBorder = 3 # 3
# Bits Extraction
parameters.markerBorderBits = 1 # 1
parameters.minOtsuStdDev = 5.0 # 5.0
parameters.perspectiveRemoveIgnoredMarginPerCell = 0.4 # 0.13
# parameters.perpectiveRemovePixelPerCell = 10 # 4
# Marker Identification
parameters.maxErroneousBitsInBorderRate = 0.5 # 0.35
parameters.errorCorrectionRate = 1.2 # 0.6

w = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
h = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
print(w, h)
# print(aruco.DetectorParameters())

def get_keys():
  ret, frame = cap.read()

  # process key here
  corners, ids, rejectedImgPoints = aruco.detectMarkers(frame, dictionary)
  frame = aruco.drawDetectedMarkers(frame, corners, ids, borderColor=(0, 0, 255))
  # frame = aruco.drawDetectedMarkers(frame, rejectedImgPoints, borderColor=(0, 255, 0))
  
  # k = cv2.waitKey(16) # 60 fps?

  # Uncomment this to show camera view
  cv2.imshow('Frame', frame)
  print('send keys')

  if ids is None:
    ids = np.array([])

  result = {
    'ids': ids.tolist(),
    'corners': np.array(corners).tolist(),
  }
  print(result)

  return result

# create a Socket.IO server
sio = socketio.AsyncServer(port='5000')
app = web.Application()
sio.attach(app)

async def index(request):
  """Serve the client-side application."""
  with open('index.html') as f:
    return web.Response(text=f.read(), content_type='text/html')

@sio.on('connect')
def connect(sid, environ):
  print("connect ", sid)

@sio.on('get keys')
async def send_keys(sid):
  # Need to flatten array and convert from int32
  await sio.emit('send keys', get_keys())

@sio.on('disconnect')
def disconnect(sid):
  print('disconnect ', sid)

app.router.add_get('/', index)

if __name__ == '__main__':
  web.run_app(app, port='5000')