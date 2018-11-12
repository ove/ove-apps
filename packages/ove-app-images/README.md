# Images App

This app supports the display of images using the OVE framework. It is based on [OpenSeadragon](https://openseadragon.github.io/) and supports high resolution zoomable images. These images can be of any format OpenSeadragon supports such as [DZI](https://openseadragon.github.io/examples/tilesource-dzi/) or [Simple Image](https://openseadragon.github.io/examples/tilesource-image/).

## Application State

The state of this app has a format similar to:

```json
{
    "tileSources": "https://openseadragon.github.io/example-images/highsmith/highsmith.dzi"
}
```

The `tileSources` field points to a [DZI file](https://docs.microsoft.com/en-us/previous-versions/windows/silverlight/dotnet-windows-silverlight/cc645077(v=vs.95)) and could be of an XML or JSON format as explained in the [OpenSeadragon documentation](https://openseadragon.github.io/examples/tilesource-dzi/).

The app also supports alternative types of content using other types of [tile sources supported by OpenSeadragon](https://openseadragon.github.io/#examples-and-features).

## Loading the App

An image can be loaded using the OVE APIs:

Linux/Mac:

```sh
curl --header "Content-Type: application/json" --request POST --data '{"app": {"url": "http://OVE_APP_IMAGES_HOST:PORT","states": {"load": {"tileSources": "https://openseadragon.github.io/example-images/highsmith/highsmith.dzi"}}}, "space": "OVE_SPACE", "h": 500, "w": 500, "y": 0, "x": 0}' http://OVE_CORE_HOST:PORT/section
```

Windows:

```sh
curl --header "Content-Type: application/json" --request POST --data "{\"app\": {\"url\": \"http://OVE_APP_IMAGES_HOST:PORT\", \"states\": {\"load\": {\"tileSources\": \"https://openseadragon.github.io/example-images/highsmith/highsmith.dzi\"}}}, \"space\": \"OVE_SPACE\", \"h\": 500, \"w\": 500, \"y\": 0, \"x\": 0}" http://OVE_CORE_HOST:PORT/section
```

The images app has a transparent background. If required, a background colour of choice can be set using the [Background Utility](../ove-app-html/docs/UTIL_BACKGROUND.md) provided by OVE.

## Controlling the App

The controller of the app can be loaded by accessing the URL `http://OVE_APP_IMAGES_HOST:PORT/control.html?oveSectionId=0`. The controller supports panning and zooming of images.
