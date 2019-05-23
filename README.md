# Hot Keys Marker Detection
A simple Open CV python server that opens a port on 5000 where it sends the data of currently visible Aruco markers

## Setup

- Install Python 2.7 (we should probs upgrade)
- Install pip
- Run `pip install numpy`
- Run `pip install pyinstaller`
- Run `pip install eventlet python-socketio`
- Install Open-CV [how to](https://opencv-python-tutroals.readthedocs.io/en/latest/py_tutorials/py_setup/py_setup_in_windows/py_setup_in_windows.html#installing-opencv-from-prebuilt-binaries)

### Special Windows Stuff
- You might have to install pip manually [here are some tips](https://stackoverflow.com/a/12476379)
- Dont forget to add python to path [more tips!](https://stackoverflow.com/questions/29817447/how-to-run-pip-commands-from-cmd/45607159#45607159)

## Building

- Run `pyinstaller --onefile main.py`