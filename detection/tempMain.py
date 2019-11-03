import os.path
import cv2
import numpy as np
from cv2 import aruco
import asyncio
import websockets
import json

# CV STUFF
cap = None
camID = 0
camData = None
whiteBalance = 1

# set aruco dictionary
dictionary_name = aruco.DICT_4X4_100
dictionary = aruco.getPredefinedDictionary(dictionary_name)
cameraParameters = aruco.DetectorParameters_create()

# init camera
def init_camera():
  global cap
  global camID
  cap = cv2.VideoCapture(camID)
  cap.set(cv2.CAP_PROP_FPS, 60)
  cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
  cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

def get_markers():
  global cap
  global camImage
  global camData
  global whiteBalance

  ret, frame = cap.read()
  frame = cv2.addWeighted(frame, whiteBalance, np.zeros(frame.shape, frame.dtype), 0, 0)

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

    return json.dumps({'type': 'markers', 'ids': keyInfo})
    # await asyncio.sleep(1/70)

async def producer_handler(websocket, path):
  while True:
    message = await detection_loop()
    await websocket.send(message)

def consumer(message):
  print('got msg')

async def consumer_handler(websocket, path):
  async for message in websocket:
    await consumer(message)

async def handler(websocket, path):
  consumer_task = asyncio.ensure_future(consumer_handler(websocket, path))

  producer_task = asyncio.ensure_future(producer_handler(websocket, path))

  done, pending = await asyncio.wait(
    [consumer_task, producer_task],
    return_when=asyncio.FIRST_COMPLETED,
  )

  for task in pending:
    task.cancel()

if __name__ == '__main__':
  init_camera()
  start_server = websockets.serve(handler, "localhost", 5000)
  asyncio.get_event_loop().run_until_complete(start_server)
  print("Mechamarkers server up on localhost:5000")
  asyncio.get_event_loop().run_forever()