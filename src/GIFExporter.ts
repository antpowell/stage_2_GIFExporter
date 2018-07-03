import { GIFGenerator } from './GIFGenerator';
import { ColorTableGenerator } from './ColorTableGenerator';
import NeuQuant from './js/NeuQuant';

export class GIFExporter {
	private _neuQuant: NeuQuant;
	private _engine: BABYLON.Engine;
	private _canvas: HTMLCanvasElement;
	private _delay: number;
	private _duration: number;
	private _GCT: string[];
	private _intervalRef: number;
	private _width: number;
	private _height: number;
	private _imageDataCollection: Uint8Array[] = [];
	private _gifGenerator: GIFGenerator;
	private _colorLookUpTable: { [index: string]: number };
	private _colorTableGenerator: ColorTableGenerator;

	constructor(
		engine: BABYLON.Engine,
		options?: { delay?: number; duration?: number; GCT?: string[] }
	) {
		this._engine = engine;
		this._canvas = engine.getRenderingCanvas();
		this._delay = options.delay;
		this._duration = options.duration;
		this._width = engine.getRenderWidth();
		this._height = engine.getRenderHeight();
	}
	start() {
		this.colorSetup();
		console.log('​GIFExporter3 -> start -> ');
		return new Promise(async (resolve, reject) => {
			await this.getSnapShotDataFromCanvas();

			// console.log(this._GCT);
			this._gifGenerator = new GIFGenerator(
				this._width,
				this._height,
				this._GCT
			);
			this._gifGenerator.init();

			console.log('setupImg complete');

			await this.processFrames(this._imageDataCollection);
			// console.log(`finished`, this._imageDataCollection);
			resolve();
		});
	}

	stop() {
		console.log('​GIFExporter3 -> stop -> ');
		clearInterval(this._intervalRef);
	}

	async download() {
		console.log('​GIFExporter3 -> download -> ');
		await this.start();
		this._gifGenerator.download('testingGE3.gif');
	}

	private getSnapShotDataFromCanvas() {
		return new Promise((resolve, reject) => {
			this._intervalRef = setInterval(() => {
				const gl =
					this._canvas.getContext('webgl2') || this._canvas.getContext('webgl');
				const pixels = new Uint8Array(
					gl.drawingBufferWidth * gl.drawingBufferHeight * 4
				);
				gl.readPixels(
					0,
					0,
					gl.drawingBufferWidth,
					gl.drawingBufferHeight,
					gl.RGBA,
					gl.UNSIGNED_BYTE,
					pixels
				);
				this._imageDataCollection.push(pixels);
			}, this._delay);
			setTimeout(() => {
				this.stop();
				resolve();
			}, this._duration);
		});
	}

	private processFrames(imageDataCollection: Uint8Array[]) {
		console.log('​GIFExporter3 -> privateprocessFrames -> ');
		new Promise(async (resolve, reject) => {
			let count = imageDataCollection.length;
			imageDataCollection.forEach(async imgData => {
				imgData = (await this.flipFrame(imgData)) as Uint8Array;
				const rgbData = this.removeAlpha(imgData);
				const indexedData = this.mapPixelIndex(rgbData[0] as string[]);
				this._gifGenerator.generateFrame(indexedData);
				if (--count === 0) resolve();
			});
		});
	}

	private flipFrame(frame: Uint8Array) {
		return new Promise((resolve, reject) => {
			const split =
				(this._height / 2) |
				0; /* | 0 faster version of Math.floor for positive numbers */
			const bytesPerRow = this._width * 4;

			// make a temp buffer to hold one row
			var row = new Uint8Array(this._width * 4);
			for (var rowIndex = 0; rowIndex < split; ++rowIndex) {
				var topOffset = rowIndex * bytesPerRow;
				var bottomOffset = (this._height - rowIndex - 1) * bytesPerRow;

				// make copy of a row on the top half
				row.set(frame.subarray(topOffset, topOffset + bytesPerRow));

				// copy a row from the bottom half to the top
				frame.copyWithin(topOffset, bottomOffset, bottomOffset + bytesPerRow);

				// copy the copy of the top half row to the bottom half
				frame.set(row, bottomOffset);

				if (rowIndex < split) resolve(frame);
			}
		});
	}

	private removeAlpha(colorArray: Uint8ClampedArray) {
		let RGBPixelData: string[] = [];
		let RGBNumerical: number[] = [];
		for (let i = 0; i < colorArray.length; i += 4) {
			const pixel =
				this.pad(colorArray[i]) +
				this.pad(colorArray[i + 1]) +
				this.pad(colorArray[i + 2]);

			RGBPixelData.push(pixel);
			RGBNumerical.push(colorArray[i]);
			RGBNumerical.push(colorArray[i + 1]);
			RGBNumerical.push(colorArray[i + 2]);
		}

		return [RGBPixelData, RGBNumerical];
	}

	private pad(color: number) {
		if (color < 16) {
			return `0${color.toString(16)}`;
		} else {
			return color.toString(16);
		}
	}

	private mapPixelIndex(rgbData: string[]) {
		const indexedPixels: number[] = [];
		rgbData.forEach(pixel => {
			if (this._colorLookUpTable[pixel]) {
				indexedPixels.push(this._colorLookUpTable[pixel]);
			} else {
				indexedPixels.push(this._colorTableGenerator.lookupRGB(pixel));
			}
		});
		return indexedPixels;
	}

	private async getColorFrame() {
		const gl =
			this._canvas.getContext('webgl2') || this._canvas.getContext('webgl');
		const pixels = new Uint8Array(
			gl.drawingBufferWidth * gl.drawingBufferHeight * 4
		);
		gl.readPixels(
			0,
			0,
			gl.drawingBufferWidth,
			gl.drawingBufferHeight,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			pixels
		);
		const img = (await this.flipFrame(pixels)) as Uint8Array;
		const RBGData = this.removeAlpha(img);

		return RBGData[1];
	}

	private async colorSetup() {
		const RGBFrame = (await this.getColorFrame()) as number[];
		this._colorTableGenerator = new ColorTableGenerator(RGBFrame);
		let color = (await this._colorTableGenerator.generate()) as {
			_colorLookup: {
				[index: string]: number;
			};
			_colorTable: string[];
		};

		console.log(color);
		this._colorLookUpTable = color._colorLookup;
		this._GCT = color._colorTable;
		this._gifGenerator = new GIFGenerator(this._width, this._height, this._GCT);
		this._gifGenerator.init();
	}
}
