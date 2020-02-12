# Mecha Markers Detection
A simple Open CV python server that opens a port on 5000 where it sends the data of currently visible Aruco markers

## Setup

- Install Python 3.7+ and make sure pip works
- To install server libs Run `pip install aiohttp asyncio websockets`
- To install open cv libs Run `pip install numpy opencv-python opencv-contrib-python`
- If you want to build the app Run `pip install pyinstaller`

### Special Windows Stuff
- You might have to install pip manually [here are some tips](https://stackoverflow.com/a/12476379)
- Dont forget to add python to path [more tips!](https://stackoverflow.com/questions/29817447/how-to-run-pip-commands-from-cmd/45607159#45607159)

## Building

- Run `pyinstaller main.spec`
