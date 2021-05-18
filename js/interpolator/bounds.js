export class Bounds {
    /**
     * Construct a bounded range
     * @param {number} min The minimum value
     * @param {number} max The maximum value
     */
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }

    /**
     * Sample a value inside these bounds
     * @param {number} at The position to sample at in the range [0, 1]
     * @returns {number} A value inside these bounds
     */
    sample(at) {
        return this.min + at * this.domain;
    }

    /**
     * Get the domain of these bounds
     * @returns {number} The domain
     */
    get domain() {
        return this.max - this.min;
    }
}