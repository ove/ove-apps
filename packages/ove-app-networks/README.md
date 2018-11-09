# Networks App

This app supports visualisation of network diagrams using the OVE framework. It is based on [Sigma](http://sigmajs.org/), a JavaScript library dedicated to drawing graphs. This supports datasets specified in Sigma's JSON format or [GEXF](https://gephi.org/gexf/format/). Sigma supports Canvas, SVG and WebGL rendering.

## Application State

The state of this app has a format similar to what is provided below:

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

A network diagram can be loaded using the OVE APIs:

Windows:

```sh
curl --header "Content-Type: application/json" --request POST --data "{\"h\": 500, \"app\": {\"url\": \"http://OVE_APP_NETWORKS_HOST:PORT\", \"states\": {\"load\": {\"jsonURL\": \"/data/sample.json\", \"settings\": { \"autoRescale\": true, \"clone\": false, \"defaultNodeColor\": \"#ec5148\"}, \"renderer\": \"canvas\"}}}, \"space\": \"LocalNine\", \"w\": 500, \"y\": 0, \"x\": 0}" http://OVE_CORE_HOST:PORT/section
```

Linux/Mac:

```sh
curl --header "Content-Type: application/json" --request POST --data '{"h": 500, "app": {"url": "http://OVE_APP_NETWORKS_HOST:PORT","states": {"load": {"jsonURL": "/data/sample.json", "settings": { "autoRescale": true, "clone": false, "defaultNodeColor": "#ec5148"}, "renderer": "canvas"}}}, "space": "LocalNine", "w": 500, "y": 0, "x": 0}' http://OVE_CORE_HOST:PORT/section
```

The networks app has a transparent background. If required, a background colour of choice can be set using the OVE APIs:

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

Once the app is loaded, it can be controlled via the URL `http://OVE_APP_NETWORKS_HOST:PORT/control.html?oveSectionId=0`.
