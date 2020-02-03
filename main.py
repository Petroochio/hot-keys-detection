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

sockets = set()
videoClients = set()

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

  if (params.getFlip()):
    frame = np.fliplr(frame)
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
async def video_send_loop():
  global isSendingVideo
  global camImage

  while True:
    if (sockets and videoClients):
      if (camImage is not None):
        corners, ids, rejectedImgPoints = camData

        frame = aruco.drawDetectedMarkers(camImage, corners, ids, borderColor=(0, 0, 255))
        frame = aruco.drawDetectedMarkers(frame, rejectedImgPoints, borderColor=(0, 255, 0))

        # Encode Image for sending
        ret, buffer = cv2.imencode('.jpg', cv2.resize(frame, (640, 360)))
        image = base64.b64encode(buffer).decode('utf-8')

        message = json.dumps({'type': 'video', 'pixels': image})
        try:
          for ID in videoClients:
            for sock in sockets:
              if (ID == sock[1]):
                await sock[0].send(message)
        except Exception:
          print('video send error')
          pass

    await asyncio.sleep(0.05)

async def marker_detect_loop():
  global sockets

  while True:
    message = await detection_loop()
    if (sockets):
      try:
        await asyncio.wait([sock[0].send(message) for sock in sockets])
      except Exception:
        print('marker send error')
        pass
    await asyncio.sleep(0.01)

async def consumer(message, socket, socketID):
  global cameraParameters
  global isSendingVideo

  data = json.loads(message)
  if data['type'] == 'get camera params':
    await socket.send(json.dumps({'type': 'camera params', 'params': params.getParams()}))

  elif data['type'] == 'set camera param':
    params.setParam(data['name'], data['value'], cameraParameters)
    if (data['name'] == 'camera id'):
      init_camera()

  elif data['type'] == 'send video':
    videoClients.add(socketID)
  
  elif data['type'] == 'stop video':
    videoClients.remove(socketID)

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

async def consumer_handler(websocket, path, socketID):
  await websocket.send(json.dumps({'type': 'connected'}))
  async for message in websocket:
    await consumer(message, websocket, socketID)


numSockets = 0
async def handler(websocket, path):
  global numSockets
  global sockets
  numSockets += 1

  consumer_task = asyncio.ensure_future(consumer_handler(websocket, path, numSockets))
  newSocket = (websocket, numSockets)

  sockets.add(newSocket)
  done, pending = await asyncio.wait(
    [consumer_task],
    return_when=asyncio.FIRST_COMPLETED,
  )

  sockets.remove(newSocket)

if __name__ == '__main__':
  params.load_camera_config(cameraParameters)
  init_camera()
  get_markers()
  start_server = websockets.serve(handler, "localhost", 5000)
  
  try:
    loop = asyncio.get_event_loop()
    loop.create_task(video_send_loop())
    loop.create_task(marker_detect_loop())
    loop.run_until_complete(start_server)

    print("Mechamarkers server up on localhost:5000")
    asyncio.get_event_loop().run_forever()
  except KeyboardInterrupt:
    print("Received exit, exiting")
  