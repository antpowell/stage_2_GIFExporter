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
		// const RGB:number = this.getNumericalRGB(frame);
		this._neuQuant = new NeuQuant(frame, 10);
		this._neuQuant.buildColormap();
		this._colorTable = this._neuQuant.getColormap();
		console.log(this._colorTable);
	}

	// generate() {
	// 	let count = 0;
	// 	for (let red: number = 0; red < 256; red += this._distribution) {
	// 		for (let green: number = 0; green < 256; green += this._distribution) {
	// 			for (let blue: number = 0; blue < 256; blue += this._distribution) {
	// 				const pixel = this.pad(red) + this.pad(green) + this.pad(blue);

	// 				this._colorTable.push(pixel);

	// 				this._colorLookup[pixel] = count;

	// 				count++;
	// 			}
	// 		}
	// 	}
	// 	return {
	// 		_colorLookup: this._colorLookup,
	// 		_colorTable: this._colorTable
	// 	};
	// }

	generate() {
		return new Promise((resolve, reject) => {
			let pixel: string;
			let count = 0;
			this._colorTable.forEach((color, index) => {
				pixel + this.pad(color);
				if (index !== 0 && index % 3 === 0) {
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

	private pad(color: number) {
		if (color < 16) {
			return `0${color.toString(16)}`;
		} else {
			return color.toString(16);
		}
	}
}
