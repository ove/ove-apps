# Networks App

This app supports visualisation of networks with node-link diagrams using the OVE framework. It is based on [Sigma](http://sigmajs.org/), a JavaScript library dedicated to drawing graphs. This supports datasets specified in Sigma's JSON format or [GEXF](https://gephi.org/gexf/format/). Sigma supports Canvas, SVG and WebGL rendering.

## Application State

The state of this app has a format similar to:

```json
{
    "jsonURL": "/data/sample.json",
    "settings": {
        "autoRescale": true,
        "clone": false,
        "defaultNodeColor": "#ec5148"
    },
    "renderer": "canvas"
}
```

The `jsonURL` property should be replaced with with `gexfURL` property depending on the format in which the dataset is specified. Information on all available `settings` can be found in [Sigma documentation](https://github.com/jacomyal/sigma.js/wiki/Settings). The `renderer` property is optional and defaults to `webgl`.

## Loading the App

A node-link diagram can be loaded using the OVE APIs:

Linux/Mac:

```sh
curl --header "Content-Type: application/json" --request POST --data '{"app": {"url": "http://OVE_APP_NETWORKS_HOST:PORT","states": {"load": {"jsonURL": "/data/sample.json", "settings": { "autoRescale": true, "clone": false, "defaultNodeColor": "#ec5148"}, "renderer": "canvas"}}}, "space": "OVE_SPACE", "h": 500, "w": 500, "y": 0, "x": 0}' http://OVE_CORE_HOST:PORT/section
```

Windows:

```sh
curl --header "Content-Type: application/json" --request POST --data "{\"app\": {\"url\": \"http://OVE_APP_NETWORKS_HOST:PORT\", \"states\": {\"load\": {\"jsonURL\": \"/data/sample.json\", \"settings\": { \"autoRescale\": true, \"clone\": false, \"defaultNodeColor\": \"#ec5148\"}, \"renderer\": \"canvas\"}}}, \"space\": \"OVE_SPACE\", \"h\": 500, \"w\": 500, \"y\": 0, \"x\": 0}" http://OVE_CORE_HOST:PORT/section
```

The networks app has a transparent background. If required, a background colour of choice can be set using the [Background Utility](../ove-app-html/docs/UTIL_BACKGROUND.md) provided by OVE.

## Controlling the App

The controller of the app can be loaded by accessing the URL `http://OVE_APP_NETWORKS_HOST:PORT/control.html?oveSectionId=SECTION_ID`.

The app's [API](http://OVE_APP_NETWORKS_HOST:PORT/api-docs#operation) also exposes operations such as `search`, `color`, `labelNodes`, `neighborsOf` and `reset`. These operations can be executed on a per-network basis or across all networks.

The implementation makes it possible to query on all properties of nodes and edges. The filters used must confirm to the [OData v3.0 specification](https://www.odata.org/documentation/odata-version-3-0/odata-version-3-0-core-protocol/#thefiltersystemqueryoption) and the colors used must have the format `rgb(x, y, z)` (where x, y, z are integers in the range 0-255).

[Sigma](http://sigmajs.org/) supports chaining of multiple filters and operations such as `search` and `color` operations combine node and edge filters if provided together: which has the effect of a logical AND.

To search for nodes having a size greater than or equal to 2, using OVE APIs:

```sh
curl  --request GET http://OVE_APP_NETWORKS_HOST:PORT/operation/search?filter=size%20ge%202
```

To reset the network to its original state:

```sh
curl  --request GET http://OVE_APP_NETWORKS_HOST:PORT/operation/reset
```

Instructions on invoking all operations are available on the [API Documentation](http://OVE_APP_NETWORKS_HOST:PORT/api-docs#operation).
