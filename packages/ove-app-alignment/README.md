# Alignment App

This app exists to help align the monitors in an OVE installation.

When installing monitors to create a tiled display, the aim is typically to physically align screens with as little gap between them as possible. However, in practice it is difficult to achieve a perfect alignment and monitors have bezels with non-zero widths. To compensate for this, adjustments can be made to the coordinates recorded for the layout in the `Spaces.json` file.

## Loading the App

The alignment app can be loaded using the OVE APIs:

Linux/Mac:

```sh
curl --header "Content-Type: application/json" --request POST --data '{"app": {"url": "http://OVE_APP_ALIGNMENT_HOST:PORT"}, "space": "OVE_SPACE", "h": 500, "w": 500, "y": 0, "x": 0}' http://OVE_CORE_HOST:PORT/section
```

Windows:

```sh
curl --header "Content-Type: application/json" --request POST --data "{\"app\": {\"url\": \"http://OVE_APP_ALIGNMENT_HOST:PORT\"}, \"space\": \"OVE_SPACE\", \"h\": 500, \"w\": 500, \"y\": 0, \"x\": 0}" http://OVE_CORE_HOST:PORT/section
```

## Controlling the App

The controller of the app can be loaded by accessing the URL `http://OVE_APP_ALIGNMENT_HOST:PORT/control.html?oveSectionId=SECTION_ID&oveSpace=SPACE_NAME`.

The app enables the display of one of two patterns (a grid of vertical and horizontal lines, or a series of parallel diagonal lines) that span an entire `oveCanvas`. From the controller page, a user can select one or more OVE clients, use the arrow keys to move the pattern on these clients until it aligns with the others, and then export a modified `Spaces.json` file.

The grid pattern allows creation of an alignment such that bezels are ignored: are pixels of the content are displayed, and the bottom pixel of one monitor and the top pixel of the monitor below have adjacent image coordinates, but are physically separated by the bezel width.

The diagonal pattern allows the creation of an alignment that compensates for bezels: the bottom pixel of one monitor and the top pixel of the monitor below do *not* have adjacent image coordinates; instead, content will be displayed as if it was on a continuous surface behind the bezels, with bezels occluding some content.

Users may want to perform both alignment procedures, and save the results as separate configurations in `Spaces.json`.
