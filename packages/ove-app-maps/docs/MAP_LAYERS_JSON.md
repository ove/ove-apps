# MapLayers.json File

The maps app can be configured by embedding the map layers configuration within the `config.json` file, or by providing a URL that points to a `MapLayers.json` file. The format of the JSON configuration remains the same in either of these two approaches.

The `MapLayers.json` file contains an array of map layers. There are two different configuration formats for [OpenLayers](https://openlayers.org/) and [Leaflet](https://leafletjs.com/). These as described below. The mapping library is selected according to the configuration format of the first layer and assumes all other layers follow the same format. If no layers were defined, [OpenLayers](https://openlayers.org/) will be selected as the mapping library.

By default, the `config.json` exposes layers in the [OpenLayers](https://openlayers.org/) configuration format. To use [Leaflet](https://leafletjs.com/), edit the `config.json` file and replace the `layers` property with `layers_ol` and the `layers_leaflet` property with `layers`.

Examples on using the [CARTO](https://carto.com) platform are found in the `config.json` file and are not explained in here. Both mapping libraries make it possible to have more than one layer defined in their respective [CARTO](https://carto.com) platform configurations. To learn more, read documentation on [Using OpenLayers with the CARTO Platform](https://openlayers.org/en/latest/examples/cartodb.html) and on [Using Leaflet with the CARTO Platform](https://carto.com/developers/carto-js/examples/).

## [OpenLayers](https://openlayers.org/) configuration format

The configuration format for [OpenLayers](https://openlayers.org/) has a structure similar to:

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

The library supports two types of map layers, `ol.layer.Tile` and `ol.layer.Vector`.

Both types of layer have a `visible` property that describes whether the layer is visible by default and a `wms` property which describes whether the layer is a displaying data from a [`Web Map Service`](https://www.opengeospatial.org/standards/wms). These properties have Boolean values.

The layers also have a common `source` property, but their contents differ. The `source` of a vector layer always must have a `type` equal to `ol.source.Vector`, and the `url` of the `config` property must point to a [GeoJSON](http://geojson.org/) file. The `source` of a tile layer can be any [layer source for tile data supported by OpenLayers](https://geoadmin.github.io/ol3/apidoc/ol.source.html) such as [`ol.source.OSM`](https://geoadmin.github.io/ol3/apidoc/ol.source.OSM.html) or [`ol.source.BingMaps`](https://geoadmin.github.io/ol3/apidoc/ol.source.BingMaps.html). The `config` object is passed as an argument of the constructor for the specified source, and its properties depend on which source is used; more information can be found in the [OpenLayers documentation](http://geoadmin.github.io/ol3/apidoc/ol.source.html).

Unlike tile layers, vector layers have two additional properties, `style` and `opacity` which can be used to customise their appearance. The `opacity` property has a numeric value between 0 and 1, and the `style` property accepts a JSON structure with two properties (`fill` and `stroke`) within it. These correspond to configuration provided when creating [`ol.style.Fill`](http://geoadmin.github.io/ol3/apidoc/ol.style.Fill.html) and [`ol.style.Stroke`](http://geoadmin.github.io/ol3/apidoc/ol.style.Stroke.html) objects, respectively.

## [Leaflet](https://leafletjs.com/) configuration format

The configuration format for [Leaflet](https://leafletjs.com/) has a structure similar to:

```JSON
[
    {
        "type": "L.tileLayer",
        "visible": false,
        "wms": false,
        "url": "http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}.jpg"
    },
    {
        "type": "L.geoJSON",
        "visible": false,
        "wms": false,
        "data": [
        {
            "type": "LineString",
            "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
        },
        {
            "type": "LineString",
            "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
        }],
        "options": {
            "style": {
                "fill": true,
                "fillColor": "#B29255",
                "fillOpacity": 0.7,
                "color": "#715E3A",
                "weight": 4,
                "opacity": 0.7
            }
        }
    }
]
```

The library supports raster and vector map layers as well as geoJSON layers. Unlike [OpenLayers](https://openlayers.org/), they are not grouped into two significant layers. A complete catalogue of all [Leaflet](https://leafletjs.com/) map layers are available in their [documentation](https://leafletjs.com/reference.html#layer).

Both types of layer have a `visible` property that describes whether the layer is visible by default and a `wms` property which describes whether the layer is a displaying data from a [`Web Map Service`](https://www.opengeospatial.org/standards/wms). These properties have Boolean values.

Each layer has its own properties. `L.tileLayer` must have a `url` property. All vector layers must have a `bounds` property. `L.imageOverlay` and `L.videoOverlay` must have a `url` as well as a `bounds` property. All layers accept an optional `options` property as well. All of these combinations are explained in the [Leaflet documentation](https://leafletjs.com/reference.html#layer).

Unlike in [OpenLayers](https://openlayers.org/), [Leaflet](https://leafletjs.com/) expects [GeoJSON](http://geojson.org/) to be embedded and defined using a `data` property. Like other layers it also accepts an optional `options` property. The `style` property is defined within this `options` property as seen above. `opacity` is a part of the `style` property.
