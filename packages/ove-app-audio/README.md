# Audio App

This app supports the playing of audio files within the OVE Framework. It is powered by the Howler.js audio library, so supports the Web Audio API by default and falls back to HTML5 Audio if required. This app is intended to provide a distributed layer on top of the Howler Library.

The Audio App does not display any visible content and will, by default, play audio on all browsers a section covers. You may select where within the section the audio plays by using the setPosition method (implementation pending [blocker](https://github.com/ove/ove-apps/issues/33)). Currently supported Audio files include `webm`, `mp3` and `sound.wav`.

## Application State

The state of this app has a format similar to:

```json
{
    "url": "https://upload.wikimedia.org/wikipedia/commons/b/bd/%22Going_Home%22%2C_performed_by_the_United_States_Air_Force_Band.oga"
}
```

## Loading the App

An audio file can be loaded using the OVE APIs:

Linux/Mac:

```sh
curl --header "Content-Type: application/json" --request POST --data '{"app": {"url": "http://OVE_APP_AUDIO_HOST:PORT","states": {"load": {"url": "https://upload.wikimedia.org/wikipedia/commons/b/bd/%22Going_Home%22%2C_performed_by_the_United_States_Air_Force_Band.oga"}}}, "space": "OVE_SPACE", "h": 500, "w": 500, "y": 0, "x": 0}' http://OVE_CORE_HOST:PORT/section
```

Windows:

```sh
curl --header "Content-Type: application/json" --request POST --data "{\"app\": {\"url\": \"http://OVE_APP_AUDIO_HOST:PORT\", \"states\": {\"load\": {\"url\": \"https://upload.wikimedia.org/wikipedia/commons/b/bd/%22Going_Home%22%2C_performed_by_the_United_States_Air_Force_Band.oga\"}}}, \"space\": \"OVE_SPACE\", \"h\": 500, \"w\": 500, \"y\": 0, \"x\": 0}" http://OVE_CORE_HOST:PORT/section
```

## Controlling the App

The controller of the app can be loaded by accessing the URL `http://OVE_APP_AUDIO_HOST:PORT/control.html?oveSectionId=SECTION_ID`.

The app's API also exposes operations such as `play`, `pause`, `stop`, `seekTo` and `bufferStatus` related to playback. Volume may be controlled by operations such as `mute`, `unmute`, `volUp`, `volDown`. These operations can be executed on a per-section basis or across all sections.

To play audio using OVE APIs:

```sh
curl --request POST http://OVE_APP_AUDIO_HOST:PORT/operation/play
```

Instructions on invoking other operations are available on the API Documentation, `http://OVE_APP_AUDIO_HOST:PORT/api-docs#operation`.
