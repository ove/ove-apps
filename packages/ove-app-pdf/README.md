# PDF App

This app supports displaying PDF documents using the OVE framework. It is based on [PDF.js](https://github.com/mozilla/pdf.js), a Portable Document Format (PDF) viewer that is built with HTML5.

## Application State

The state of this app has a format similar to:

```json
{
    "url": "https://raw.githubusercontent.com/mozilla/pdf.js/master/test/pdfs/TAMReview.pdf",
    "settings": {
        "scale": 2,
        "scrolling": "horizontal",
        "pageGap": 50,
        "startPage": 1,
        "endPage": 10
    }
}
```

The app accepts a `url` of a PDF document. All `settings` are optional. The `scale` is the scale at which each page is rendered. The `pageGap` is the number of pixels between each adjacent page. The app also accepts a `startPage` and `endPage` which can be used to limit the number of pages rendered. It will automatically compute the number of pages and decide on whether it is best to scroll horizontally or vertically depending on the dimensions of the section. This behaviour can be overridden by defining the `scrolling` property to be either `vertical` or `horizontal`.

## Loading the App

A PDF document can be loaded using the OVE APIs:

```sh
curl --header "Content-Type: application/json" --request POST --data '{"app": {"url": "http://OVE_APP_PDF_HOST:PORT","states": {"load": {"url": "https://raw.githubusercontent.com/mozilla/pdf.js/master/test/pdfs/TAMReview.pdf"}}}, "space": "OVE_SPACE", "h": 500, "w": 500, "y": 0, "x": 0}' http://OVE_CORE_HOST:PORT/section
```

Windows:

```sh
curl --header "Content-Type: application/json" --request POST --data "{\"app\": {\"url\": \"http://OVE_APP_PDF_HOST:PORT\", \"states\": {\"load\": {\"url\": \"https://raw.githubusercontent.com/mozilla/pdf.js/master/test/pdfs/TAMReview.pdf\"}}}, \"space\": \"OVE_SPACE\", \"h\": 500, \"w\": 500, \"y\": 0, \"x\": 0}" http://OVE_CORE_HOST:PORT/section
```

## Controlling the App

The controller of the app can be loaded by accessing the URL `http://OVE_APP_PDF_HOST:PORT/control.html?oveSectionId=SECTION_ID`. The controller supports panning and zooming of PDF documents.
