# Charts App

This app supports visualisation of charts (excluding visualisation of networks) using the OVE framework. It is based on [Vega-Embed](https://github.com/vega/vega-embed), which provides support for both [Vega](https://vega.github.io/vega/) and [Vega-Lite](https://vega.github.io/vega-lite/): these are both declarative languages for interactive visualizations, but Vega-Lite is a higher level language. Vega-Embed supports Canvas and SVG rendering.

## Application State

The state of this app has a format similar to:

```json
{
    "spec": "https://raw.githubusercontent.com/vega/vega/master/docs/examples/bar-chart.vg.json",
    "options": {
        "width": 800,
        "height": 800
    }
}
```

The `spec` field points to either a URL of, or contains an embedded [Vega-Embed specification](https://vega.github.io/vega/docs/#specification).

## Loading the App

A chart can be loaded using the OVE APIs:

Windows:

```sh
curl --header "Content-Type: application/json" --request POST --data "{\"app\": {\"url\": \"http://OVE_APP_CHARTS_HOST:PORT\", \"states\": {\"load\": {\"spec\": \"https://raw.githubusercontent.com/vega/vega/master/docs/examples/bar-chart.vg.json\", \"options\": {\"width\": 800, \"height\": 800}}}}, \"space\": \"OVE_SPACE\", \"h\": 500, \"w\": 500, \"y\": 0, \"x\": 0}" http://OVE_CORE_HOST:PORT/section
```

Linux/Mac:

```sh
curl --header "Content-Type: application/json" --request POST --data '{"app": {"url": "http://OVE_APP_CHARTS_HOST:PORT","states": {"load": {"spec": "https://raw.githubusercontent.com/vega/vega/master/docs/examples/bar-chart.vg.json", "options": {"width": 800, "height": 800}}}}, "space": "OVE_SPACE", "h": 500, "w": 500, "y": 0, "x": 0}' http://OVE_CORE_HOST:PORT/section
```

The charts app has a transparent background. If required, a background colour of choice can be set using the [Background Utility](../ove-app-html/docs/UTIL_BACKGROUND.md) provided by OVE.

## Controlling the App

The controller of the app can be loaded by accessing the URL `http://OVE_APP_CHARTS_HOST:PORT/control.html?oveSectionId=SECTION_ID`.
