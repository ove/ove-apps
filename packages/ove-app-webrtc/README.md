# WebRTC App

This app supports one-to-one, one-to-many and many-to-many videoconferencing and screen sharing using the OVE framework. It is based on [OpenVidu](https://openvidu.io/), a platform designed to facilitate the addition of WebRTC videoconferencing into existing web and mobile applications. An installation of [OpenVidu](https://openvidu.io/) is required to use the WebRTC app. More information on installing [OpenVidu](https://openvidu.io/) can be found in the [OVE installation guide](https://ove.readthedocs.io/en/stable/docs/INSTALLATION.html).

The WebRTC app depends on an environment variable named `OPENVIDU_HOST`, that provides the hostname and port number at which the OpenVidu instance runs. The [OpenVidu Secret](https://openvidu.io/docs/troubleshooting/#4-does-my-app-need-a-server-side) must be provided by setting the `OPENVIDU_SECRET` environment variable on the production server or by editing the `config.json` file which must reside only on the production server.

## Application State

The state of this app has a format similar to:

```json
{
    "sessionId": "random",
    "maxSessions": 8
}
```

The `sessionId` property can be a new or existing [OpenVidu](https://openvidu.io/) session identifier: if it is set to `random`, then the controller will generate a random `sessionId`. 
It is also possible to provide a `url` property which contains the `sessionId`: in such situations, the controller will extract the last path segment and use this as the `sessionId`.

The optional `maxSessions` property defines the maximum number of external users that can connect to the session. 

## Launching the App

All OVE applications can be launched using the [Launcher UI](https://ove.readthedocs.io/en/stable/ove-ui/packages/ove-ui-launcher/README.html), the [Python Client Library](https://github.com/ove/ove-sdks/tree/master/python), and the OVE APIs. The API used to launch an application is the same for all applications, but the data that is passed into it is application-specific.

To launch the WebRTC app using the OVE APIs:

Linux/Mac:

```sh
curl --header "Content-Type: application/json" --request POST --data '{"app": {"url": "http://OVE_APP_WEBRTC_HOST:PORT","states": {"load": {"sessionId": "random"}}}, "space": "OVE_SPACE", "h": 500, "w": 500, "y": 0, "x": 0}' http://OVE_CORE_HOST:PORT/section
```

Windows:

```sh
curl --header "Content-Type: application/json" --request POST --data "{\"app\": {\"url\": \"http://OVE_APP_WEBRTC_HOST:PORT\", \"states\": {\"load\": {\"sessionId\": \"random\"}}}, \"space\": \"OVE_SPACE\", \"h\": 500, \"w\": 500, \"y\": 0, \"x\": 0}" http://OVE_CORE_HOST:PORT/section
```

## Controlling the App

A vidoconferencing call must first be initialized using the controller, which is accessible at  `http://OVE_APP_WEBRTC_HOST:PORT/control.html?oveSectionId=SECTION_ID`.

Participants can then join this call by connecting to the  [OpenVidu](https://openvidu.io/) client (accessible by opening `OPENVIDU_HOST` with a web browser) and providing the `sessionId` as the name of the call room.
