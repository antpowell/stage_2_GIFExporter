import { GIFGenerator } from './gif.generator';
import { ColorTableGenerator } from './color.table.generator';

export class GIFExporter {
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
	private _downloading: any;

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

	public async start(): Promise<number[]> {
		await this.generateColorTable();
		console.log('​GIFExporter3 -> start -> ');
		return new Promise<number[]>(async (resolve, reject) => {
			await this.getSnapShotDataFromCanvas();
			this.bootstrapGIF();

			console.log('setupImg complete');

			await this.processFrames(this._imageDataCollection);
			resolve(this._gifGenerator.getStream());
		});
	}

	public stop(): void {
		console.log('​GIFExporter3 -> stop -> ');
		clearInterval(this._intervalRef);
	}

	public async download(filename = 'canvasGIF.gif'): Promise<void> {
		const imgData = await this.start();
		console.log('​GIFExporter3 -> download -> ');
		const url = URL.createObjectURL(
			new Blob([new Uint8Array(imgData)], {
				type: 'image/gif',
			})
		);
		const download = document.createElement('a');
		document.body.appendChild(download);
		download.target = '_blank';
		download.setAttribute('target', '_blank');
		download.style.display = 'none';
		download.href = url;
		download.download = filename;
		download.click();
		URL.revokeObjectURL(url);
		download.parentElement.removeChild(download);
	}

	private getSnapShotDataFromCanvas(): Promise<{}> {
		return new Promise((resolve, reject) => {
			this._intervalRef = setInterval(async () => {
				const pixels = await this.getWebGLPixels();
				this._imageDataCollection.push(pixels);
			}, this._delay);
			setTimeout(() => {
				this.stop();
				resolve();
			}, this._duration);
		});
	}

	private processFrames(imageDataCollection: Uint8Array[]): Promise<{}> {
		console.log('​GIFExporter3 -> privateprocessFrames -> ');
		return new Promise(async (resolve, reject) => {
			let count = imageDataCollection.length;
			imageDataCollection.forEach(async imgData => {
				imgData = (await this.flipFrame(imgData)) as Uint8Array;
				const [rgbData] = this.removeAlpha(imgData);
				const indexedData = this.mapPixelIndex(rgbData as string[]);
				this._gifGenerator.generateFrame(indexedData);
				if (--count === 0) resolve();
			});
		});
	}

	private flipFrame(frame: Uint8Array): Promise<Uint8Array> {
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

	private removeAlpha(colorArray: Uint8ClampedArray): [string[], number[]] {
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

	private pad(color: number): string {
		if (color < 16) {
			return `0${color.toString(16)}`;
		} else {
			return color.toString(16);
		}
	}

	private mapPixelIndex(rgbData: string[]): number[] {
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

	private async getColorFrame(): Promise<number[]> {
		const pixels = await this.getWebGLPixels();
		const img = (await this.flipFrame(pixels)) as Uint8Array;
		const [, RBGData] = this.removeAlpha(img);

		return RBGData;
	}

	private generateColorTable(): Promise<{}> {
		return new Promise(async (resolve, reject) => {
			const RGBFrame = await this.getColorFrame();
			this._colorTableGenerator = new ColorTableGenerator(RGBFrame);

			[
				this._colorLookUpTable,
				this._GCT,
			] = await this._colorTableGenerator.generate();

			this._gifGenerator = new GIFGenerator(
				this._width,
				this._height,
				this._GCT
			);
			this._gifGenerator.init();
			resolve();
		});
	}

	private bootstrapGIF(): void {
		this._gifGenerator = new GIFGenerator(this._width, this._height, this._GCT);
		this._gifGenerator.init();
	}

	private getWebGLPixels(): Promise<Uint8Array> {
		return new Promise((resolve, reject) => {
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
			resolve(pixels);
		});
	}
}
