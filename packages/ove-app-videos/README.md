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

## Launching the App

All OVE applications can be launched using the [Launcher UI](https://ove.readthedocs.io/en/stable/ove-ui/packages/ove-ui-launcher/README.html), the [Python Client Library](https://github.com/ove/ove-sdks/tree/master/python), and the OVE APIs. The API used to launch an application is the same for all applications, but the data that is passed into it is application-specific.

To launch the SVG app and load a video using the OVE APIs:

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

The app's API also exposes operations such as `play`, `pause`, `stop`, `seekTo` and `bufferStatus`. These operations can be executed on a per-video basis or across all videos.

To play videos using OVE APIs:

```sh
curl  --request POST http://OVE_APP_VIDEOS_HOST:PORT/operation/play
```

Instructions on invoking other operations are available on the API Documentation, `http://OVE_APP_AUDIO_HOST:PORT/api-docs#operation`.
