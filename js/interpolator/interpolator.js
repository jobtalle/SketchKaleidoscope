export class Interpolator {
    /**
     * Construct an interpolator
     * @param {Random} random A randomizer
     * @param {Bounds} phaseTime The time for an interpolation phase
     */
    constructor(random, phaseTime) {
        this.random = random;
        this.phaseTime = phaseTime;
        this.time = 0;
        this.timeTarget = phaseTime.sample(random.float);
    }

    /**
     * A function to call when the next frame arrives
     */
    onFrame() {

    }

    /**
     * Update a frame
     * @param {number} time The frame time
     */
    frame(time) {
        if ((this.time += time) > this.timeTarget) {
            this.time -= this.timeTarget;
            this.timeTarget = this.phaseTime.sample(this.random.float);

            this.onFrame();
        }
    }

    /**
     * Get the progress to the next frame
     * @returns {number} The progress in the range [0, 1]
     */
    get progress() {
        return this.time / this.timeTarget;
    }
}