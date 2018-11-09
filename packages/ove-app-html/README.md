# HTML App

This app supports displaying HTML web pages using the OVE framework.

## Utilities

The HTML app hosts within it a number of utilities useful for another OVE app or a generic web page.

### Background

If a web page or an app has a transparent background by design, if required a background colour of choice can be set using this utility:

Windows:

```sh
curl --header "Content-Type: application/json" --request POST --data "{\"h\": 500, \"app\": {\"url\": \"http://OVE_APP_HTML_HOST:PORT\", \"states\": {\"load\": {\"url\": \"/data/background/index.html?background=COLOUR\"}}}, \"space\": \"LocalNine\", \"w\": 500, \"y\": 0, \"x\": 0}" http://OVE_CORE_HOST:PORT/section
```

Linux/Mac:

```sh
curl --header "Content-Type: application/json" --request POST --data '{"h": 500, "app": {"url": "http://OVE_APP_HTML_HOST:PORT","states": {"load": {"url": "/data/background/index.html?background=COLOUR"}}}, "space": "LocalNine", "w": 500, "y": 0, "x": 0}' http://OVE_CORE_HOST:PORT/section
```

The background colour can be specified either as [a keyword or hexadecimal value](https://developer.mozilla.org/en-US/docs/Web/CSS/background-color) such as `Black` or `#f0f0f0`.

### Distributed.js

This is a [JavaScript library](https://raw.githubusercontent.com/ove/ove-apps/master/packages/ove-app-html/src/libs/distributed.js) for distributing JavaScript function calls and variables from controllers to viewers. The `setDistributed` function distributes the execution of functions and the `watch` function propagates updates on one or more properties from controller to viewers.

This library also exposes a number of helpers, one of which is [THREE.Distributed](https://raw.githubusercontent.com/ove/ove-apps/master/packages/ove-app-html/src/libs/distributed/three.js), which is library for distributing Three.js functionality using the Distributed.js library.

## Application State

The state of this app has a format similar to what is provided below:

```json
{
    "url": "http://my.domain"
}
```

## Loading the App

A web page can be loaded using the OVE APIs:

Windows:

```sh
curl --header "Content-Type: application/json" --request POST --data "{\"h\": 500, \"app\": {\"url\": \"http://OVE_APP_HTML_HOST:PORT\", \"states\": {\"load\": {\"url\": \"http://my.domain\"}}}, \"space\": \"LocalNine\", \"w\": 500, \"y\": 0, \"x\": 0}" http://OVE_CORE_HOST:PORT/section
```

Linux/Mac:

```sh
curl --header "Content-Type: application/json" --request POST --data '{"h": 500, "app": {"url": "http://OVE_APP_HTML_HOST:PORT","states": {"load": {"url": "http://my.domain"}}}, "space": "LocalNine", "w": 500, "y": 0, "x": 0}' http://OVE_CORE_HOST:PORT/section
```

## Controlling the App

Once the app is loaded, it can be controlled via the URL `http://OVE_APP_HTML_HOST:PORT/control.html?oveSectionId=0`.
