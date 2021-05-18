import {Shader} from "./shader.js";

export class ShaderKaleidoscope extends Shader {
    static VERTEX = `#version 100
        attribute vec2 position;
        
        varying vec2 iUv;
        
        void main() {
            iUv = position * .5 + .5;
            
            gl_Position = vec4(position, .0, 1.);
        }
        `;

    static FRAGMENT = `#version 100
        uniform mediump vec2 size;
        uniform mediump vec3 seed;
        uniform lowp vec4 low;
        uniform lowp vec4 high;
        uniform lowp int axes;
    
        varying mediump vec2 iUv;
        
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
        
        void main() {
            mediump vec2 position = iUv * size;
            
            for (int axis = 0; axis < 10; ++axis) {
                mediump float angle = 3.141593 * float(axis) / float(axes);
                mediump vec2 normal = vec2(cos(angle), sin(angle));
                
                position = mirror(position, normal);
               
                if (axis == axes)
                    break;
            }
                
            mediump float dist = length(iUv * size) / 70.;
            
            lowp float noise = cubicNoise(vec3(position * .1, 0.) + seed) - dist * .5;
            
            if (noise < 0.5 && noise > 0.3)
                gl_FragColor = low;
            else
                gl_FragColor = high;

            gl_FragColor.rgb *= 1. - .6 * dist;
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
        this.uLow = this.uniformLocation("low");
        this.uHigh = this.uniformLocation("high");
        this.uAxes = this.uniformLocation("axes");
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
        this.gl.uniform1i(this.uAxes, 1 + Math.floor(Math.random() * 6));
    }
}