import NeuQuant from './js/NeuQuant';
export class ColorTableGenerator {
	private _colorTable: number[] = [];
	private _GCT: string[] = [];
	private _neuQuant: NeuQuant;
	private _distribution = 51;
	private _colorLookup: {
		[index: string]: number;
	} = {};

	constructor(frame: number[]) {
		this._neuQuant = new NeuQuant(frame, 20);
		this._neuQuant.buildColormap();
		this._colorTable = this._neuQuant.getColormap();
	}

	generate() {
		return new Promise((resolve, reject) => {
			let pixel: string = '';
			let count = 0;
			this._colorTable.forEach((value, index, array) => {
				pixel += this.pad(value);
				if ((index + 1) % 3 === 0) {
					this._GCT.push(pixel);
					this._colorLookup[pixel] = count;
					count++;
					pixel = '';
				}
				if (index === this._colorTable.length - 1)
					resolve({
						_colorLookup: this._colorLookup,
						_colorTable: this._GCT,
					});
			});
		});
	}

	lookupRGB(pixel: string) {
		const R = parseInt(pixel.substr(0, 2), 16);
		const G = parseInt(pixel.substr(2, 2), 16);
		const B = parseInt(pixel.substr(4, 2), 16);
		const pixelIndex = this._neuQuant.lookupRGB(R, G, B);

		return pixelIndex;
	}

	private pad(color: number) {
		if (color < 16) {
			return `0${color.toString(16)}`;
		} else {
			return color.toString(16);
		}
	}
}
