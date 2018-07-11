import { GIFGenerator } from './gif.generator';
import { ColorTableGenerator } from './color.table.generator';

export class GIFExporter2 {
	private _canvas: HTMLCanvasElement;
	private _delay: number;
	private _duration: number;
	private _GlobalColorTable: string[];
	private _intervalRef: number;
	private _width: number;
	private _height: number;
	private _imageDataCollection: Uint8Array[] = [];
	private _gifGenerator: GIFGenerator;
	private _colorLookUpTable: { [index: string]: number };
	private _colorTableGenerator: ColorTableGenerator;

	constructor(engine: BABYLON.Engine, options?: { delay?: number; duration?: number; GCT?: string[] }) {
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

	public cancel() {}

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
			// const frameCollection: number[][] = [];
			// const frameCollection: number[][] = imageDataCollection.map(frame => {
			// 	const mid = this._height / 2 | 0;
			// 	const xLen = this._width * 4;

			// 	const singleRow = new Uint8Array(xLen);
			// 	for(let row = 0; row < mid; row ++){
			// 		const top = row * xLen;
			// 		const bottom = (this._height - row - 1) * xLen;

			// 		[frame.subarray(mid), frame.subarray(mid +1)] = [frame.subarray(mid +1), frame.subarray(mid)]

			// 		singleRow.set(frame.subarray(top, top + xLen));
			// 		frame.copyWithin(top, bottom, bottom + xLen);
			// 		frame.set(singleRow, bottom);

			// 	}

			// })
			imageDataCollection.forEach(async imgData => {
				const worker = new Worker('./process.frame.service.ts');
				worker.postMessage({ message: 'processFrame', data: { frame: imgData, height: this._height, width: this._width } });
				worker.onmessage = ({ data }) => {
					console.log('data', data);
					// console.log('checking', numericalData, stringData);
				};
				// imgData = (await this.flipFrame(imgData)) as Uint8Array;
				// const [rgbData] = this.toRGBData(imgData);
				// const indexedData = this.mapPixelIndex(rgbData as string[]);
				// // frameCollection.push(indexedData);
				// this._gifGenerator.generateFrame(indexedData);
				if (--count === 0) resolve();
			});
		});
	}

	private flipFrame(frame: Uint8Array): Promise<Uint8Array> {
		return new Promise((resolve, reject) => {
			const worker = new Worker('./process.frame.service.ts');
			worker.postMessage({ message: 'processFrame', data: { frame, height: this._height, width: this._width } });
			worker.onmessage = ({ data: { numericalData, stringData } }) => {
				console.log(numericalData, stringData);
				// resolve(stringData);
			};
		});
	}

	private toRGBData(colorArray: Uint8ClampedArray): [string[], number[]] {
		let RGBPixelData: string[] = [];
		let RGBNumerical: number[] = [];
		for (let i = 0; i < colorArray.length; i += 4) {
			const pixel = this.pad(colorArray[i]) + this.pad(colorArray[i + 1]) + this.pad(colorArray[i + 2]);

			RGBPixelData.push(pixel);
			RGBNumerical.push(colorArray[i]);
			RGBNumerical.push(colorArray[i + 1]);
			RGBNumerical.push(colorArray[i + 2]);
		}
		console.log(RGBPixelData, RGBPixelData);
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
		let numericalRGBData: number[];
		const pixels = await this.getWebGLPixels();
		const worker = new Worker('./process.frame.service.ts');
		worker.postMessage({ message: 'processFrame', data: { frame: pixels, height: this._height, width: this._width } });
		worker.onmessage = async ({
			data: {
				data: { numericalRGBData },
			},
		}) => {
			// numericalRGBData = numericalRGBData;
			[this._colorLookUpTable, this._GlobalColorTable] = await new ColorTableGenerator(numericalRGBData).generate();
		};
		return numericalRGBData;
	}

	private generateColorTable(): Promise<{}> {
		return new Promise(async (resolve, reject) => {
			const RGBFrame = await this.getColorFrame();
			this._colorTableGenerator = new ColorTableGenerator(RGBFrame);

			[this._colorLookUpTable, this._GlobalColorTable] = await this._colorTableGenerator.generate();

			const gifWorker = new Worker('./gif.generator.service.ts');

			gifWorker.postMessage({ message: 'init', data: { width: this._width, height: this._height, GCT: this._GlobalColorTable } });
			gifWorker.onmessage = ({ data: { message, data } }) => {
				if (message === 'init complete') {
					resolve();
				}
			};

			this._gifGenerator = new GIFGenerator(this._width, this._height, this._GlobalColorTable);
			this._gifGenerator.init();
			resolve();
		});
	}

	private bootstrapGIF(): void {
		this._gifGenerator = new GIFGenerator(this._width, this._height, this._GlobalColorTable);
		this._gifGenerator.init();
	}

	private getWebGLPixels(): Promise<Uint8Array> {
		return new Promise((resolve, reject) => {
			const gl = this._canvas.getContext('webgl2') || this._canvas.getContext('webgl');
			const pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
			gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
			console.log('pixels', pixels);
			resolve(pixels);
		});
	}
}
