# SVG App

This app supports rendering SVG using the OVE framework. It is based on [Tuoris](https://github.com/fvictor/tuoris), a middleware for distributed SVG rendering. An installation of [Tuoris](https://github.com/fvictor/tuoris) is required to use the SVG app. More information on installing [Tuoris](https://github.com/fvictor/tuoris) can be found in the [OVE installation guide](https://ove.readthedocs.io/en/stable/docs/INSTALLATION.html).

The SVG app depends on an environment variable named `TUORIS_HOST`, that points to the URL at which the Tuoris instance runs.

## Application State

The state of this app has a format similar to:

```json
{
    "url": "https://upload.wikimedia.org/wikipedia/commons/6/6c/Trajans-Column-lower-animated.svg"
}
```

## Loading the App

An SVG can be loaded using the OVE APIs:

Linux/Mac:

```sh
curl --header "Content-Type: application/json" --request POST --data '{"app": {"url": "http://OVE_APP_SVG_HOST:PORT","states": {"load": {"url": "https://upload.wikimedia.org/wikipedia/commons/6/6c/Trajans-Column-lower-animated.svg"}}}, "space": "OVE_SPACE", "h": 500, "w": 500, "y": 0, "x": 0}' http://OVE_CORE_HOST:PORT/section
```

Windows:

```sh
curl --header "Content-Type: application/json" --request POST --data "{\"app\": {\"url\": \"http://OVE_APP_SVG_HOST:PORT\", \"states\": {\"load\": {\"url\": \"https://upload.wikimedia.org/wikipedia/commons/6/6c/Trajans-Column-lower-animated.svg\"}}}, \"space\": \"OVE_SPACE\", \"h\": 500, \"w\": 500, \"y\": 0, \"x\": 0}" http://OVE_CORE_HOST:PORT/section
```

The SVG app has a transparent background. If required, a background colour of choice can be set using the [Background Utility](../ove-app-html/docs/UTIL_BACKGROUND.md) provided by OVE.

If the SVG app is used to display static SVGs no further controlling would be required after the SVG has been loaded. The app provides a controller that can used to control interactive SVGs.

## Controlling the App

The controller of the app can be loaded by accessing the URL `http://OVE_APP_SVG_HOST:PORT/control.html?oveSectionId=SECTION_ID`.
