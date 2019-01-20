# WebRTC App

This app supports one-to-one, one-to-many and many-to-many video conferencing and screen sharing using the OVE framework. It is based on [OpenVidu](https://openvidu.io/), a platform designed to facilitate the addition of WebRTC video conferencing into existing web an mobile applications.

The WebRTC app depends on an environment variable named `OPENVIDU_HOST`, that points to the URL at which the OpenVidu instance runs. The [OpenVidu Secret](https://openvidu.io/docs/troubleshooting/#4-does-my-app-need-a-server-side) must be provided by setting the `OPENVIDU_SECRET` environment variable on the production server or alternatively on the `config.json` file which must reside only on the production server.

## Application State

The state of this app has a format similar to:

```json
{
    "sessionId": "random",
    "maxSessions": 8
}
```

The `sessionId` property can be a new or existing OpenVidu session identifier. If this is set to random, the controller will generate a random `sessionId`. The `maxSessions` property is optional. It defines the maximum number of external users that can connect to this session. It is also possible to provide a `url` property which contains the `sessionId` in it. In such situations, the controller with extract the last path segment and use it as the `sectionId`.

## Loading the App

The WebRTC app can be loaded using the OVE APIs:

Linux/Mac:

```sh
curl --header "Content-Type: application/json" --request POST --data '{"app": {"url": "http://OVE_APP_WEBRTC_HOST:PORT","states": {"load": {"sessionId": "random"}}}, "space": "OVE_SPACE", "h": 500, "w": 500, "y": 0, "x": 0}' http://OVE_CORE_HOST:PORT/section
```

Windows:

```sh
curl --header "Content-Type: application/json" --request POST --data "{\"app\": {\"url\": \"http://OVE_APP_WEBRTC_HOST:PORT\", \"states\": {\"load\": {\"sessionId\": \"random\"}}}, \"space\": \"OVE_SPACE\", \"h\": 500, \"w\": 500, \"y\": 0, \"x\": 0}" http://OVE_CORE_HOST:PORT/section
```

## Controlling the App

The controller of the app can be loaded by accessing the URL `http://OVE_APP_WEBRTC_HOST:PORT/control.html?oveSectionId=SECTION_ID`. The controller must be used to initiate a video conferencing session to which participants can join using an OpenVidu client by providing the `Session Id`.
