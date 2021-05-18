import {Quad} from "./quad.js";
import {ShaderKaleidoscope} from "./shaderKaleidoscope.js";

export class Kaleidoscope {
    /**
     * Construct the turtles simulation
     * @param {HTMLCanvasElement} canvas The canvas to render to
     */
    constructor(canvas) {
        this.gl = canvas.getContext("webgl");
        this.quad = new Quad(this.gl);
        this.shader = new ShaderKaleidoscope(this.gl);

        this.resize(canvas.width, canvas.height);
    }

    /**
     * Draw a frame
     * @param {number} time The frame time
     */
    frame(time) {
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