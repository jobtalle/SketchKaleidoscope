import {Shader} from "./shader.js";

export class ShaderKaleidoscope extends Shader {
    static VERTEX = `#version 100
        attribute vec2 position;
        
        void main() {
            gl_Position = vec4(position, .0, 1.);
        }
        `;

    static FRAGMENT = `#version 100
        uniform mediump mat3 transform;
        uniform mediump vec2 size;
        uniform mediump vec3 seed;
        uniform mediump float diameter;
        uniform mediump vec2 slice;
        uniform mediump float scale;
        uniform mediump vec2 shift;
        uniform mediump float noiseOffset;
        uniform mediump vec2 stretch;
        uniform mediump vec2 rotation;
        uniform lowp vec3 low;
        uniform lowp vec3 high;
        uniform lowp vec3 highEdge;
        
        #define HEX vec2(1.7320508, 1)
        #define MAX_MIRRORS 12
        #define NOISE_BOOST .3
        #define RAMP 200.
        #define EDGE_SHADE .22
        #define AXES 6
        
        highp float random(highp vec3 x) {
            return fract(sin(x.x + x.y * 57.0 + x.z * 113.0) * 43758.5453);
        }

        highp float interpolate(highp float a, highp float b, highp float c, highp float d, highp float x) {
            highp float p = (d - c) - (a - b);
            
            return x * (x * (x * p + ((a - b) - p)) + (c - a)) + b;
        }
        
        highp float sampleX(highp vec3 at) {
            highp float floored = floor(at.x);
            
            return interpolate(
                random(vec3(floored - 1.0, at.yz)),
                random(vec3(floored, at.yz)),
                random(vec3(floored + 1.0, at.yz)),
                random(vec3(floored + 2.0, at.yz)),
                fract(at.x)) * 0.5 + 0.25;
        }
        
        highp float sampleY(highp vec3 at) {
            highp float floored = floor(at.y);
            
            return interpolate(
                sampleX(vec3(at.x, floored - 1.0, at.z)),
                sampleX(vec3(at.x, floored, at.z)),
                sampleX(vec3(at.x, floored + 1.0, at.z)),
                sampleX(vec3(at.x, floored + 2.0, at.z)),
                fract(at.y));
        }
        
        highp float cubicNoise(highp vec3 at) {
            highp float floored = floor(at.z);
            
            return interpolate(
                sampleY(vec3(at.xy, floored - 1.0)),
                sampleY(vec3(at.xy, floored)),
                sampleY(vec3(at.xy, floored + 1.0)),
                sampleY(vec3(at.xy, floored + 2.0)),
                fract(at.z));
        }
        
        mediump vec2 mirror(mediump vec2 vector, mediump vec2 normal) {
            mediump float magnitude = dot(normal, vector);
            
            if (magnitude > 0.0)
                return vector;
            
            return vector - 2.0 * normal * magnitude;
        }
        
        mediump vec2 getCentroid(mediump vec2 p) {
            mediump vec4 hC = floor(vec4(p, p - vec2(1, .5)) / HEX.xyxy) + .5;
            mediump vec4 h = vec4(p - hC.xy * HEX, p - (hC.zw + .5) * HEX);

            return dot(h.xy, h.xy) < dot(h.zw, h.zw) ? h.xy : h.zw;
        }
        
        void main() {
            mediump vec2 screenCoord = gl_FragCoord.xy - size * .5;
            mediump vec2 centroid = getCentroid((transform * vec3(screenCoord + shift * size, 1.)).xy / diameter);
            
            for (int axis = 0; axis < AXES; ++axis) {
                mediump float angle = 3.141593 * (float(axis) / float(AXES));
                mediump vec2 normal = vec2(cos(angle), sin(angle));
                
                centroid = mirror(centroid, normal);
            }
                
            mediump float dist = length(centroid);
            mediump mat3 tilt = mat3(
                0.788675134594813, -0.211324865405187, -0.577350269189626,
                -0.211324865405187, 0.788675134594813, -0.577350269189626,
                0.577350269189626, 0.577350269189626, 0.577350269189626);
            
            mediump mat2 rotationMatrix = mat2(rotation.x, rotation.y, -rotation.y, rotation.x);
            
            mediump float radius = length(screenCoord) / length(size.xy) * 2.;
            mediump float fadeout = 1. - radius * radius * radius * radius;
            mediump float dampen = 1. - 2. * dist * dist;
            mediump vec2 noiseOffset = (centroid * scale + (gl_FragCoord.xy / size) * noiseOffset) * stretch * rotationMatrix;
            lowp float noise = cubicNoise(tilt * (vec3(noiseOffset, 0.) + seed)) - dist * NOISE_BOOST;
            
            if (noise > slice.x && noise < slice.x + slice.y) {
                mediump float interpolation = min(1., min(noise - slice.x, slice.x + slice.y - noise) * RAMP);
                
                gl_FragColor = vec4(mix(low * dampen * fadeout, mix(high, highEdge, radius) * sqrt(dampen), interpolation), 1);
            }
            else
                gl_FragColor = vec4(low * dampen * fadeout, 1);
        }
        `;

    /**
     * Construct the shield shader
     * @param {WebGLRenderingContext} gl A WebGL rendering context
     */
    constructor(gl) {
        super(gl, ShaderKaleidoscope.VERTEX, ShaderKaleidoscope.FRAGMENT);

        this.aPosition = this.attributeLocation("position");

        this.uTransform = this.uniformLocation("transform");
        this.uSize = this.uniformLocation("size");
        this.uSeed = this.uniformLocation("seed");
        this.uDiameter = this.uniformLocation("diameter");
        this.uSlice = this.uniformLocation("slice");
        this.uLow = this.uniformLocation("low");
        this.uHigh = this.uniformLocation("high");
        this.uHighEdge = this.uniformLocation("highEdge");
        this.uScale = this.uniformLocation("scale");
        this.uShift = this.uniformLocation("shift");
        this.uNoiseOffset = this.uniformLocation("noiseOffset");
        this.uStretch = this.uniformLocation("stretch");
        this.uRotation = this.uniformLocation("rotation");
    }

    /**
     * Configure the next frame
     * @param {number} diameter The hexagon diameter
     * @param {number} angle The camera angle
     * @param {number} threshold The noise threshold
     * @param {number} bandwidth The noise bandwidth
     * @param {Vector} seed The noise seed
     * @param {number} scale The noise scale
     * @param {Vector} low The dark color
     * @param {Vector} high The light color
     * @param {Vector} highEdge The light color at the edge
     * @param {number} x X shift
     * @param {number} y Y shift
     * @param {number} noiseOffset The noise drift with screen coordinates
     * @param {number} xScale The horizontal scale
     * @param {number} yScale The vertical scale
     */
    configure(
        diameter,
        angle,
        threshold,
        bandwidth,
        seed,
        scale,
        low,
        high,
        highEdge,
        x,
        y,
        noiseOffset,
        xScale,
        yScale,
        rotation) {
        this.gl.uniform1f(this.uDiameter, diameter);
        this.gl.uniformMatrix3fv(this.uTransform, false, [
            Math.cos(angle), Math.sin(angle), 0,
            -Math.sin(angle), Math.cos(angle), 0,
            0, 0, 1
        ]);
        this.gl.uniform2f(this.uSlice, threshold, bandwidth);
        this.gl.uniform3f(this.uSeed, seed.x, seed.y, seed.z);
        this.gl.uniform1f(this.uScale, scale);
        this.gl.uniform3f(this.uLow, low.x, low.y, low.z);
        this.gl.uniform3f(this.uHigh, high.x, high.y, high.z);
        this.gl.uniform3f(this.uHighEdge, highEdge.x, highEdge.y, highEdge.z);
        this.gl.uniform2f(this.uShift, x, y);
        this.gl.uniform1f(this.uNoiseOffset, noiseOffset);
        this.gl.uniform2f(this.uStretch, xScale, yScale);
        this.gl.uniform2f(this.uRotation, Math.cos(rotation), Math.sin(rotation));
    }

    /**
     * Use this shader
     * @param {number} width The width
     * @param {number} height The height
     */
    use(width, height) {
        super.use();

        this.gl.enableVertexAttribArray(this.aPosition);
        this.gl.vertexAttribPointer(this.aPosition, 2, this.gl.FLOAT, false, 8, 0);
        this.gl.uniform2f(this.uSize, width, height);
    }
}