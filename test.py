import cv2
import numpy as np
import math
from cv2 import aruco

dictionary_name = aruco.DICT_4X4_50
dictionary = aruco.getPredefinedDictionary(dictionary_name)

parameters = aruco.DetectorParameters_create()
# Thresholding
parameters.adaptiveThreshWinSizeMin = 3 # >= 3
parameters.adaptiveThreshWinSizeStep = 2 # 10
parameters.adaptiveThreshWinSizeMax = 10 # 23
parameters.adaptiveThreshConstant = 7 # 7
# Contour Filtering
parameters.minMarkerPerimeterRate = 0.05 # 0.03
parameters.maxMarkerPerimeterRate = 0.5 # 4.0
parameters.minCornerDistanceRate = 0.05 # 0.05
parameters.minMarkerDistanceRate = 0.05 # 0.05
parameters.minDistanceToBorder = 3 # 3
# Bits Extraction
parameters.markerBorderBits = 1 # 1
parameters.minOtsuStdDev = 5.0 # 5.0
parameters.perspectiveRemoveIgnoredMarginPerCell = 0.4 # 0.13
# parameters.perpectiveRemovePixelPerCell = 10 # 4
# Marker Identification
parameters.maxErroneousBitsInBorderRate = 0.8 # 0.35
parameters.errorCorrectionRate = 1.2 # 0.6

# Define camera matrix K
K = np.array([[2092.76344, 0, 932.885375],[0, 2079.89452, 524.715539],[0, 0, 1]])

# Define distortion coefficients d
d = np.array([-6.80248928e-01, -2.05147602e+00, -1.80710163e-02, -2.27621078e-03, 1.38079898e+01])

cap = None
def initCamera():
  global cap
  cap = cv2.VideoCapture(0)
  cap.set(cv2.CAP_PROP_FPS, 50)
  cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
  cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
  w = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
  h = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
  print(w, h)
# print(aruco.DetectorParameters())

initCamera()
while True:
  try:
    ret, frame = cap.read()

    frame = cv2.addWeighted(frame, 1.3, np.zeros(frame.shape, frame.dtype), 0, 0)
    # h, w = frame.shape[:2]

    # # Generate new camera matrix from parameters
    # newcameramatrix, roi = cv2.getOptimalNewCameraMatrix(K, d, (w,h), 0)

    # # Generate look-up tables for remapping the camera image
    # mapx, mapy = cv2.initUndistortRectifyMap(K, d, None, newcameramatrix, (w, h), 5)

    # # Remap the original image to a new image
    # frame = cv2.remap(frame, mapx, mapy, cv2.INTER_LINEAR)
  
    corners, ids, rejectedImgPoints = aruco.detectMarkers(frame, dictionary, parameters=parameters)
    frame = aruco.drawDetectedMarkers(frame, corners, ids, borderColor=(0, 0, 255))
    frame = aruco.drawDetectedMarkers(frame, rejectedImgPoints, borderColor=(0, 255, 0))
    
    # markers = []
    # markerCorners = np.array(corners).tolist()
    # for i,markerId in ids.tolist():
    #   markers.append((markerId, markerCorners[i]))
    # result = {
    #   'ids': ids.tolist(),
    #   'corners': np.array(corners).tolist(),
    # }
    # print(result)

    cv2.imshow('Frame', frame)

    k = cv2.waitKey(30)
    if k == 27:
      break
  except Exception:
    cap.release()
    try:
      initCamera()
    except Exception:
      pass
    pass

cap.release()
cv2.destroyAllWindows()