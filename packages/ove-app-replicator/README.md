# Replicator App

This app is capable of replicating content from within an OVE environment, as a space (either entirely or a portion of it), as a group or as one or more individual sections. It makes it possible to render content at different dimensions (scaling) while retaining the same aspect ratios. The app also makes it possible for interactive and non-interactive.

The replicator app is instantiated just like any other app, but, it however does not have a controller, and therefore behaves slightly differently to other apps, at runtime. This app can also display content from remote OVE deployments, unlike other apps.

## Application State

The state of this app has a format similar to:

```json
{
    "mode": "space",
    "spaceName": "LocalNine",
    "groupIds": [0, 1],
    "sectionIds": [2, 3, 4],
    "crop": {
        "x": 0,
        "y": 0,
        "w": 100,
        "h": 100,
    },
    "oveHost": "localhost:8080",
    "border": "solid gold"
}
```

The `mode` property is mandatory and should have a value of `space`, `group`, or `section`. If the `mode` has been set to `space`, the `spaceName` property must usually be provided. An app will replicate its own space (and thereby provide a mini-map sort of an experience), if the `spaceName` property is omitted.

The `groupIds` property is optional, and must be provided if `mode` is `group`. Similarly, the `sectionIds` property becomes mandatory if the `mode` is `section`. The optional `crop` property defines the region that will be replicated. Everything outside this region will not be visible. The content rendered within the app will scale to fit the app's own dimensions defined as `w` and `h` of the geometry when creating the app. The `crop` area can have its own geometry that is independent of the app's own geometry.

The optional `oveHost` property must be set in order to connect to a remote OVE environment.  The `spaceName` must always be provided if `oveHost` has been set, whenever the `mode` is `space`. The optional `border` property is useful when the replication is deployed as an overlay (for example, as a mini-map). Setting a `border` will set an opaque background to the replication. Please note that the border width cannot be set using this property.

The replicator app can only work with one `space` at a time. If the `mode` was set to `group` or `section` the `spaceName` will be taken into consideration. If the `spaceName` was not provided, the `space` with the most number of items will be chosen.

## Loading the App

Content within the OVE framework can be replicated using the OVE APIs:

```sh
curl --header "Content-Type: application/json" --request POST --data '{"app": {"url": "http://OVE_APP_REPLICATOR_HOST:PORT","states": {"load": {"mode": "space", "spaceName": "LocalNine"}}}, "space": "OVE_SPACE", "h": 500, "w": 500, "y": 0, "x": 0}' http://OVE_CORE_HOST:PORT/section
```

Windows:

```sh
curl --header "Content-Type: application/json" --request POST --data "{\"app\": {\"url\": \"http://OVE_APP_REPLICATOR_HOST:PORT\", \"states\": {\"load\": {\"mode\": \"space\", \"spaceName\": \"LocalNine\"}}}, \"space\": \"OVE_SPACE\", \"h\": 500, \"w\": 500, \"y\": 0, \"x\": 0}" http://OVE_CORE_HOST:PORT/section
```
