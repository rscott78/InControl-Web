InControl-Web
=============

This website uses Node and Express to connect to an InControl server.

### Current State

This project is at its very early stages. At current, the following is possible:

* View device state
* View history
* View and activate scenes

### Known Issues

If your InControl server is shut off, the website does not reconnect. You must restart it in the event of a disconnect.

### Contributing Changes

Anyone is able to pull the source code and contribute changes back -- indeed, this is encouraged and welcomed. Please be sure to follow the existing coding standards and patterns.

### Setup

1. Install Node from http://nodejs.org/
2. Clone or otherwise download the source for this project
3. From a CMD prompt, CD into the folder where you have this source
4. Type npm install

### Configuration

Open up the config.js file using your favorite text editor. On Windows, Notepad works great. At the top of the file you'll see 3 lines:

```
// Change these 3 values to match your setup
var server = "localhost";
var serverPort = 8711;
var serverPassword = "getindemo";
```

By default, this will connect to localhost over the default port of 8711. Change these to match your own setup, including the server password that you've got set (if any).

### Starting the Server

To start the web server, type the following from a CMD prompt:

```node app.js```
