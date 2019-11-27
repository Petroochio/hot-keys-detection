# file io stuff
import os.path

camID = 0
whiteBalance = 1

def getParams():
  file = open('configs/camera.txt', 'r') 
  config = file.read()
  params = eval(config)
  return config

def getWhiteBalance():
  return whiteBalance

def setParam(paramName, value, cameraParameters):
  global camID
  global whiteBalance

  if (paramName == 'whiteBalance'):
    whiteBalance = float(value)
  elif (paramName == 'camera id'):
    camID = int(value)
  else:
    currentValue = getattr(cameraParameters, paramName)

    if (isinstance(currentValue, int)):
      setattr(cameraParameters, paramName, int(value))
    elif (isinstance(currentValue, float)):
      setattr(cameraParameters, paramName, float(value))
  
  write_camera_params(cameraParameters)

def write_camera_params(cameraParameters):
  global camID
  global whiteBalance

  params = {
    "camera id": camID,
    "whiteBalance": whiteBalance,

    "adaptiveThreshWinSizeMin": cameraParameters.adaptiveThreshWinSizeMin,
    "adaptiveThreshWinSizeStep": cameraParameters.adaptiveThreshWinSizeStep,
    "adaptiveThreshConstant": cameraParameters.adaptiveThreshConstant,

    "minMarkerPerimeterRate": cameraParameters.minMarkerPerimeterRate,
    "maxMarkerPerimeterRate": cameraParameters.maxMarkerPerimeterRate,
    "minCornerDistanceRate": cameraParameters.minCornerDistanceRate,
    "minMarkerDistanceRate": cameraParameters.minMarkerDistanceRate,
    "minDistanceToBorder": cameraParameters.minDistanceToBorder,

    "markerBorderBits": cameraParameters.markerBorderBits,
    "minOtsuStdDev": cameraParameters.minOtsuStdDev,
    "perspectiveRemoveIgnoredMarginPerCell": cameraParameters.perspectiveRemoveIgnoredMarginPerCell,

    "maxErroneousBitsInBorderRate": cameraParameters.maxErroneousBitsInBorderRate,
    "errorCorrectionRate": cameraParameters.errorCorrectionRate
  }

  file = open('configs/camera.txt', 'w')
  file.write(str(params))
  file.close()

def load_camera_config(cameraParameters):
  file = open('configs/camera.txt', 'r') 
  config = file.read()
  params = eval(config)

  camID = params['camID']
  whiteBalance = params['whiteBalance']
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

def getCamera():
  global camID
  return camID
