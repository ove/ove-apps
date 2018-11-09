# Videos App

This app supports playing videos using the OVE framework. There are two players available, `HTML5`, which is a generic player for any video, and `YouTube` which is based on the [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference).

## Application State

The state of this app has a format similar to what is provided below:

```json
{
    "url": "http://www.youtube.com/embed/XY3NP4JHXZ4"
}
```

The player is selected automatically based on the URL: Any YouTube URL uses the YouTube player and all other URLs use the HTML5 player.

## Loading the App

A video can be loaded using the OVE APIs:

Windows:

```sh
curl --header "Content-Type: application/json" --request POST --data "{\"h\": 500, \"app\": {\"url\": \"http://OVE_APP_VIDEOS_HOST:PORT\", \"states\": {\"load\": {\"url\": \"http://www.youtube.com/embed/XY3NP4JHXZ4\"}}}, \"space\": \"LocalNine\", \"w\": 500, \"y\": 0, \"x\": 0}" http://OVE_CORE_HOST:PORT/section
```

Linux/Mac:

```sh
curl --header "Content-Type: application/json" --request POST --data '{"h": 500, "app": {"url": "http://OVE_APP_VIDEOS_HOST:PORT","states": {"load": {"url": "http://www.youtube.com/embed/XY3NP4JHXZ4"}}}, "space": "LocalNine", "w": 500, "y": 0, "x": 0}' http://OVE_CORE_HOST:PORT/section
```

## Controlling the App

Once the app is loaded, it can be controlled via the URL `http://OVE_APP_VIDEOS_HOST:PORT/control.html?oveSectionId=0`.

The app also exposes controls as a part of its [API](http://OVE_APP_VIDEOS_HOST:PORT/api-docs#operation). The API exposes operations such as `play`, `pause`, `stop`, `seekTo` and `bufferStatus`. These operations can be executed on a per-video basis or across all videos.
