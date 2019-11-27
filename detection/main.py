import os.path
import cv2
import numpy as np
from cv2 import aruco
import asyncio
import websockets
import json
import params
import base64
# file io stuff
import os.path

CLIENTS = set()

# CV STUFF
cap = None
camData = None

# set aruco dictionary
dictionary_name = aruco.DICT_4X4_100
dictionary = aruco.getPredefinedDictionary(dictionary_name)
cameraParameters = aruco.DetectorParameters_create()

# init camera
def init_camera():
  global cap
  cap = cv2.VideoCapture(params.getCamera())
  cap.set(cv2.CAP_PROP_FPS, 60)
  cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
  cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

def get_markers():
  global cap
  global camImage
  global camData

  ret, frame = cap.read()
  frame = cv2.addWeighted(frame, params.getWhiteBalance(), np.zeros(frame.shape, frame.dtype), 0, 0)

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

isDetecting = False
isChangingCamera = False
detectionThread = None
camImage = None

async def detection_loop():
  global cap
  global isChangingCamera
  global camImage
  global watCount

  keyInfo = { 'markers': [] }

  try:
    if (not isChangingCamera):
      captureInfo = get_markers()
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
  return json.dumps({'type': 'markers', 'markers': keyInfo })

isSendingVideo = False
async def video_send_loop(websocket, path):
  global isSendingVideo
  global camImage

  while True:
    if (isSendingVideo):
      if (camImage is not None):
        corners, ids, rejectedImgPoints = camData

        frame = aruco.drawDetectedMarkers(camImage, corners, ids, borderColor=(0, 0, 255))
        frame = aruco.drawDetectedMarkers(frame, rejectedImgPoints, borderColor=(0, 255, 0))

        # Encode Image for sending
        ret, buffer = cv2.imencode('.jpg', cv2.resize(frame, (640, 360)))
        image = base64.b64encode(buffer).decode('utf-8')

        message = json.dumps({'type': 'video', 'pixels': image})

        await websocket.send(message)
    await asyncio.sleep(0.05)

async def marker_detect_loop(websocket, path):
  while True:
    message = await detection_loop()
    await websocket.send(message)
    await asyncio.sleep(0.01)

async def consumer(message, socket):
  global cameraParameters
  global isSendingVideo

  data = json.loads(message)
  if data['type'] == 'get camera params':
    await socket.send(json.dumps({'type': 'camera params', 'params': params.getParams()}))

  elif data['type'] == 'set camera param':
    params.setParam(data['name'], data['value'], cameraParameters)

  elif data['type'] == 'toggle video':
    isSendingVideo = (not isSendingVideo)

  elif data['type'] == 'get input config':
    config = 'ERROR NO CONFIG'
    if (os.path.isfile('configs/inputs.txt')):
      file = open('configs/inputs.txt', 'r') 
      config = file.read()

    message = json.dumps({'type': 'input config', 'config': config })
    await socket.send(message)

  elif data['type'] == 'set input config':
    # write data['config'] to file
    file = open('configs/inputs.txt', 'w')
    file.write(data['config'])
    file.close()

async def consumer_handler(websocket, path):
  await websocket.send(json.dumps({'type': 'connected'}))
  async for message in websocket:
    # print(message)
    await consumer(message, websocket)

async def handler(websocket, path):
  print('new connection')

  consumer_task = asyncio.ensure_future(consumer_handler(websocket, path))
  marker_task = asyncio.ensure_future(marker_detect_loop(websocket, path))
  video_task = asyncio.ensure_future(video_send_loop(websocket, path))

  done, pending = await asyncio.wait(
    [consumer_task, marker_task, video_task],
    return_when=asyncio.FIRST_COMPLETED,
  )

  for task in pending:
    task.cancel()

if __name__ == '__main__':
  init_camera()
  get_markers()
  start_server = websockets.serve(handler, "localhost", 5000)
  
  try:
    asyncio.get_event_loop().run_until_complete(start_server)
    print("Mechamarkers server up on localhost:5000")
    asyncio.get_event_loop().run_forever()
  except KeyboardInterrupt:
    print("Received exit, exiting")
  