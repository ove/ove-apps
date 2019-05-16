# Custom Vis App

This app supports displaying custom JavaScript visualizations within the OVE framework.

It is intended primarily for use by expert users developing custom visualizations.

It is similar to the HTML App, but has some important differences.

The HTML App is designed to display web pages that have not been written specifically for display within OVE.
Each oveSectionView contains an `iframe` that contains the whole page: the width and height properties of this frame are set to the dimensions of the whole section, and a CSS `tranform: translate` shifts the content so that the correct portion is displayed.
This works well in many cases, but is inherently inefficient because the whole page is loaded within each page.

The Custom Vis App was written to overcome this limitation.
It provides a way for the loaded JavaScript to determine which portion of the total data it is responsible for displaying, so that it can draw only what is necessary.
It also provides a way to listen for zoom events.



## Application State

The state of this app has a format similar to:

```json
{
    "url": "http://my.domain",
        
    "x_range": [0, 100],
    "y_range": [0, 100],
    
    "x_domain": [0, 1000],
    "y_domain": [0, 1000], // optional - defaults to section size

    "options": {}
}
```

The `url`, property is mandatory. Optionally, `launchDelay` and `changeAt` properties can be provided to control the initial delay to pre-load the contents of the web page and the precise time at which all clients will change the page they display.

The `x_range_intial` and `y_range_initial` properties indicate the range of data that the section will initially display.
The range displayed will change if a zoom or pan operation is performed.

The `options` property is an optional object that is passed on to the page to be inerpreted on a case-by-case basis.



## Loading the App

An example page designed to be viewed with this app is available at `http://OVE_APP_CUSTOM_VIS_HOST:PORT/data/datasaurus/index.html`.

A web page can be loaded using the OVE APIs:


```sh

curl --header "Content-Type: application/json" --request POST --data "{  \"app\": {    \"url\": \"http://OVE_APP_CUSTOM_VIS_HOST:PORT\",    \"states\": {      \"load\": {        \"url\": \"http://OVE_APP_CUSTOM_VIS_HOST:PORT/data/datasaurus/index.html\",            \"x_domain\": [0, 100],            \"y_domain\": [0, 100],            \"x_range\": [0, 4320],            \"y_range\": [0, 2424]          }    }  },  \"space\": \"OVE_SPACE\",  \"x\": 0,  \"y\": 0,  \"w\": 4320,  \"h\": 2424}"
```


## Controlling the App

The controller of the app can be loaded by accessing the URL `http://OVE_APP_CUSTOM_VIS_HOST:PORT/control.html?oveSectionId=SECTION_ID`.

The app's API also exposes a `refresh` operation. This operation can be executed on an individual web page or across all web pages.

To refresh a web page that is already loaded, using OVE APIs:

```sh
curl  --request POST http://OVE_APP_CUSTOM_VIS_HOST:PORT/operation/refresh
```
