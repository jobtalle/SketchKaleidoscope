import {Shader} from "./shader.js";

export class ShaderKaleidoscope extends Shader {
    static VERTEX = `#version 100
        attribute vec2 position;
        
        void main() {
            gl_Position = vec4(position, .0, 1.);
        }
        `;

    static FRAGMENT = `#version 100
        uniform mediump vec2 size;
        uniform mediump vec3 seed;
        uniform mediump float diameter;
        uniform lowp vec4 low;
        uniform lowp vec4 high;
        uniform lowp int axes;
        
        #define HEX vec2(1.7320508, 1)
        
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
        
        mediump float hex(mediump vec2 p) {
            p = abs(p);

            return max(dot(p, HEX * .5), p.y);
        }
        
        mediump vec4 getHex(mediump vec2 p)
        {
            mediump vec4 hC = floor(vec4(p, p - vec2(1, .5)) / HEX.xyxy) + .5;
            mediump vec4 h = vec4(p - hC.xy * HEX, p - (hC.zw + .5) * HEX);

            return dot(h.xy, h.xy) < dot(h.zw, h.zw) 
                ? vec4(h.xy, hC.xy) 
                : vec4(h.zw, hC.zw + .5);
        }
        
        void main() {
            mediump vec2 position = getHex((gl_FragCoord.xy - size * .5) / diameter).xy;
            
            for (int axis = 0; axis < 10; ++axis) {
                mediump float angle = 3.141593 * float(axis) / float(axes);
                mediump vec2 normal = vec2(cos(angle), sin(angle));
                
                position = mirror(position, normal);
               
                if (axis == axes)
                    break;
            }
                
            mediump float dist = length(position);
            
            lowp float noise = cubicNoise(vec3(position * 5., 0.) + seed) - dist * .5;
            
            if (noise < 0.5 && noise > 0.3)
                gl_FragColor = low;
            else
                gl_FragColor = high;

            gl_FragColor.rgb *= 1. - 2. * dist * dist;
        }
        `;

    /**
     * Construct the shield shader
     * @param {WebGLRenderingContext} gl A WebGL rendering context
     */
    constructor(gl) {
        super(gl, ShaderKaleidoscope.VERTEX, ShaderKaleidoscope.FRAGMENT);

        this.aPosition = this.attributeLocation("position");

        this.uSize = this.uniformLocation("size");
        this.uSeed = this.uniformLocation("seed");
        this.uDiameter = this.uniformLocation("diameter");
        this.uLow = this.uniformLocation("low");
        this.uHigh = this.uniformLocation("high");
        this.uAxes = this.uniformLocation("axes");
    }

    /**
     * Configure the next frame
     */
    configure() {

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
        this.gl.uniform3f(this.uSeed,
            Math.random() * 50 - 25,
            Math.random() * 50 - 25,
            Math.random() * 50 - 25);
        this.gl.uniform1f(this.uDiameter, 64 + 128 * Math.random());
        this.gl.uniform4f(this.uLow,
            Math.random(),
            Math.random(),
            Math.random(),
            1);
        this.gl.uniform4f(this.uHigh,
            Math.random(),
            Math.random(),
            Math.random(),
            1);

        const axisCounts = [1, 2, 3, 4, 6, 12];

        this.gl.uniform1i(this.uAxes, axisCounts[Math.floor(Math.random() * axisCounts.length)]);
    }
}