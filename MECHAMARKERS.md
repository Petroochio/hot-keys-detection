# How to run Mechamarkers Desktop App

Open the folder containing the desktop application named Mechamarkers, and run the program named **main.exe**. This will open a console window that hosts the server and detection software. Make sure you have a camera connected to the computer before running the dektop app, or detection will not occur. This application currently only works on windows as well.

# Printing Markers for Testing

We recommend this website ` http://chev.me/arucogen/ ` for generating markers, and then printing them out. For the build we have shared, markers are limited to 0 - 250 of the 4x4 dictionary. Markers that are outside of this range, or not 4x4 will not be detected.

# Detection Parameters

To view the detection parameters and tweak them in real time, open a web browser with the desktop app running in the background and go to ` localhost:5000 `. You may also change the camera the application is using from this page, as long as you have more than one camera selected (note: the camera ids start from zero).

# Input Generator

You may test out the input generator by going to this url ` localhost:5000/inputgenerator ` with the desktop app running. From here you can create an input group, give it a name and change it's parameters. To select a marker for the anchor of a group, you must first click on the input field then click on the marker in the camera preview.

You may also add any number of inputs to a group. When you add an input, you must select a type before you can give it a marker as an actor. Assigning and actor for an input is done the same way as the anchor for the group. Once a type and an actor is selected for an input, make sure you set the relative position by clicking on the field so the system can calculate it.

To view a preview of the output of your group(s) toggle the group preview. And to save your config, hold down the save button until it turns green. You can load a stored input config by clicking the load button. This build only supports storing one config at a time. You can view the raw JSON of the config by going into Mechamarkers/configs/inputs.txt
