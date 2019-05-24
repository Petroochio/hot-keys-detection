# cv libs
import cv2
from cv2 import aruco

# socket libs
from aiohttp import web
import socketio

# CV STUFF

# init camera
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FPS, 60)

# set aruco dictionary
dictionary_name = aruco.DICT_4X4_50
dictionary = aruco.getPredefinedDictionary(dictionary_name)

w = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
h = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)

def get_keys():
  ret, frame = cap.read()

  # process key here
  corners, ids, rejectedImgPoints = aruco.detectMarkers(frame, dictionary)
  frame = aruco.drawDetectedMarkers(frame, corners, ids, borderColor=(0, 0, 255))
  
  k = cv2.waitKey(16) # 60 fps?

  if ids is not None:
    print(ids)
    return ids
  
  return []

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
  await sio.emit('send keys', { 'data': list(map(lambda k: k[0], get_keys())) })

@sio.on('disconnect')
def disconnect(sid):
  print('disconnect ', sid)

app.router.add_get('/', index)

if __name__ == '__main__':
  web.run_app(app, port='5000')