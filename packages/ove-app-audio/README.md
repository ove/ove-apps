# Audio App 

This app supports the playing of audio files within the OVE Framework.

The app supports the [Howler.js](https://howlerjs.com/) audio library. Thus it will support Web Audio API by default and fallback to HTML5 Audio if required. 

The Audio App is invisible and will, by default, play audio on all browsers a section covers. You may select where within the section the audio plays by using the setPosition method (implementation pending [blocker](https://github.com/ove/ove/issues/25 ) ). Currently supported Audio files include `webm`, `mp3` and `sound.wav`

Full control of the audio app is provided by its API which is fully documented on `http://HOSTNAME/swagger/`