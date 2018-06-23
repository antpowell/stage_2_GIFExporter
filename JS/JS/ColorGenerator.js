class ColorTableGenerator {
    constructor() {
        this._colorTable = [];
        this._distribution = 51;
        this._colorLookup = {};
    }
    generate() {
        return new Promise((resolve, reject) => {
            let count = 0;
            for (let red = 0; red < 256; red += this._distribution) {
                for (let green = 0; green < 256; green += this._distribution) {
                    for (let blue = 0; blue < 256; blue += this._distribution) {
                        const pixel = this.pad(red) + this.pad(green) + this.pad(blue);
                        this._colorTable.push(pixel);
                        this._colorLookup[pixel] = count;
                        count++;
                    }
                }
            }
            resolve({
                '_colorLookup': this._colorLookup,
                '_colorTable': this._colorTable
            });
        });
    }
    pad(color) {
        if (color < 16) {
            return `0${color.toString(16)}`;
        }
        else {
            return color.toString(16);
        }
    }
}
//# sourceMappingURL=ColorGenerator.js.map
//# sourceMappingURL=ColorGenerator.js.map