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

The `jsonURL` field should be replaced with with `gexfURL` field depending on the format in which the dataset is specified. Information on all available `settings` can be found in [Sigma documentation](https://github.com/jacomyal/sigma.js/wiki/Settings). The `renderer` field is optional and defaults to `webgl`.

## Loading the App

A node-link diagram can be loaded using the OVE APIs:

Windows:

```sh
curl --header "Content-Type: application/json" --request POST --data "{\"app\": {\"url\": \"http://OVE_APP_NETWORKS_HOST:PORT\", \"states\": {\"load\": {\"jsonURL\": \"/data/sample.json\", \"settings\": { \"autoRescale\": true, \"clone\": false, \"defaultNodeColor\": \"#ec5148\"}, \"renderer\": \"canvas\"}}}, \"space\": \"OVE_SPACE\", \"h\": 500, \"w\": 500, \"y\": 0, \"x\": 0}" http://OVE_CORE_HOST:PORT/section
```

Linux/Mac:

```sh
curl --header "Content-Type: application/json" --request POST --data '{"app": {"url": "http://OVE_APP_NETWORKS_HOST:PORT","states": {"load": {"jsonURL": "/data/sample.json", "settings": { "autoRescale": true, "clone": false, "defaultNodeColor": "#ec5148"}, "renderer": "canvas"}}}, "space": "OVE_SPACE", "h": 500, "w": 500, "y": 0, "x": 0}' http://OVE_CORE_HOST:PORT/section
```

The networks app has a transparent background. If required, a background colour of choice can be set using the [Background Utility](../ove-app-html/docs/UTIL_BACKGROUND.md) provided by OVE.

## Controlling the App

The controller of the app can be loaded by accessing the URL `http://OVE_APP_NETWORKS_HOST:PORT/control.html?oveSectionId=SECTION_ID`.
