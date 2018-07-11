import { ColorTableGenerator } from './color.table.generator';
import { GIFGenerator } from './gif.generator';

export class GIFExporter {
	private _gifGenerator = new GIFGenerator();
	private _gl: WebGLRenderingContext;
	private _delay: number;
	private _duration: number;
	private _width: number;
	private _height: number;
	private _colorTableGen: ColorTableGenerator;

	constructor(engine: BABYLON.Engine, options?: { delay?: number; duration?: number }) {
		const canvas = engine.getRenderingCanvas();
		this._width = engine.getRenderWidth();
		this._height = engine.getRenderHeight();
		this._gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
		this._delay = options.delay;
		this._duration = options.duration;
	}

	public start(): Promise<number[]> {
		return new Promise(async (resolve, reject) => {
			const colorLookup = await this.createColorTable();
			const frames: Uint8Array[] = await this.recordCanvas();
			const stringRGBFrames: string[][] = await this.processFrames(frames);
			const mappedFrames = await this.mapPixelsToIndex(stringRGBFrames, colorLookup);
			await this.writeFrames(mappedFrames);
			resolve(this._gifGenerator.getStream());
		});
	}

	public stop() {}

	public cancel() {}

	public async download(filename = 'canvasGIF.gif') {
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
			const { numericalRGBData, stringRGBData } = await this.frameToRGBData(frame);
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
			const pixels = new Uint8Array(this._width * this._height * 4);
			this._gl.readPixels(0, 0, this._width, this._height, this._gl.RGBA, this._gl.UNSIGNED_BYTE, pixels);
			resolve(pixels);
		});
	}

	/**
	 * Flips the frame given and removes the alpha values of the pixels via worker
	 *
	 * @param {Uint8Array} frame
	 * @returns the object containing number[] RGB data and string[] RGB data
	 */
	private frameToRGBData(frame: Uint8Array): Promise<{ numericalRGBData: number[]; stringRGBData: string[] }> {
		return new Promise((resolve, reject) => {
			const worker = new Worker('./process.frame.service.ts');
			worker.postMessage({ message: 'processFrame', data: { frame, height: this._height, width: this._width } });
			worker.onmessage = async ({ data: { data } }) => {
				resolve(data);
			};
		});
	}

	private processFrames(frames: Uint8Array[]): Promise<string[][]> {
		return new Promise((resolve, reject) => {
			const stringRGBFrames: string[][] = [];
			frames.forEach(async (frame, index, array) => {
				const { numericalRGBData, stringRGBData } = await this.frameToRGBData(frame);
				stringRGBFrames.push(stringRGBData);
				if (index + 1 === array.length) resolve(stringRGBFrames);
			});
		});
	}

	private writeColorTable(globalColorTable: string[]) {
		return new Promise((resolve, reject) => {
			this._gifGenerator.init(this._width, this._height, globalColorTable);
		});
	}

	private writeFrames(mappedFrames: number[][]) {
		return new Promise((resolve, reject) => {
			mappedFrames.forEach(async frame => {
				await this._gifGenerator.generateFrame(frame);
				resolve();
			});
		});
	}

	private mapPixelsToIndex(frames: string[][], colorLookup: { [index: string]: number }): Promise<number[][]> {
		return new Promise(async (resolve, reject) => {
			const indexedPixels: number[] = [];
			const indexedFrames: number[][] = [];
			frames.forEach(frame => {
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
}
