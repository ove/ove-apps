# MapLayers.json File

The maps app can be configured by embedding the map layers configuration within the `config.json` file, or by providing a URL that points to a `MapLayers.json` file. The format of the JSON configuration remains the same in either of these two approaches.

The `MapLayers.json` file contains an array of map layers. It has a structure similar to:

```JSON
[
    {
        "type": "ol.layer.Tile",
        "visible": false,
        "wms": false,
        "source": {
            "type": "ol.source.OSM",
            "config": {
                "crossOrigin": null,
                "url": "https://{a-c}.tile.thunderforest.com/transport/{z}/{x}/{y}.png"
            }
        }
    },
    {
        "type": "ol.layer.Vector",
        "visible": false,
        "wms": true,
        "source": {
            "type": "ol.source.Vector",
            "config": {
                "url": "/data/sampleGeo.json"
            }
        },
        "style": {
            "fill": {
                "color": "#B29255"
            },
            "stroke": {
                "color": "#715E3A",
                "width": 4
            }
        },
        "opacity": 0.7
    }
]
```

The app supports two types of map layers, `ol.layer.Tile` and `ol.layer.Vector`.

Both types of layer have a `visible` property that describes whether the layer is visible by default and a `wms` property which describes whether the layer is a displaying data from a [`Web Map Service`](https://www.opengeospatial.org/standards/wms). These properties have Boolean values.

The layers also have a common `source` property, but their contents differ. The `source` of a vector layer always must have a `type` equal to `ol.source.Vector`, and the `url` of the `config` property must point to a [GeoJSON](http://geojson.org/) file. The `source` of a tile layer can be any [map tile source supported by OpenLayers](https://geoadmin.github.io/ol3/apidoc/ol.source.html) such as [`ol.source.OSM`](https://geoadmin.github.io/ol3/apidoc/ol.source.OSM.html) or [`ol.source.BingMaps`](https://geoadmin.github.io/ol3/apidoc/ol.source.BingMaps.html). The `config` object is passed as an argument of the constructor for the specified source, and its properties depend on which source is used; more information can be found in the [OpenLayers documentation](http://geoadmin.github.io/ol3/apidoc/ol.source.html).

Unlike tile layers, vector layers have two additional properties, `style` and `opacity` which can be used to customise their appearance. The `opacity` property has a numeric value between 0 and 1, and the `style` property accepts a JSON structure with two properties (`fill` and `stroke`) within it. These correspond to configuration provided when creating [`ol.style.Fill`](http://geoadmin.github.io/ol3/apidoc/ol.style.Fill.html) and [`ol.style.Stroke`](http://geoadmin.github.io/ol3/apidoc/ol.style.Stroke.html) objects, respectively.
