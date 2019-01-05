# Whiteboard App

This app creates a whiteboard that can be used within the OVE framework. The app creates a collaborative canvas that accepts handwriting and text input.

The controller UI design of the whiteboard app is based on [codoodler](https://github.com/pubnub/codoodler).

## Loading the App

A web page can be loaded using the OVE APIs:

Linux/Mac:

```sh
curl --header "Content-Type: application/json" --request POST --data '{"app": {"url": "http://OVE_APP_WHITEBOARD_HOST:PORT"}, "space": "OVE_SPACE", "h": 500, "w": 500, "y": 0, "x": 0}' http://OVE_CORE_HOST:PORT/section
```

Windows:

```sh
curl --header "Content-Type: application/json" --request POST --data "{\"app\": {\"url\": \"http://OVE_APP_WHITEBOARD_HOST:PORT\"}, \"space\": \"OVE_SPACE\", \"h\": 500, \"w\": 500, \"y\": 0, \"x\": 0}" http://OVE_CORE_HOST:PORT/section
```

## Controlling the App

The controller of the app can be loaded by accessing the URL `http://OVE_APP_WHITEBOARD_HOST:PORT/control.html?oveSectionId=SECTION_ID`.
