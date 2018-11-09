# Images App

This app supports visualisation of images using the OVE framework. It is based on [OpenSeadragon](https://openseadragon.github.io/) and supports high resolution zoomable images.

## Application State

The state of this app has a format similar to what is provided below:

```json
{
    "tileSources": "https://openseadragon.github.io/example-images/highsmith/highsmith.dzi"
}
```

The `tileSources` field points to a [DZI file](https://docs.microsoft.com/en-us/previous-versions/windows/silverlight/dotnet-windows-silverlight/cc645077(v=vs.95)) and could be of an XML or JSON format as explained in the [OpenSeadragon documentation](https://openseadragon.github.io/examples/tilesource-dzi/).

The app also supports alternative types of content using other types of [tile sources supported by OpenSeadragon](https://openseadragon.github.io/#examples-and-features).

## Loading the App

An image can be loaded using the OVE APIs:

Windows:

```sh
curl --header "Content-Type: application/json" --request POST --data "{\"h\": 500, \"app\": {\"url\": \"http://OVE_APP_IMAGES_HOST:PORT\", \"states\": {\"load\": {\"tileSources\": \"https://openseadragon.github.io/example-images/highsmith/highsmith.dzi\"}}}, \"space\": \"LocalNine\", \"w\": 500, \"y\": 0, \"x\": 0}" http://OVE_CORE_HOST:PORT/section
```

Linux/Mac:

```sh
curl --header "Content-Type: application/json" --request POST --data '{"h": 500, "app": {"url": "http://OVE_APP_IMAGES_HOST:PORT","states": {"load": {"tileSources": "https://openseadragon.github.io/example-images/highsmith/highsmith.dzi"}}}, "space": "LocalNine", "w": 500, "y": 0, "x": 0}' http://OVE_CORE_HOST:PORT/section
```

The images app has a transparent background. If required, a background colour of choice can be set using the OVE APIs:

Windows:

```sh
curl --header "Content-Type: application/json" --request POST --data "{\"h\": 500, \"app\": {\"url\": \"http://OVE_APP_HTML_HOST:PORT\", \"states\": {\"load\": {\"url\": \"/data/background/index.html?background=COLOUR\"}}}, \"space\": \"LocalNine\", \"w\": 500, \"y\": 0, \"x\": 0}" http://OVE_CORE_HOST:PORT/section
```

Linux/Mac:

```sh
curl --header "Content-Type: application/json" --request POST --data '{"h": 500, "app": {"url": "http://OVE_APP_HTML_HOST:PORT","states": {"load": {"url": "/data/background/index.html?background=COLOUR"}}}, "space": "LocalNine", "w": 500, "y": 0, "x": 0}' http://OVE_CORE_HOST:PORT/section
```

The background colour can be specified either as [a keyword or hexadecimal value](https://developer.mozilla.org/en-US/docs/Web/CSS/background-color) such as `Black` or `#f0f0f0`.

## Controlling the App

Once the app is loaded, it can be controlled via the URL `http://OVE_APP_IMAGES_HOST:PORT/control.html?oveSectionId=0`. The controller supports panning and zooming of images.
