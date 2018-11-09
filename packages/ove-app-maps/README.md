# Maps App

This app supports visualisation of dynamic maps using the OVE framework. It is based on [OpenLayers](https://openlayers.org/) and supports tiled map layers (from Bing, OSM, etc), vector data described in formats such as [GeoJSON](http://geojson.org/) and custom overlays built using JavaScript libraries such as [D3.js](https://d3js.org/).

The maps app depends on a *Map Layers* configuration that can be provided within the `config.json` file (either embedded or as a URL) or as an environment variable named `OVE_MAPS_LAYERS`, that points to a URL.

## Application State

The state of this app has a format similar to what is provided below:

```json
{
    "center": ["-11137.70850550061", "6710544.04980525"],
    "resolution": "77",
    "zoom": "12",
    "enabledLayers":["23"],
    "scripts":["http://my.domain/single.js"]
}
```

The `center`, `resolution` and `zoom` parameters are mandatory. Optionally, there can be one or more enabled layers and one or more scripts to load custom overlays as seen above.

## Loading the App

A map can be loaded using the OVE APIs:

Windows:

```sh
curl --header "Content-Type: application/json" --request POST --data "{\"h\": 500, \"app\": {\"url\": \"http://OVE_APP_MAPS_HOST:PORT\", \"states\": {\"load\": {\"center\": [\"-11137.70850550061\", \"6710544.04980525\"], \"resolution\": \"77\", \"zoom\": \"12\", \"enabledLayers\":[\"23\"], \"scripts\":[\"http://my.domain/single.js\"]}}}, \"space\": \"LocalNine\", \"w\": 500, \"y\": 0, \"x\": 0}" http://OVE_CORE_HOST:PORT/section
```

Linux/Mac:

```sh
curl --header "Content-Type: application/json" --request POST --data '{"h": 500, "app": {"url": "http://OVE_APP_MAPS_HOST:PORT","states": {"load": {"center": ["-11137.70850550061", "6710544.04980525"], "resolution": "77", "zoom": "12", "enabledLayers":["23"], "scripts":["http://my.domain/single.js"]}}}, "space": "LocalNine", "w": 500, "y": 0, "x": 0}' http://OVE_CORE_HOST:PORT/section
```

## Controlling the App

Once the app is loaded, it can be controlled via the URL `http://OVE_APP_MAPS_HOST:PORT/control.html?oveSectionId=0&layers=23`. The layers parameter in the URL is optional and can have more than one value at a time separated by commas. The controller supports panning and zooming of maps.

## Key considerations when using the App

All considerations when using this app are directly related to its reliability and performance:

1. The maps app tends to load many tiles on screens with higher resolutions and tile servers that are slow and remote tend to perform very poorly compared to servers that are much faster and locally hosted.
2. JavaScript executed to load custom overlays must not introduce any performance bottlenecks or execute code that has a negative impact on the reliability of OVE.
3. The Map Layers configuration must be available (unless it is embedded in `config.json`) before the server-side of this app is launched.
