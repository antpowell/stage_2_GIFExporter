export class GIFCreator {
	private _canvas: HTMLCanvasElement;
	private _delay: number;
	private _duration: number;
	private _width: number;
	private _height: number;
	private _message: { job: string; params?: {} };

	constructor(engine: BABYLON.Engine, options?: { delay?: number; duration?: number }) {
		this._canvas = engine.getRenderingCanvas();
		this._delay = options.delay;
		this._duration = options.duration;
	}

	public start(): Promise<number[]> {
		return new Promise(async (resolve, reject) => {
			this.init();
			console.log('record canvas');
			const frameCollection: Uint8Array[] = [];
			let intervalRef = setInterval(async () => {
				frameCollection.push(await this.getFrame());
			}, this._delay);
			setTimeout(() => {
				clearInterval(intervalRef);
				const worker = new Worker('./gif.creator.service.ts');
				this._message = { job: 'createGIF', params: { frames: frameCollection, width: this._width, height: this._height } };
				worker.postMessage(this._message);
				worker.onmessage = ({ data: { gifData } }) => {
					resolve(gifData);
				};
			}, this._duration);
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

	private getFrame(): Promise<Uint8Array> {
		return new Promise(async (resolve, reject) => {
			const gl = this._canvas.getContext('webgl2') || this._canvas.getContext('webgl');
			let pixels = new Uint8Array(this._width * this._height * 4);
			gl.readPixels(0, 0, this._width, this._height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
			resolve(pixels);
		});
	}

	private init() {
		this._width = this._canvas.width;
		this._height = this._canvas.height;
	}
}
