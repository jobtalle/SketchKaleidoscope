import {Interpolator} from "./interpolator.js";

export class InterpolatorFloat extends Interpolator {
    /**
     * Construct a float interpolator
     * @param {Random} random A randomizer
     * @param {Bounds} phaseTime The time for an interpolation phase
     * @param {Bounds} range The output range
     * @param {boolean} [idling] True if the interpolator idles every other frame
     * @param {boolean} [bounce] True if the change sign must invert every time
     */
    constructor(random, phaseTime, range, idling = true, bounce = false) {
        super(random, phaseTime);

        this.range = range;
        this.idling = idling;
        this.bounce = bounce;
        this.previous = range.sample(random.float);
        this.next = range.sample(random.float);
        this.idle = false;
        this.bounceUp = false;
    }

    /**
     * A function to call when the next frame arrives
     */
    onFrame() {
        if (this.idling)
            this.idle = !this.idle;

        this.previous = this.next;

        if (!this.idle) {
            if (this.bounce) {
                this.bounceUp = !this.bounceUp;

                if (this.bounceUp)
                    this.next = this.previous + this.random.float * (this.range.max - this.previous);
                else
                    this.next = this.range.min + this.random.float * (this.previous - this.range.min);
            }
            else
                this.next = this.range.sample(this.random.float);
        }
    }

    /**
     * Get the value for this interpolator
     * @returns {number} The current value
     */
    get value() {
        return this.previous + (.5 - .5 * Math.cos(this.progress * Math.PI)) * (this.next - this.previous);
    }
}