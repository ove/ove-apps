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

## Loading the App

A web page can be loaded using the OVE APIs:

Linux/Mac:

```sh
curl --header "Content-Type: application/json" --request POST --data '{"app": {"url": "http://OVE_APP_HTML_HOST:PORT","states": {"load": {"url": "http://my.domain"}}}, "space": "OVE_SPACE", "h": 500, "w": 500, "y": 0, "x": 0}' http://OVE_CORE_HOST:PORT/section
```

Windows:

```sh
curl --header "Content-Type: application/json" --request POST --data "{\"app\": {\"url\": \"http://OVE_APP_HTML_HOST:PORT\", \"states\": {\"load\": {\"url\": \"http://my.domain\"}}}, \"space\": \"OVE_SPACE\", \"h\": 500, \"w\": 500, \"y\": 0, \"x\": 0}" http://OVE_CORE_HOST:PORT/section
```

## Controlling the App

The controller of the app can be loaded by accessing the URL `http://OVE_APP_HTML_HOST:PORT/control.html?oveSectionId=SECTION_ID`.
