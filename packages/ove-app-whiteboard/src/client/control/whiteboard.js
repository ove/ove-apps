initControl = async () => {
    const context = window.ove.context;
    const hostname = context.hostname;

    context.isInitialized = false;
    log.debug('Application is initialized:', context.isInitialized);

    OVE.Utils.resizeController(Constants.CONTENT_DIV);

    const text = await (await fetch(hostname + '/spaces?oveSectionId=' + OVE.Utils.getSectionId())).text();
    const space = Object.keys(JSON.parse(text))[0];
    log.debug('Loading space:', space);

    const clients = Object.values(JSON.parse(text))[0];
    const g = window.ove.geometry;

    context.factor = Math.max(g.section.w / Math.min(document.documentElement.clientWidth, window.innerWidth),
        g.section.h / Math.min(document.documentElement.clientHeight, window.innerHeight));
    log.debug('Computed scaling factor:', context.factor);

    // We load each client into the whiteboard controller so that it is possible to see the live
    // contents of the space. Each client is reduced in size by the computed scaling factor such
    // that they all fit within the controller's screen.
    clients.forEach((c, i) => {
        if (!(c.x !== undefined && c.y !== undefined && c.w !== undefined && c.h !== undefined)) return;

        $('<iframe>', {
            src: hostname + '/view.html?oveViewId=' + space + '-' + i,
            class: Constants.OVE_FRAME.substring(1),
            allowtransparency: true,
            frameborder: 0,
            scrolling: 'no'
        }).css({
            zoom: 1,
            transformOrigin: '0% 0%',
            transform: 'scale(' + (1 / context.factor) + ')',
            // Each client is loaded in its original size and then scaled-down.
            width: (c.w + c.offset.x) + 'px',
            height: (c.h + c.offset.y) + 'px',
            position: 'absolute',
            marginLeft: (c.x - c.offset.x) / context.factor,
            marginTop: (c.y - c.offset.y) / context.factor
        }).appendTo(Constants.CONTENT_DIV);
    });
    // Excluding own preview.
    setTimeout(() => window.ove.frame.send(Constants.Frame.CHILD, {
        load: true,
        filters: { exclude: [OVE.Utils.getSectionId()] }
    }, 'core'), Constants.FRAME_LOAD_DELAY);

    log.debug('Displaying controller');
    const scale = Math.min(Math.min(document.documentElement.clientWidth, window.innerWidth) / 1440,
        Math.min(document.documentElement.clientHeight, window.innerHeight) / 720);

    $(Constants.CONTROLLER).css({ display: 'block', transformOrigin: '50% 50%', transform: 'scale(' + scale + ')' });
    // The canvas is loaded only after everything else is fully initialised.
    updateCanvas();
};

beginInitialization = () => {
    log.debug('Starting controller initialization');
    $(document).on(OVE.Event.LOADED, async () => {
        $(window).resize(() => location.reload());
        await initControl();
    });
};

initializePlotter = () => {
    const context = window.ove.context;
    context.plots = { active: false, textMode: false, remote: [], local: [], historic: [], undo: [], undoDepth: 0 };

    // Initialization of canvas
    context.canvas = $(Constants.WHITEBOARD_CANVAS)[0];

    // It is important to set canvas height and width like this to avoid it scaling.
    context.canvas.width = parseInt($(Constants.CONTENT_DIV).css('width'), 10);
    context.canvas.height = parseInt($(Constants.CONTENT_DIV).css('height'), 10);
    log.debug('Setting canvas height and width to:', context.canvas.height, context.canvas.width);

    context._2d = context.canvas.getContext('2d');
    context._2d.strokeStyle = document.querySelector(':checked').getAttribute('data-color');
    context._2d.lineWidth = Constants.DEFAULT_LINE_WIDTH;
    context._2d.lineCap = context._2d.lineJoin = Constants.DEFAULT_LINE_JOIN;
    context._2d.save();
    log.debug('Successfully configured 2D context');

    context.color = context._2d.strokeStyle;
    context.fontSize = Constants.DEFAULT_FONT_SIZE;

    // Operation to draw on canvas
    const drawOnCanvas = (color, plots) => {
        log.trace('Painting line with color:', color, 'along points:', plots);
        context._2d.restore();
        context._2d.strokeStyle = color;
        context._2d.beginPath();
        context._2d.moveTo(plots[0].x, plots[0].y);

        for (let i = 1; i < plots.length; i++) {
            context._2d.lineTo(plots[i].x, plots[i].y);
        }

        context._2d.stroke();
    };

    // Operation to write on canvas
    const writeOnCanvas = (color, text) => {
        log.trace('Painting characters with color:', color, 'text:', text);
        context._2d.restore();
        context._2d.fillStyle = color;
        context._2d.font = text.fontSize + 'px ' + Constants.DEFAULT_FONT_NAME;
        context._2d.fillText(text.str, text.x, text.y);
    };

    // Utility method to generates text to be plotted on remote nodes
    const getTextToPlot = (str, x, y) => ({ string: str, x: (x * context.factor) << 0, y: (y * context.factor) << 0 });

    // Handler for draw event
    const draw = e => {
        e.preventDefault(); // prevent continuous touch event process e.g. scrolling!
        if (!context.plots.active) {
            return;
        }

        const x = isTouchSupported ? (e.targetTouches[0].pageX - context.canvas.offsetLeft) : (e.offsetX || e.layerX - context.canvas.offsetLeft);
        const y = isTouchSupported ? (e.targetTouches[0].pageY - context.canvas.offsetTop) : (e.offsetY || e.layerY - context.canvas.offsetTop);

        if (!context.plots.textMode) {
            // The remote points need to be scaled by a factor to match the actual screen sizes
            context.plots.local.push({ x: x, y: y });
            context.plots.remote.push({ x: (x * context.factor) << 0, y: (y * context.factor) << 0 });
            drawOnCanvas(context.color, context.plots.local);
            return;
        }

        context.plots.textMode = false;
        const str = prompt('Please provide text to be displayed');
        log.debug('Got input text:', str);
        // only if some text was provided
        if (str) {
            const fs = ((parseInt(context.fontSize, 10) * context.factor) << 0).toString();
            window.ove.socket.send({ paint: { color: context.color, fontSize: fs, text: getTextToPlot(str, x, y) } });
            writeOnCanvas(context.color, { fontSize: context.fontSize, str: str, x: x, y: y });
            context.plots.historic.push({ color: context.color, fontSize: context.fontSize, str: str, x: x, y: y });
            $(Constants.Button.UNDO).addClass(Constants.State.ACTIVE);
            $(Constants.Button.REDO).removeClass(Constants.State.ACTIVE);
            context.plots.undo = [];
        }
        context.plots.active = false;
        log.trace('Plotting activated:', context.plots.active);
        log.debug('Text-mode activated:', context.plots.textMode);
        $(Constants.Button.TEXT).removeClass(Constants.State.ACTIVE);
    };

    const restoreFromPlotHistory = () => {
        log.debug('Restoring whiteboard using plot history');
        const socket = window.ove.socket;
        socket.send({ erase: true });

        context._2d.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.plots.historic.forEach(p => {
            if (p.str) {
                const fs = ((parseInt(p.fontSize, 10) * context.factor) << 0).toString();
                socket.send({ paint: { color: p.color, fontSize: fs, text: getTextToPlot(p.str, p.x, p.y) } });
                writeOnCanvas(p.color, { fontSize: p.fontSize, str: p.str, x: p.x, y: p.y });
            } else {
                const lineWidth = ((parseInt(context._2d.lineWidth, 10) * context.factor) << 0).toString();
                socket.send({ paint: { color: p.color, lineWidth: lineWidth, plots: p.remote } });
                const pl = p.local.slice(0); // create a shallow copy to work with
                while (pl.length > 0) {
                    // The drawOnCanvas operation is invoked iteratively within the draw operation. It is essential to
                    // ensure the end user gets to see what they draw immediately, compared to waiting until the entire
                    // drawing operation has completed. It is also required to ensure that we record a plot as a set of
                    // non-discrete points. The end result of this is an iterative redrawing of the line, which changes
                    // the thickness of the line being drawn, based on how the browser handles it. In order to ensure
                    // we maintain the same thickness as the original drawing, we need to iterative redraw the plot in
                    // this operation as well.
                    drawOnCanvas(p.color, pl);
                    pl.pop();
                }
            }
        });
    };

    const _controllerControl = () => {
        context.color = document.querySelector(':checked').getAttribute('data-color');
        log.debug('Changed color to:', context.color);
    };

    // Mouse and touch event listeners
    $(Constants.CONTROLLER).click(_controllerControl);

    const isTouchSupported = 'ontouchstart' in window;
    const isPointerSupported = navigator.pointerEnabled;
    const isMSPointerSupported = navigator.msPointerEnabled;

    const downEvent = isTouchSupported ? 'touchstart' : (isPointerSupported ? 'pointerdown' : (isMSPointerSupported ? 'MSPointerDown' : 'mousedown'));
    const moveEvent = isTouchSupported ? 'touchmove' : (isPointerSupported ? 'pointermove' : (isMSPointerSupported ? 'MSPointerMove' : 'mousemove'));
    const upEvent = isTouchSupported ? 'touchend' : (isPointerSupported ? 'pointerup' : (isMSPointerSupported ? 'MSPointerUp' : 'mouseup'));

    log.debug('Registering listeners for:', downEvent, moveEvent, upEvent);
    context.canvas.addEventListener(moveEvent, draw, false);

    context.canvas.addEventListener(downEvent, e => {
        e.preventDefault(); // prevent continuous touch event process e.g. scrolling!
        context.plots.active = true;
        log.trace('Plotting activated:', context.plots.active);
    }, false);

    context.canvas.addEventListener(upEvent, e => {
        e.preventDefault(); // prevent continuous touch event process e.g. scrolling!
        context.plots.active = false;
        log.trace('Plotting activated:', context.plots.active);

        const lineWidth = ((parseInt(context._2d.lineWidth, 10) * context.factor) << 0).toString();
        window.ove.socket.send({ paint: { color: context.color, lineWidth: lineWidth, plots: context.plots.remote } });

        log.trace('Saving plot details to memory');
        context.plots.historic.push({ color: context.color, remote: context.plots.remote, local: context.plots.local });
        $(Constants.Button.UNDO).addClass(Constants.State.ACTIVE);
        $(Constants.Button.REDO).removeClass(Constants.State.ACTIVE);
        context.plots.undo = [];
        context.plots.remote = [];
        context.plots.local = [];
    }, false);

    const _uploadControl = () => {
        $('<input>', {
            type: 'file'
        }).css('visibility', 'hidden').appendTo($('body')).change(function () {
            const __self = $(this)[0];
            if (__self.files.length > 0) {
                const fileReader = new FileReader();
                fileReader.onload = e => {
                    context.plots.historic = JSON.parse(e.target.result);
                    context.plots.undoDepth = context.plots.historic.length;
                    log.debug('Restoring plots from file');
                    restoreFromPlotHistory();
                    $(Constants.Button.UNDO).removeClass(Constants.State.ACTIVE);
                    $(Constants.Button.REDO).removeClass(Constants.State.ACTIVE);
                    context.plots.undo = [];
                };
                fileReader.readAsText(__self.files.item(0));
                __self.remove();
            }
        }).click();
    };

    const _downloadControl = () => {
        if (context.plots.historic.length <= 0) return;

        const fileName = prompt('Please provide a name for your file', Constants.DEFAULT_FILE_NAME);
        // return if cancel button is pressed or filename is blank.
        if (!fileName) return;

        const fn = fileName.split('.')[0] + '.json';
        $('<a>', {
            download: fn,
            target: '_blank',
            href: 'data:application/octet-stream;charset=utf-8,' + encodeURIComponent(JSON.stringify(context.plots.historic))
        }).css('display', 'none').appendTo($('body'));

        log.debug('Downloading plots to file:', fn);
        const a = $('a');
        a[0].click();
        a.remove();
    };

    const _redoControl = () => {
        log.debug('Performing redo operation');
        if (!$(Constants.Button.REDO).hasClass(Constants.State.ACTIVE) || context.plots.undo.length <= 0) return;

        context.plots.historic.push(context.plots.undo.pop());
        $(Constants.Button.UNDO).addClass(Constants.State.ACTIVE);
        restoreFromPlotHistory();
        if (context.plots.undo.length === 0) {
            $(Constants.Button.REDO).removeClass(Constants.State.ACTIVE);
        }
    };

    const _undoControl = () => {
        log.debug('Performing undo operation');
        if (!$(Constants.Button.UNDO).hasClass(Constants.State.ACTIVE) || context.plots.historic.length <= 0) return;

        context.plots.undo.push(context.plots.historic.pop());
        $(Constants.Button.REDO).addClass(Constants.State.ACTIVE);
        restoreFromPlotHistory();
        if (context.plots.historic.length === context.plots.undoDepth) {
            $(Constants.Button.UNDO).removeClass(Constants.State.ACTIVE);
        }
    };

    const _eraseControl = () => {
        log.debug('Erasing contents of whiteboard');
        window.ove.socket.send({ erase: true });
        context._2d.clearRect(0, 0, context.canvas.width, context.canvas.height);
        $(Constants.Button.UNDO).removeClass(Constants.State.ACTIVE);
        $(Constants.Button.REDO).removeClass(Constants.State.ACTIVE);
        context.plots.undo = [];
        context.plots.historic = [];
        context.plots.undoDepth = 0;
    };

    const _textControl = () => {
        // this is a toggle button, but the state resets the moment you input text.
        context.plots.textMode = !context.plots.textMode;
        log.debug('Text-mode activated:', context.plots.textMode);
        $(Constants.Button.TEXT).toggleClass(Constants.State.ACTIVE);
    };

    const _incFontSize = () => {
        if ($(Constants.Button.INC_FONT_SIZE).hasClass(Constants.State.INACTIVE)) return;

        const fontSize = parseInt(context.fontSize, 10) + 1;

        if (fontSize > 31) {
            $(Constants.Button.INC_FONT_SIZE).addClass(Constants.State.INACTIVE);
        } else if (fontSize > 2 && $(Constants.Button.DEC_FONT_SIZE).hasClass(Constants.State.INACTIVE)) {
            $(Constants.Button.DEC_FONT_SIZE).removeClass(Constants.State.INACTIVE);
        }

        context.fontSize = fontSize.toString();
        log.debug('Font-size changed to:', context.fontSize);
    };

    const _decFontSize = () => {
        if ($(Constants.Button.DEC_FONT_SIZE).hasClass(Constants.State.INACTIVE)) return;

        const fontSize = parseInt(context.fontSize, 10) - 1;

        if (fontSize < 3) {
            $(Constants.Button.DEC_FONT_SIZE).addClass(Constants.State.INACTIVE);
        } else if (fontSize < 32 && $(Constants.Button.INC_FONT_SIZE).hasClass(Constants.State.INACTIVE)) {
            $(Constants.Button.INC_FONT_SIZE).removeClass(Constants.State.INACTIVE);
        }

        context.fontSize = fontSize.toString();
        log.debug('Font-size changed to:', context.fontSize);
    };

    $(Constants.Button.TEXT).click(_textControl);
    $(Constants.Button.INC_FONT_SIZE).click(_incFontSize);
    $(Constants.Button.DEC_FONT_SIZE).click(_decFontSize);
    $(Constants.Button.ERASE).click(_eraseControl);
    $(Constants.Button.UNDO).click(_undoControl);
    $(Constants.Button.REDO).click(_redoControl);
    $(Constants.Button.UPLOAD).click(_uploadControl);
    $(Constants.Button.DOWNLOAD).click(_downloadControl);
};
