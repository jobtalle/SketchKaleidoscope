import {Quad} from "./quad.js";
import {ShaderKaleidoscope} from "./shaderKaleidoscope.js";
import {Random} from "./random.js";
import {InterpolatorFloat} from "./interpolator/interpolatorFloat.js";
import {Bounds} from "./interpolator/bounds.js";
import {Vector} from "./vector.js";

export class Kaleidoscope {
    /**
     * Construct the turtles simulation
     * @param {HTMLCanvasElement} canvas The canvas to render to
     */
    constructor(canvas) {
        const random = new Random();

        this.gl = canvas.getContext("webgl", {
            antialias: false,
            depth: false,
            alpha: false,
            preserveDrawingBuffer: true
        });

        this.quad = new Quad(this.gl);
        this.shader = new ShaderKaleidoscope(this.gl);
        this.seed = new Vector();
        this.high = new Vector();
        this.low = new Vector();

        this.diameter = new InterpolatorFloat(random, new Bounds(4, 8), new Bounds(80, 420));
        this.angle = new InterpolatorFloat(random, new Bounds(14, 18), new Bounds(-1, 1), false, true);
        this.threshold = new InterpolatorFloat(random, new Bounds(5, 6), new Bounds(.2, .5), true, true);
        this.bandwidth = new InterpolatorFloat(random, new Bounds(4, 5), new Bounds(.15, .35), true, true);
        this.seedRadius = new InterpolatorFloat(random, new Bounds(20, 30), new Bounds(-256, 256), true, false, 3);
        this.seedAngle = new InterpolatorFloat(random, new Bounds(20, 30), new Bounds(0, Math.PI), false, false, .08);
        this.scale = new InterpolatorFloat(random, new Bounds(4, 10), new Bounds(2, 24), true);
        this.hueHigh = new InterpolatorFloat(random, new Bounds(10, 20), new Bounds(0, 1), true);
        this.hueLow = new InterpolatorFloat(random, new Bounds(10, 20), new Bounds(0, 1), true);

        window.addEventListener("keydown", () => {
            this.resize(canvas.width, canvas.height);
        });

        this.resize(canvas.width, canvas.height);
    }

    /**
     * Make a color from HSV
     * @param {Vector} vector The vector to store the color in
     * @param {number} h Hue
     * @param {number} s Saturation
     * @param {number} v Value
     */
    makeHSV(vector, h, s, v) {
        const c = v * s;
        const x = c * (1 - Math.abs((h * 6) % 2 - 1));
        const m = v - c;

        switch(Math.floor(h * 6)) {
            case 1:
                vector.x = x + m;
                vector.y = c + m;
                vector.z = m;

                break;
            case 2:
                vector.x = m;
                vector.y = c + m;
                vector.z = x + m;

                break;
            case 3:
                vector.x = m;
                vector.y = x + m;
                vector.z = c + m;

                break;
            case 4:
                vector.x = x + m;
                vector.y = m;
                vector.z = c + m;

                break;
            case 5:
                vector.x = c + m;
                vector.y = m;
                vector.z = x + m;

                break;
            default:
                vector.x = c + m;
                vector.y = x + m;
                vector.z = m;

                break;
        }
    }

    /**
     * Draw a frame
     * @param {number} time The frame time
     */
    frame(time) {
        this.diameter.frame(time);
        this.angle.frame(time);
        this.threshold.frame(time);
        this.bandwidth.frame(time);
        this.seedRadius.frame(time);
        this.seedAngle.frame(time);
        this.scale.frame(time);
        this.hueHigh.frame(time);
        this.hueLow.frame(time);

        this.seed.x = Math.cos(this.seedAngle.value) * this.seedRadius.value;
        this.seed.y = Math.sin(this.seedAngle.value) * this.seedRadius.value;

        this.makeHSV(this.low, this.hueLow.value, .8, .4);
        this.makeHSV(this.high, this.hueHigh.value, .6, .8);

        this.shader.configure(
            this.diameter.value,
            this.angle.value,
            this.threshold.value,
            this.bandwidth.value,
            this.seed,
            this.scale.value,
            this.low,
            this.high
        );

        this.quad.draw();
    }

    /**
     * Resize
     * @param {number} width The width
     * @param {number} height The height
     */
    resize(width, height) {
        this.gl.viewport(0, 0, width, height);
        this.shader.use(width, height);
    }
}