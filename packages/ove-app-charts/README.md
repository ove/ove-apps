# Charts App

This app supports visualisation of charts (excluding network diagrams) using the OVE framework. It is based on [Vega](https://vega.github.io/vega/), a declarative language for creating, saving, and sharing interactive visualization designs. Vega supports Canvas and SVG rendering.

## Application State

The state of this app has a format similar to what is provided below:

```json
{
    "spec": "https://raw.githubusercontent.com/vega/vega/master/docs/examples/bar-chart.vg.json",
    "options": {
        "width": 800,
        "height": 800
    }
}
```

The `spec` field points to either a URL of, or contains an embedded [Vega specification](https://vega.github.io/vega/docs/#specification).

## Loading the App

A chart can be loaded using the OVE APIs:

Windows:

```sh
curl --header "Content-Type: application/json" --request POST --data "{\"h\": 500, \"app\": {\"url\": \"http://OVE_APP_CHARTS_HOST:PORT\", \"states\": {\"load\": {\"spec\": \"https://raw.githubusercontent.com/vega/vega/master/docs/examples/bar-chart.vg.json\", \"options\": {\"width\": 800, \"height\": 800}}}}, \"space\": \"LocalNine\", \"w\": 500, \"y\": 0, \"x\": 0}" http://OVE_CORE_HOST:PORT/section
```

Linux/Mac:

```sh
curl --header "Content-Type: application/json" --request POST --data '{"h": 500, "app": {"url": "http://OVE_APP_CHARTS_HOST:PORT","states": {"load": {"spec": "https://raw.githubusercontent.com/vega/vega/master/docs/examples/bar-chart.vg.json", "options": {"width": 800, "height": 800}}}}, "space": "LocalNine", "w": 500, "y": 0, "x": 0}' http://OVE_CORE_HOST:PORT/section
```

The charts app has a transparent background. If required, a background colour of choice can be set using the OVE APIs:

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

Once the app is loaded, it can be controlled via the URL `http://OVE_APP_CHARTS_HOST:PORT/control.html?oveSectionId=0`.
