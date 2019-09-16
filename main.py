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

# file io stuff
import os.path

# CV STUFF
cap = None
camID = 0
camData = None

# set aruco dictionary
dictionary_name = aruco.DICT_4X4_100
dictionary = aruco.getPredefinedDictionary(dictionary_name)

cameraParameters = aruco.DetectorParameters_create()

def write_camera_params():
  global camID
  global cameraParameters

  params = {
    'camID': camID,

    'adaptiveThreshWinSizeMin': cameraParameters.adaptiveThreshWinSizeMin,
    'adaptiveThreshWinSizeStep': cameraParameters.adaptiveThreshWinSizeStep,
    'adaptiveThreshConstant': cameraParameters.adaptiveThreshConstant,

    'minMarkerPerimeterRate': cameraParameters.minMarkerPerimeterRate,
    'maxMarkerPerimeterRate': cameraParameters.maxMarkerPerimeterRate,
    'minCornerDistanceRate': cameraParameters.minCornerDistanceRate,
    'minMarkerDistanceRate': cameraParameters.minMarkerDistanceRate,
    'minDistanceToBorder': cameraParameters.minDistanceToBorder,

    'markerBorderBits': cameraParameters.markerBorderBits,
    'minOtsuStdDev': cameraParameters.minOtsuStdDev,
    'perspectiveRemoveIgnoredMarginPerCell': cameraParameters.perspectiveRemoveIgnoredMarginPerCell,

    'maxErroneousBitsInBorderRate': cameraParameters.maxErroneousBitsInBorderRate,
    'errorCorrectionRate': cameraParameters.errorCorrectionRate
  }

  file = open('configs/camera.txt', 'w')
  file.write(str(params))
  file.close()

def load_camera_config():
  file = open('configs/camera.txt', 'r') 
  config = file.read()
  params = eval(config)

  camID = params['camID']
  # Thresholding
  cameraParameters.adaptiveThreshWinSizeMin = params['adaptiveThreshWinSizeMin']
  cameraParameters.adaptiveThreshWinSizeStep = params['adaptiveThreshWinSizeStep']
  cameraParameters.adaptiveThreshConstant = params['adaptiveThreshConstant']
  # Contour Filtering
  cameraParameters.minMarkerPerimeterRate = params['minMarkerPerimeterRate']
  cameraParameters.maxMarkerPerimeterRate = params['maxMarkerPerimeterRate']
  cameraParameters.minCornerDistanceRate = params['minCornerDistanceRate']
  cameraParameters.minMarkerDistanceRate = params['minMarkerDistanceRate']
  cameraParameters.minDistanceToBorder = params['minDistanceToBorder']
  # Bits Extraction
  cameraParameters.markerBorderBits = params['markerBorderBits']
  cameraParameters.minOtsuStdDev = params['minOtsuStdDev']
  cameraParameters.perspectiveRemoveIgnoredMarginPerCell = params['perspectiveRemoveIgnoredMarginPerCell']
  # parameters.perpectiveRemovePixelPerCell = 10 # 4
  # Marker Identification
  cameraParameters.maxErroneousBitsInBorderRate = params['maxErroneousBitsInBorderRate']
  cameraParameters.errorCorrectionRate = params['errorCorrectionRate']

# init camera
def init_camera():
  global cap
  global camID
  cap = cv2.VideoCapture(camID)
  cap.set(cv2.CAP_PROP_FPS, 60)
  cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
  cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

def get_keys():
  global cap
  global camImage
  global camData
  ret, frame = cap.read()
  frame = cv2.addWeighted(frame, 1.1, np.zeros(frame.shape, frame.dtype), 0, 0)

  # RESIZE FUNCTION TO REDUCE LATENCY - MAYBE????
  # 1280x720 1120x630 960x540
  frame = cv2.resize(frame, (1280, 720))

  # process key here
  corners, ids, rejectedImgPoints = aruco.detectMarkers(frame, dictionary, parameters=cameraParameters)
  camImage = frame
  camData = (corners, ids, rejectedImgPoints)

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
    await asyncio.sleep(1/70)

imageThread = None
async def image_loop():
  global camImage
  global sio

  while(True):
    if (camImage is not None):
      corners, ids, rejectedImgPoints = camData

      frame = aruco.drawDetectedMarkers(camImage, corners, ids, borderColor=(0, 0, 255))
      frame = aruco.drawDetectedMarkers(frame, rejectedImgPoints, borderColor=(0, 255, 0))

      # Encode Image for sending
      ret, buffer = cv2.imencode('.jpg', cv2.resize(frame, (640, 360)))
      image = base64.b64encode(buffer).decode('utf-8')

      await sio.emit('update image', { 'image': image })
    await asyncio.sleep(1/30)


async def index(request):
  """Serve the client-side application."""
  with open('preview/index.html') as f:
    return web.Response(text=f.read(), content_type='text/html')

@sio.on('connect')
def connect(sid, environ):
  print("connect ", sid)

@sio.on('get camera config')
async def get_params(sid):
  file = open('configs/camera.txt', 'r') 
  config = file.read()
  params = eval(config)

  await sio.emit('send camera config', params)

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
  
  write_camera_params()

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

@sio.on('get uv config')
async def get_uv_config(sid):
  config = 'ERROR NO CONFIG'
  if (os.path.isfile('configs/uvs.txt')):
    file = open('configs/uvs.txt', 'r') 
    config = file.read()
  await sio.emit('send uv config', { 'config': config })

@sio.on('set uv config')
def set_uv_config(sid, data):
  # write data['config'] to file
  file = open('configs/uvs.txt', 'w')
  file.write(data['config'])
  file.close()

@sio.on('get inputs config')
async def get_inputs_config(sid):
  config = 'ERROR NO CONFIG'
  if (os.path.isfile('configs/inputs.txt')):
    file = open('configs/inputs.txt', 'r') 
    config = file.read()
  await sio.emit('send inputs config', { 'config': config })

@sio.on('set inputs config')
def set_uv_config(sid, data):
  # write data['config'] to file
  file = open('configs/inputs.txt', 'w')
  file.write(data['config'])
  file.close()

@sio.on('disconnect')
def disconnect(sid):
  print('disconnect ', sid)

app.router.add_get('/', index)
app.router.add_static('/static/', path=str('./preview'), name='static')

if __name__ == '__main__':
  load_camera_config()
  init_camera()
  detectionThread = sio.start_background_task(target=detection_loop)
  imageThread = sio.start_background_task(target=image_loop)

  web.run_app(app, port='5000')
