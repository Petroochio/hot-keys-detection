import base64
import threading
import time

# cv libs
import cv2
import numpy as np
from cv2 import aruco

# socket libs
import asyncio
from aiohttp import web
import socketio

# CV STUFF

# set aruco dictionary
dictionary_name = aruco.DICT_4X4_50
dictionary = aruco.getPredefinedDictionary(dictionary_name)

cameraParameters = aruco.DetectorParameters_create()
# Thresholding
cameraParameters.adaptiveThreshWinSizeMin = 3 # >= 3
cameraParameters.adaptiveThreshWinSizeStep = 2 # 10
cameraParameters.adaptiveThreshWinSizeMax = 10 # 23
cameraParameters.adaptiveThreshConstant = 7 # 7
# Contour Filtering
cameraParameters.minMarkerPerimeterRate = 0.05 # 0.03
cameraParameters.maxMarkerPerimeterRate = 0.5 # 4.0
cameraParameters.minCornerDistanceRate = 0.05 # 0.05
cameraParameters.minMarkerDistanceRate = 0.05 # 0.05
cameraParameters.minDistanceToBorder = 3 # 3
# Bits Extraction
cameraParameters.markerBorderBits = 1 # 1
cameraParameters.minOtsuStdDev = 5.0 # 5.0
cameraParameters.perspectiveRemoveIgnoredMarginPerCell = 0.4 # 0.13
# parameters.perpectiveRemovePixelPerCell = 10 # 4
# Marker Identification
cameraParameters.maxErroneousBitsInBorderRate = 0.8 # 0.35
cameraParameters.errorCorrectionRate = 1.2 # 0.6

# init camera
cap = None
def init_camera():
  global cap
  cap = cv2.VideoCapture(0)
  cap.set(cv2.CAP_PROP_FPS, 50)
  cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
  cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

def get_keys():
  global cap
  ret, frame = cap.read()

  # process key here
  corners, ids, rejectedImgPoints = aruco.detectMarkers(frame, dictionary, parameters=cameraParameters)
  frame = aruco.drawDetectedMarkers(frame, corners, ids, borderColor=(0, 0, 255))
  frame = aruco.drawDetectedMarkers(frame, rejectedImgPoints, borderColor=(0, 255, 0))

  # Encode Image for sending
  ret, buffer = cv2.imencode('.jpg', frame)
  image = base64.b64encode(buffer).decode('utf-8')

  # If no Ids are found create an empty array
  if ids is None:
    ids = np.array([])

  markers = []
  markerCorners = np.array(corners).tolist()

  # Join Corners and Ids into one array
  for i,markerId in enumerate(ids.tolist()):
    markers.append((markerId, markerCorners[i]))
  
  result = {
    'markers': markers,
    'image': image,
  }

  return result

# create a Socket.IO server
sio = socketio.AsyncServer(port='5000')
app = web.Application()
sio.attach(app)

isDetecting = False
detectionThread = None
async def detection_loop():
  global cap
  global sio

  while (True):
    keyInfo = { 'markers': [] }

    try:
      keyInfo = get_keys()
    except Exception:
      print('capture error')
      cap.release()
      try:
        init_camera()
      except Exception:
        pass
      pass

    await sio.emit('update markers', keyInfo)
    await asyncio.sleep(1/50)
    

async def index(request):
  """Serve the client-side application."""
  with open('index.html') as f:
    return web.Response(text=f.read(), content_type='text/html')

@sio.on('connect')
def connect(sid, environ):
  print("connect ", sid)

@sio.on('set attribute')
def set_attribute(sid, data):
  setattr(cameraParameters, data['attr'], data['value'])

@sio.on('stop detection')
async def stop_detection(sid):
  global isDetecting
  global detectionThread

  if (isDetecting):
    isDetecting = False
    detectionThread.stop()
    print('Detection Stopped')

@sio.on('disconnect')
def disconnect(sid):
  print('disconnect ', sid)

app.router.add_get('/', index)

if __name__ == '__main__':
  init_camera()
  sio.start_background_task(target=detection_loop)

  web.run_app(app, port='5000')