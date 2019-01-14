# Controller App

This app is a unified controller for all OVE apps. It makes use of transformation APIs exposed by OVE apps and supports common pan and zoom operations.

## Application State

The state of this app has a format similar to:

```json
{
    "type": "group",
    "groupId": "1",
}
```

The `type` parameter is mandatory and should have a value of `space`, `group` or `geometry`. The `groupId` parameter is optional, and must only be provided if `type` is `group`.

## Loading the App

An instance of the controller can be loaded using the OVE APIs:

```sh
curl --header "Content-Type: application/json" --request POST --data '{"app": {"url": "http://OVE_APP_CONTROLLER_HOST:PORT","states": {"load": {"type": "space"}}}, "space": "OVE_SPACE", "h": 500, "w": 500, "y": 0, "x": 0}' http://OVE_CORE_HOST:PORT/section
```

Windows:

```sh
curl --header "Content-Type: application/json" --request POST --data "{\"app\": {\"url\": \"http://OVE_APP_CONTROLLER_HOST:PORT\", \"states\": {\"load\": {\"type\": \"space\"}}}, \"space\": \"OVE_SPACE\", \"h\": 500, \"w\": 500, \"y\": 0, \"x\": 0}" http://OVE_CORE_HOST:PORT/section
```

## Controlling the App

The controller of the app can be loaded by accessing the URL `http://OVE_APP_CONTROLLER_HOST:PORT/control.html?oveSectionId=SECTION_ID`. The controller supports panning and zooming operations.
