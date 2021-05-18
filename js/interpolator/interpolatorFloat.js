import {Interpolator} from "./interpolator.js";

export class InterpolatorFloat extends Interpolator {
    /**
     * Construct a float interpolator
     * @param {Random} random A randomizer
     * @param {Bounds} phaseTime The time for an interpolation phase
     * @param {Bounds} range The output range
     * @param {boolean} [idling] True if the interpolator idles every other frame
     * @param {boolean} [bounce] True if the change sign must invert every time
     * @param {number} [maxDelta] The maximum delta per frame
     */
    constructor(
        random,
        phaseTime,
        range,
        idling = true,
        bounce = false,
        maxDelta = -1) {
        super(random, phaseTime);

        this.range = range;
        this.idling = idling;
        this.bounce = bounce;
        this.maxDelta = maxDelta;
        this.previous = range.sample(random.float);
        this.next = this.previous;
        this.idle = false;
        this.bounceUp = false;
    }

    /**
     * Set the next value
     * @param {number} value The new value
     */
    setNext(value) {
        if (this.maxDelta === -1)
            this.next = value;
        else {
            let delta = value - this.next;

            if (delta > this.maxDelta)
                delta = this.maxDelta;
            else if (delta < -this.maxDelta)
                delta = -this.maxDelta;

            this.next += delta;
        }
    }

    /**
     * A function to call when the next frame arrives
     */
    onFrame() {
        this.previous = this.next;

        if (!this.idle) {
            if (this.bounce) {
                if (this.bounceUp)
                    this.setNext(this.next = this.previous + this.random.float * (this.range.max - this.previous));
                else
                    this.setNext(this.range.min + this.random.float * (this.previous - this.range.min));

                this.bounceUp = !this.bounceUp;
            }
            else
                this.setNext(this.range.sample(this.random.float));
        }

        if (this.idling)
            this.idle = !this.idle;
    }

    /**
     * Get the value for this interpolator
     * @returns {number} The current value
     */
    get value() {
        return this.previous + (.5 - .5 * Math.cos(this.progress * Math.PI)) * (this.next - this.previous);
    }
}