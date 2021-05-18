export class Shader {
    /**
     * Construct a shader
     * @param {WebGLRenderingContext} gl A WebGL rendering context
     * @param {string} vertex The vertex shader
     * @param {string} fragment The fragment shader
     */
    constructor(gl, vertex, fragment) {
        const shaderVertex = gl.createShader(gl.VERTEX_SHADER);
        const shaderFragment = gl.createShader(gl.FRAGMENT_SHADER);

        this.gl = gl;
        this.program = gl.createProgram();

        gl.shaderSource(shaderVertex, vertex);
        gl.compileShader(shaderVertex);
        gl.shaderSource(shaderFragment, fragment);
        gl.compileShader(shaderFragment);

        gl.attachShader(this.program, shaderVertex);
        gl.attachShader(this.program, shaderFragment);
        gl.linkProgram(this.program);
        gl.detachShader(this.program, shaderVertex);
        gl.detachShader(this.program, shaderFragment);
        gl.deleteShader(shaderVertex);
        gl.deleteShader(shaderFragment);
    }

    /**
     * Get an attribute location
     * @param {string} name The attribute name
     * @returns {GLint} The attribute location
     */
    attributeLocation(name) {
        return this.gl.getAttribLocation(this.program, name);
    }

    /**
     * Get a uniform location
     * @param {string} name The uniform name
     * @returns {WebGLUniformLocation} The uniform location
     */
    uniformLocation(name) {
        return this.gl.getUniformLocation(this.program, name);
    }

    /**
     * Use this shader
     */
    use() {
        this.gl.useProgram(this.program);
    }
}