import {Kaleidoscope} from "./kaleidoscope.js";

{
    const TIME_STEP_MAX = 1 / 5;
    let kaleidoscope = null;

    const canvas = document.getElementById("renderer");
    const resize = window.onresize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        if (kaleidoscope)
            kaleidoscope.resize(canvas.width, canvas.height);
    };

    resize();

    kaleidoscope = new Kaleidoscope(canvas);

    let lastTime = performance.now();

    const loop = time => {
        const delta = Math.min(TIME_STEP_MAX, .001 * (time - lastTime));

        kaleidoscope.frame(delta);

        lastTime = time;

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}