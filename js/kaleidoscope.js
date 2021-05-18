import {Quad} from "./quad.js";
import {ShaderKaleidoscope} from "./shaderKaleidoscope.js";
import {Random} from "./random.js";
import {InterpolatorFloat} from "./interpolator/interpolatorFloat.js";
import {Bounds} from "./interpolator/bounds.js";

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

        this.diameter = new InterpolatorFloat(random, new Bounds(3, 4), new Bounds(128, 200));
        this.angle = new InterpolatorFloat(random, new Bounds(9, 15), new Bounds(-1, 1), false, true);

        window.addEventListener("keydown", () => {
            this.resize(canvas.width, canvas.height);
        });

        this.resize(canvas.width, canvas.height);
    }

    /**
     * Draw a frame
     * @param {number} time The frame time
     */
    frame(time) {
        this.diameter.frame(time);
        this.angle.frame(time);

        this.shader.configure(
            this.diameter.value,
            this.angle.value
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