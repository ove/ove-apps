# Videos App

This app supports playing videos using the OVE framework. It provides a generic player for any video (`HTML5`), and a player based on the [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference) (`YouTube`).

## Application State

The state of this app has a format similar to:

```json
{
    "url": "http://www.youtube.com/embed/XY3NP4JHXZ4"
}
```

The player is selected automatically based on the URL: Any YouTube URL uses the YouTube player and all other URLs use the HTML5 player.

## Loading the App

A video can be loaded using the OVE APIs:

Linux/Mac:

```sh
curl --header "Content-Type: application/json" --request POST --data '{"app": {"url": "http://OVE_APP_VIDEOS_HOST:PORT","states": {"load": {"url": "http://www.youtube.com/embed/XY3NP4JHXZ4"}}}, "space": "OVE_SPACE", "h": 500, "w": 500, "y": 0, "x": 0}' http://OVE_CORE_HOST:PORT/section
```

Windows:

```sh
curl --header "Content-Type: application/json" --request POST --data "{\"app\": {\"url\": \"http://OVE_APP_VIDEOS_HOST:PORT\", \"states\": {\"load\": {\"url\": \"http://www.youtube.com/embed/XY3NP4JHXZ4\"}}}, \"space\": \"OVE_SPACE\", \"h\": 500, \"w\": 500, \"y\": 0, \"x\": 0}" http://OVE_CORE_HOST:PORT/section
```

## Controlling the App

The controller of the app can be loaded by accessing the URL `http://OVE_APP_VIDEOS_HOST:PORT/control.html?oveSectionId=SECTION_ID`.

The app's [API](http://OVE_APP_VIDEOS_HOST:PORT/api-docs#operation) also exposes operations such as `play`, `pause`, `stop`, `seekTo` and `bufferStatus`. These operations can be executed on a per-video basis or across all videos.

To play videos using OVE APIs:

```sh
curl  --request POST http://OVE_APP_VIDEOS_HOST:PORT/operation/play
```

Instructions on invoking other operations are available on the [API Documentation](http://OVE_APP_VIDEOS_HOST:PORT/api-docs#operation).
