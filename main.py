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
cameraParameters.adaptiveThreshWinSizeStep = 3 # 10
cameraParameters.adaptiveThreshConstant = 7 # 7
# Contour Filtering
cameraParameters.minMarkerPerimeterRate = 0.03 # 0.03
cameraParameters.maxMarkerPerimeterRate = 0.2 # 4.0
cameraParameters.minCornerDistanceRate = 0.2 # 0.05
cameraParameters.minMarkerDistanceRate = 0.3 # 0.05
cameraParameters.minDistanceToBorder = 5 # 3
# Bits Extraction
cameraParameters.markerBorderBits = 1 # 1
cameraParameters.minOtsuStdDev = 5.0 # 5.0
cameraParameters.perspectiveRemoveIgnoredMarginPerCell = 0.4 # 0.13
# parameters.perpectiveRemovePixelPerCell = 10 # 4
# Marker Identification
cameraParameters.maxErroneousBitsInBorderRate = 0.63 # 0.35
cameraParameters.errorCorrectionRate = 2.8 # 0.6

# init camera
cap = None
camID = 0
def init_camera():
  global cap
  global camID
  cap = cv2.VideoCapture(camID)
  cap.set(cv2.CAP_PROP_FPS, 50)
  cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
  cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

def get_keys():
  global cap
  ret, frame = cap.read()

  # RESIZE FUNCTION TO REDUCE LATENCY - MAYBE????
  # 1280x720 1120x630 960x540
  frame = cv2.resize(frame, (1120, 630))

  # process key here
  corners, ids, rejectedImgPoints = aruco.detectMarkers(frame, dictionary, parameters=cameraParameters)
  frame = aruco.drawDetectedMarkers(frame, corners, ids, borderColor=(0, 0, 255))
  frame = aruco.drawDetectedMarkers(frame, rejectedImgPoints, borderColor=(0, 255, 0))

  # Encode Image for sending
  ret, buffer = cv2.imencode('.jpg', cv2.resize(frame, (640, 360)))
  image = base64.b64encode(buffer).decode('utf-8')

  # If no Ids are found create an empty array
  if ids is None:
    ids = np.array([])

  markers = []
  markerCorners = np.array(corners).tolist()

  # Join Corners and Ids into one array
  for i,markerId in enumerate(ids.tolist()):
    markers.append({ 'id': markerId[0], 'corners': markerCorners[i][0] })
  
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
isChangingCamera = False
detectionThread = None
camImage = None
async def detection_loop():
  global cap
  global sio
  global isChangingCamera
  global camImage

  while (True):
    keyInfo = { 'markers': [] }

    try:
      if (not isChangingCamera):
        captureInfo = get_keys()
        keyInfo['markers'] = captureInfo['markers']
        camImage = captureInfo['image']
      else:
        isChangingCamera = False
        cap.release()
        init_camera()
    except Exception:
      cap.release()
      try:
        init_camera()
      except Exception:
        pass
      pass

    await sio.emit('update markers', keyInfo)
    # await sio.emit('update image', image)
    await asyncio.sleep(1/70)

imageThread = None
async def image_loop():
  global camImage
  global sio

  while(True):
    if (camImage is not None):
      await sio.emit('update image', { 'image': camImage })
    await asyncio.sleep(1/30)


async def index(request):
  """Serve the client-side application."""
  with open('preview/index.html') as f:
    return web.Response(text=f.read(), content_type='text/html')

@sio.on('connect')
def connect(sid, environ):
  print("connect ", sid)

@sio.on('set attribute')
def set_attribute(sid, data):
  global cameraParameters
  param = getattr(cameraParameters, data['attr']) 

  if (isinstance(param, int)):
    setattr(cameraParameters, data['attr'], int(data['value']))
    print("Set param '" + data['attr'] + "' to: " + str(int(data['value'])))
  elif (isinstance(param, float)):
    print("Set param '" + data['attr'] + "' to: " + str(float(data['value'])))
    setattr(cameraParameters, data['attr'], float(data['value']))

@sio.on('set camera')
def set_camera(sid, data):
  global camID
  global isChangingCamera
  camID = int(data['camID'])
  isChangingCamera = True

@sio.on('stop detection')
def stop_detection(sid):
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
app.router.add_static('/static/', path=str('./preview'), name='static')

if __name__ == '__main__':
  init_camera()
  detectionThread = sio.start_background_task(target=detection_loop)
  imageThread = sio.start_background_task(target=image_loop)

  web.run_app(app, port='5000')
