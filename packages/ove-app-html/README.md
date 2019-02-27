# HTML App

This app supports displaying HTML web pages using the OVE framework.

## Utilities

The HTML app hosts within it a number of utilities useful for another OVE app or a generic web page:

1. [Background Utility](docs/UTIL_BACKGROUND.md)
2. [Distributed.js Library](docs/LIB_DISTRIBUTED.md)

## Application State

The state of this app has a format similar to:

```json
{
    "url": "http://my.domain"
}
```

The `url`, property is mandatory. Optionally, `launchDelay` and `changeAt` properties can be provided to control the initial delay to pre-load the contents of the web page and the precise time at which all clients will change the page they display.

## Launching the App

All OVE applications can be launched using the [Launcher UI](https://ove.readthedocs.io/en/stable/ove-ui/packages/ove-ui-launcher/README.html), the [Python Client Library](https://github.com/ove/ove-sdks/tree/master/python), and the OVE APIs. The API used to launch an application is the same for all applications, but the data that is passed into it is application-specific.

To launch the HTML app and load a web page using the OVE APIs:

Linux/Mac:

```sh
curl --header "Content-Type: application/json" --request POST --data '{"app": {"url": "http://OVE_APP_HTML_HOST:PORT","states": {"load": {"url": "http://my.domain"}}}, "space": "OVE_SPACE", "h": 500, "w": 500, "y": 0, "x": 0}' http://OVE_CORE_HOST:PORT/section
```

Windows:

```sh
curl --header "Content-Type: application/json" --request POST --data "{\"app\": {\"url\": \"http://OVE_APP_HTML_HOST:PORT\", \"states\": {\"load\": {\"url\": \"http://my.domain\"}}}, \"space\": \"OVE_SPACE\", \"h\": 500, \"w\": 500, \"y\": 0, \"x\": 0}" http://OVE_CORE_HOST:PORT/section
```

If the HTML app is used to display static web pages no further controlling would be required after the web page has been loaded. The app provides a controller and exposes API that can used to control interactive web pages.

## Controlling the App

The controller of the app can be loaded by accessing the URL `http://OVE_APP_HTML_HOST:PORT/control.html?oveSectionId=SECTION_ID`.

The app's API also exposes a `refresh` operation. This operation can be executed on an individual web page or across all web pages.

To refresh a web page that is already loaded, using OVE APIs:

```sh
curl  --request POST http://OVE_APP_HTML_HOST:PORT/operation/refresh
```
