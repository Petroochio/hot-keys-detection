# Hot Keys Marker Detection
A simple Open CV python server that opens a port on 5000 where it sends the data of currently visible Aruco markers

## Setup

- Install Python 2.7 (we should probs upgrade)
- Install pip
- Run `pip install numpy`
- Run `pip install pyinstaller`
- Run `pip install eventlet python-socketio`
- Install Open-CV

## Building

- Run `pyinstaller --onefile main.py`