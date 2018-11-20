# Maps App

This app supports visualisation of dynamic maps using the OVE framework. It is based on [OpenLayers](https://openlayers.org/) and supports tiled map layers (from Bing, OSM, etc), vector data described in formats such as [GeoJSON](http://geojson.org/) and custom overlays built using JavaScript libraries such as [D3.js](https://d3js.org/).

The maps app depends on a [Map Layers configuration](../ove-app-maps/docs/MAP_LAYERS_JSON.md) that can be provided within the `config.json` file (either embedded or as a URL) or as an environment variable named `OVE_MAPS_LAYERS`, that points to a URL.

## Application State

The state of this app has a format similar to:

```json
{
    "center": ["-11137.70850550061", "6710544.04980525"],
    "resolution": "77",
    "zoom": "12",
    "enabledLayers":["23"],
    "scripts":["http://my.domain/customLayer.js"]
}
```

The `center`, `resolution` and `zoom` properties are mandatory. Optionally, there can be one or more enabled layers and one or more scripts to load custom overlays as seen above. The `enabledLayers` property accepts a list of integer values. These integer values correspond to the order (starting from 0) in which the layers were defined on the [Map Layers configuration](../ove-app-maps/docs/MAP_LAYERS_JSON.md). The `scripts` property accepts a list of URLs of JavaScript files.

## Designing Custom Overlays

Custom overlays for the maps app are loaded using a single script as explained above in the [Application State](#application-state) section. However, there may be the requirement to load multiple dependent JavaScript libraries, and also other resources such as datasets and CSS files. The example below shows what a typical `customLayer.js` should look like.

```JavaScript
let transformURL;

(function () {
    if (!window.customLayer) {
        let js_files = ["https://d3js.org/d3.v5.min.js", "./script.js"];
        let css_files = ["./customLayer.css"];

        transformURL = function(url) {
            if (url.startsWith('./')) {
                return getHostName(true, 'customLayer.js') + '/' + url.slice(2);
            } else {
                return url;
            }
        };

        js_files = js_files.map(transformURL);
        css_files = css_files.map(transformURL);

        const first = $('script:first');

        js_files.forEach(function (e) {
            $('<script>', {src: e}).insertBefore(first);
        });

        css_files.forEach(function (e) {
            $('<link>', {href: e, rel: "stylesheet", type: "text/css"}).insertBefore(first);
        });

        setTimeout(function () {
            window.map = window.ove.context.map;
            init();
        }, 2000);

        window.customLayer = true;

        function getHostName (withScheme, scriptName) {
            let scripts = document.getElementsByTagName('script');
            for (let i = 0; i < scripts.length; i++) {
                if (scripts[i].src.indexOf(scriptName) > 0) {
                    return scripts[i].src.substring(
                        withScheme ? 0 : scripts[i].src.indexOf('//') + 2,
                        scripts[i].src.lastIndexOf('/'));
                }
            }
            return undefined;
        };
    }
})();
```

## Loading the App

A map can be loaded using the OVE APIs:

Linux/Mac:

```sh
curl --header "Content-Type: application/json" --request POST --data '{"app": {"url": "http://OVE_APP_MAPS_HOST:PORT","states": {"load": {"center": ["-11137.70850550061", "6710544.04980525"], "resolution": "77", "zoom": "12", "enabledLayers":["23"], "scripts":["http://my.domain/customLayer.js"]}}}, "space": "OVE_SPACE", "h": 500, "w": 500, "y": 0, "x": 0}' http://OVE_CORE_HOST:PORT/section
```

Windows:

```sh
curl --header "Content-Type: application/json" --request POST --data "{\"app\": {\"url\": \"http://OVE_APP_MAPS_HOST:PORT\", \"states\": {\"load\": {\"center\": [\"-11137.70850550061\", \"6710544.04980525\"], \"resolution\": \"77\", \"zoom\": \"12\", \"enabledLayers\":[\"23\"], \"scripts\":[\"http://my.domain/customLayer.js\"]}}}, \"space\": \"OVE_SPACE\", \"h\": 500, \"w\": 500, \"y\": 0, \"x\": 0}" http://OVE_CORE_HOST:PORT/section
```

## Controlling the App

The controller of the app can be loaded by accessing the URL `http://OVE_APP_MAPS_HOST:PORT/control.html?oveSectionId=SECTION_ID&layers=23`. The `layers` parameter in the URL is optional and can have more than one value at a time separated by commas. The controller supports panning and zooming of maps.

## Key considerations when using the App

All considerations when using this app are directly related to its reliability and performance:

1. The maps app tends to load many tiles on screens with higher resolutions and tile servers that are slow and remote tend to perform very poorly compared to servers that are much faster and locally hosted.
2. JavaScript executed to load custom overlays must not introduce any performance bottlenecks or execute code that has a negative impact on the reliability of OVE.
3. If the [Map Layers configuration](../ove-app-maps/docs/MAP_LAYERS_JSON.md) is specified as a URL (rather than being directly embedded in the `config.json` file), then this must be available before the server-side of this app is launched using PM2 or Docker.
