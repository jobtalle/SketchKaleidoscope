export class Quad {
    /**
     * Construct a quad mesh
     * @param {WebGLRenderingContext} gl A WebGL rendering context
     */
    constructor(gl) {
        this.gl = gl;
        this.buffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    }

    /**
     * Draw this quad
     */
    draw() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 4);
    }
}