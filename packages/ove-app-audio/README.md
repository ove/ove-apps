# Audio App 

This app supports the playing of audio files within the OVE Framework.

The app internally uses [Howler.js](https://howlerjs.com/) audio library, and thus it supports Web Audio API by default and fallbacks to HTML5 Audio if required. 

The Audio App is invisible and will, by default, play audio on all browsers a section covers. You may select where within the section the audio plays by using the setPosition method (implementation pending [blocker](https://github.com/ove/ove/issues/25 ) ). Currently supported Audio files include `webm`, `mp3` and `sound.wav`

Full control of the audio app is provided by its API which is fully documented on `http://HOSTNAME/swagger/`

To load an Audio file please load a state such as this:

Windows:
```curl --header "Content-Type: application/json" --request POST --data "{\"h\": 4320,\"app\": {\"url\": \"http://AUDIOAPP:PORT\",\"states\": {\"load\": {\"url\": \"https://upload.wikimedia.org/wikipedia/commons/b/bd/%22Going_Home%22%2C_performed_by_the_United_States_Air_Force_Band.oga\"}}},\"space\": \"DODev\",\"w\": 30720,\"y\": 0,\"x\": 0}" http://OVEHOST:PORT/section```

Linux/Mac:
```curl --header "Content-Type: application/json" --request POST --data '{"h": 4320,"app": {"url": "http://AUDIOAPP:PORT","states": {"load": {"url": "https://upload.wikimedia.org/wikipedia/commons/b/bd/%22Going_Home%22%2C_performed_by_the_United_States_Air_Force_Band.oga"}}},"space": "DODev","w": 30720,"y": 0,"x": 0}' http://OVEHOST:PORT/section```
