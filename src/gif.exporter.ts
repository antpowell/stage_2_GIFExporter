import { ColorTableGenerator } from './color.table.generator';
import { GIFGenerator } from './gif.generator';
import { flipFrames } from './process.frame';

export class GIFExporter {
	private _gifGenerator = new GIFGenerator();
	private _canvas: HTMLCanvasElement;
	private _gl: WebGLRenderingContext;
	private _delay: number;
	private _duration: number;
	private _width: number;
	private _height: number;
	private _colorTableGen: ColorTableGenerator;
	private _gifWorker: Worker;
	private _message: { job: string; params: {} };

	constructor(engine: BABYLON.Engine, options?: { delay?: number; duration?: number }) {
		this._canvas = engine.getRenderingCanvas();
		this._delay = options.delay;
		this._duration = options.duration;

		// this._gifWorker = new Worker('./gif.generator.service.ts');
	}

	public start(): Promise<number[]> {
		return new Promise(async (resolve, reject) => {
			this.init();
			const colorLookup = await this.createColorTable();
			const frames: Uint8Array[] = await this.recordCanvas();
			const {
				numericalRGBFrames: [numericalRGBData],
				stringRGBFrames,
			} = await this.processFrames(frames);
			const mappedFrames = await this.mapPixelsToIndex(stringRGBFrames, colorLookup);
			await this.writeFrames(mappedFrames);
			// this._message = { job: 'getStream', params: {} };

			// this._gifWorker.postMessage(this._message);
			// this._gifWorker.onmessage = ({ data }) => {
			// 	resolve(data);
			// };
			resolve(this._gifGenerator.getStream());
		});
	}

	public stop(): void {}

	public cancel(): void {}

	public async download(filename = 'canvasGIF.gif'): Promise<void> {
		const gif = await this.start();
		const url = URL.createObjectURL(
			new Blob([new Uint8Array(gif)], {
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

	/**
	 * Records Canvas - Create a collection of snapshots from the canvas of the Babylon Engine
	 *
	 * @returns {frameCollection} @type {Uint8Array}- collection of frames
	 */
	private recordCanvas(): Promise<Uint8Array[]> {
		return new Promise(async (resolve, reject) => {
			console.log('record canvas');
			const frameCollection: Uint8Array[] = [];
			let intervalRef = setInterval(async () => {
				frameCollection.push(await this.getFrame());
			}, this._delay);
			setTimeout(() => {
				clearInterval(intervalRef);
				resolve(frameCollection);
			}, this._duration);
		});
	}

	/**
	 * Creates color table from Babylon Engine and writes it in the GIF header
	 *
	 * @returns nothing
	 */
	private createColorTable(): Promise<{ [index: string]: number }> {
		return new Promise(async (resolve, reject) => {
			const frame = await this.getFrame();
			const frames: Uint8Array[] = [];
			frames.push(frame);
			const {
				numericalRGBFrames: [numericalRGBData],
				stringRGBFrames,
			} = await this.processFrames(frames);
			this._colorTableGen = new ColorTableGenerator(numericalRGBData);
			const [colorLookup, colorTable] = await this._colorTableGen.generate();
			await this.writeColorTable(colorTable);
			resolve(colorLookup);
		});
	}

	/**
	 * Takes a snapshot of the Babylon Engine
	 *
	 * @return {Uint8Array} pixels - representing a snapshot from the canvas
	 */
	private getFrame(): Promise<Uint8Array> {
		return new Promise(async (resolve, reject) => {
			const gl = this._canvas.getContext('webgl2') || this._canvas.getContext('webgl');
			let pixels = new Uint8Array(this._width * this._height * 4);
			gl.readPixels(0, 0, this._width, this._height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
			resolve(pixels);
		});
	}

	/**
	 * Flips the frame given and removes the alpha values of the pixels via worker
	 *
	 * @param {Uint8Array} frame
	 * @returns the object containing number[] RGB data and string[] RGB data
	 */
	private frameToRGBData(frame: Uint8Array): Promise<{ numericalRGBData: Uint8Array; stringRGBData: string[] }> {
		return new Promise(async (resolve, reject) => {
			// const worker = new Worker('./process.frame.service.ts');
			// const frames: Uint8Array[] = [];
			// frames.push(frame);
			// worker.postMessage({ job: 'flipFrame', params: { frames, height: this._height, width: this._width } });
			// worker.onmessage = ({
			// 	data: {
			// 		message,
			// 		data: { numericalRGBData, stringRGBData },
			// 	},
			// }) => {
			// 	resolve({ numericalRGBData, stringRGBData });
			// };
			// const { numericalRGBData, stringRGBData } = await flipFrame(frame, this._width, this._height);
			// resolve({ numericalRGBData, stringRGBData });
		});
	}

	private processFrames(frames: Uint8Array[]): Promise<{ numericalRGBFrames: Uint8Array[]; stringRGBFrames: string[][] }> {
		return new Promise(async (resolve, reject) => {
			// const stringRGBFrames: string[][] = [];

			// const worker = new Worker('./process.frame.service.ts');
			// worker.postMessage({ job: 'flipFrame', params: { frames, height: this._height, width: this._width } });
			// worker.onmessage = ({
			// 	data: {
			// 		message,
			// 		data: { numericalRGBFrames, stringRGBFrames },
			// 	},
			// }) => {
			// 	resolve({ numericalRGBFrames, stringRGBFrames });
			// };

			resolve(await flipFrames(frames, this._width, this._height));
		});
	}

	private writeColorTable(globalColorTable: string[]): Promise<void> {
		return new Promise((resolve, reject) => {
			this._message = { job: 'init', params: { width: this._width, height: this._height, globalColorTable } };
			// this._gifWorker.postMessage(this._message);
			this._gifGenerator.init(this._width, this._height, globalColorTable);
			resolve();
		});
	}

	private writeFrames(mappedFrames: number[][]): Promise<void> {
		return new Promise((resolve, reject) => {
			this._message = { job: 'generateFrame', params: { frames: mappedFrames } };
			// this._gifWorker.postMessage(this._message);
			// resolve();
			mappedFrames.forEach(async frame => {
				await this._gifGenerator.generateFrame(frame);
				resolve();
			});
		});
	}

	private mapPixelsToIndex(frames: string[][], colorLookup: { [index: string]: number }): Promise<number[][]> {
		return new Promise(async (resolve, reject) => {
			const indexedFrames: number[][] = [];
			frames.forEach(frame => {
				const indexedPixels: number[] = [];
				frame.forEach(pixel => {
					if (colorLookup[pixel]) {
						indexedPixels.push(colorLookup[pixel]);
					} else {
						indexedPixels.push(this._colorTableGen.lookupRGB(pixel));
					}
				});
				indexedFrames.push(indexedPixels);
			});
			resolve(indexedFrames);
		});
	}

	private init() {
		this._width = this._canvas.width;
		this._height = this._canvas.height;
		this._gl = this._canvas.getContext('webgl2') || this._canvas.getContext('webgl');
	}
}
