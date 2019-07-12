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

cap = None
def initCamera():
  global cap
  cap = cv2.VideoCapture(1)
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
  
    corners, ids, rejectedImgPoints = aruco.detectMarkers(frame, dictionary, parameters=parameters)
    frame = aruco.drawDetectedMarkers(frame, corners, ids, borderColor=(0, 0, 255))
    frame = aruco.drawDetectedMarkers(frame, rejectedImgPoints, borderColor=(0, 255, 0))
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