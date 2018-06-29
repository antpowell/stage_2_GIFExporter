class GIFExporter3 {
	private _engine: BABYLON.Engine;
	private _canvas: HTMLCanvasElement;
	private _delay: number;
	private _duration: number;
	private _GCT: string[];
	private _blobURLs: string[] = [];
	private _blobCount: number = 0;
	private _intervalRef: number;
	private _width: number;
	private _height: number;
	private _imageDataCollection: Uint8Array[] = [];
	private _gifGenerator: GIFGenerator;
	private _colorLookUpTable: { [index: string]: number };
	private _ctx: CanvasRenderingContext2D;

	constructor(
		engine: BABYLON.Engine,
		options?: { delay?: number; duration?: number; GCT?: string[] }
	) {
		const colorGenerator = new ColorTableGenerator().generate();
		this._engine = engine;
		this._canvas = engine.getRenderingCanvas();
		this._delay = options.delay;
		this._duration = options.duration;
		this._GCT = options.GCT || colorGenerator._colorTable;
		this._colorLookUpTable = colorGenerator._colorLookup;
		this._width = engine.getRenderWidth();
		this._height = engine.getRenderHeight();
		this._gifGenerator = new GIFGenerator(this._width, this._height, this._GCT);
		this._gifGenerator.init();
	}
	start() {
		console.log('​GIFExporter3 -> start -> ');
		return new Promise(async (resolve, reject) => {
			await this.getSnapShotDataFromCanvas();
			// this._ctx = this.setupCanvas();
			// await this.getBlobs();
			// await this.setupImgs();
			console.log('setupImg complete');

			// const imgDataCollection = await this.collectImageData(
			// 	imgs as HTMLImageElement[],
			// 	this._ctx
			// );
			await this.processFrames(this._imageDataCollection);
			console.log(`finished`, this._imageDataCollection);
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

	private getBlobs() {
		console.log('​GIFExporter3 -> privategetBlobs -> ');
		return new Promise((resolve, reject) => {
			this._intervalRef = setInterval(() => {
				this.engineBlobToURL();
			}, this._delay);
			setTimeout(() => {
				this.stop();
				resolve();
			}, this._duration);
		});
	}

	private engineBlobToURL() {
		this._blobCount++;
		this.ToBlob(this._canvas, blob => {
			console.log('getting blob ', this._blobCount);
			this._blobURLs.push(URL.createObjectURL(blob));
		});
	}

	private setupCanvas() {
		console.log('​GIFExporter3 -> privatesetupCanvas -> ');
		const canvas2 = document.createElement('canvas') as HTMLCanvasElement;
		canvas2.setAttribute('width', this._width.toString());
		canvas2.setAttribute('height', this._height.toString());
		const ctx = canvas2.getContext('2d');
		return ctx;
	}

	private setupImgs() {
		console.log('​GIFExporter3 -> privatesetupImgs -> ');
		return new Promise((resolve, reject) => {
			console.log(`Creating images`);

			const imgs: HTMLImageElement[] = [];
			let count = this._blobCount;

			this._blobURLs.forEach(url => {
				console.log(`working on image`, url);

				const img = new Image();
				img.width = 200;
				img.height = 200;
				img.onload = async () => {
					await this.collectImageDataOnLoad(img);
					// imgs.push(img);
					console.log('count', count);
					if (--count === 1) resolve();
				};
				img.src = url;
			});
		});
	}

	private collectImageData(
		imgs: HTMLImageElement[],
		ctx: CanvasRenderingContext2D
	) {
		return new Promise((resolve, reject) => {
			let imgDataCollection: Uint8ClampedArray[] = [];
			let count = imgs.length;

			imgs.forEach(img => {
				ctx.drawImage(img, 0, 0, this._width, this._height);
				imgDataCollection.push(
					ctx.getImageData(0, 0, this._width, this._height).data
				);
				console.log(`image data collection`, imgDataCollection);

				ctx.clearRect(0, 0, this._width, this._height);
				if (--count === 0) resolve(imgDataCollection);
			});
		});
	}

	private collectImageDataOnLoad(img) {
		return new Promise((resolve, reject) => {
			console.log('collecting data');

			const gl: WebGLRenderingContext =
				this._canvas.getContext('webgl2') || this._canvas.getContext('webgl');
			console.log(gl);
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
			console.log(pixels);

			// console.log(`collecting data on `, img);
			// this._ctx.drawImage(img, 0, 0, this._width, this._height);
			// this._imageDataCollection.push(
			// 	this._ctx.getImageData(0, 0, this._width, this._height)
			// );
			resolve();
		});
	}

	private getSnapShotDataFromCanvas() {
		return new Promise((resolve, reject) => {
			this._intervalRef = setInterval(() => {
				// console.log('getting data from canvas');
				const gl: WebGLRenderingContext =
					(this._canvas.getContext('webgl2') as WebGLRenderingContext) ||
					this._canvas.getContext('webgl');
				// console.log(gl);
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
		new Promise((resolve, reject) => {
			let count = imageDataCollection.length;
			imageDataCollection.forEach(async imgData => {
				const rgbData = this.removeAlpha(imgData);
				const indexedData = this.mapPixelIndex(rgbData);
				this._gifGenerator.generateFrame(indexedData);
				if (--count === 0) resolve();
			});
		});
	}

	private removeAlpha(colorArray: Uint8ClampedArray) {
		let RGBPixelData: string[] = [];
		for (let i = 0; i < colorArray.length; i += 4) {
			const pixel =
				this.pad(this.snapColor(colorArray[i])) +
				this.pad(this.snapColor(colorArray[i + 1])) +
				this.pad(this.snapColor(colorArray[i + 2]));

			RGBPixelData.push(pixel);
		}

		return RGBPixelData;
	}

	private pad(color: number) {
		if (color < 16) {
			return `0${color.toString(16)}`;
		} else {
			return color.toString(16);
		}
	}

	private snapColor(color: number) {
		if (color % 51 > Math.floor(51 / 2)) {
			color += 51 - (color % 51);
		} else {
			color -= color % 51;
		}
		return color;
	}

	private mapPixelIndex(rgbData: string[]) {
		const indexedPixels: number[] = [];
		rgbData.forEach(pixel => {
			indexedPixels.push(this._colorLookUpTable[pixel]);
		});
		return indexedPixels;
	}

	private ToBlob(
		canvas: HTMLCanvasElement,
		successCallback: (blob?: Blob) => void,
		mimeType: string = 'image/png'
	): void {
		// We need HTMLCanvasElement.toBlob for HD screenshots

		if (!canvas.toBlob) {
			//  low performance polyfill based on toDataURL (https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob)

			canvas.toBlob = function(callback, type, quality) {
				setTimeout(() => {
					var binStr = atob(this.toDataURL(type, quality).split(',')[1]),
						len = binStr.length,
						arr = new Uint8Array(len);

					for (var i = 0; i < len; i++) {
						arr[i] = binStr.charCodeAt(i);
					}

					callback(new Blob([arr]));
				});
			};
		}

		canvas.toBlob(function(blob) {
			successCallback(blob);
		}, mimeType);
	}
}

/* (function() {
    gl = window.renderCanvas.getContext('webgl2')
    console.log(gl)
    const pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight *4);
    console.log(pixels)
    gl.readPixels(0,0,gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
    console.log(pixels)
})(); */
// (function() {
// 	const gl = window.renderCanvas.getContext('webgl2');
// 	const pixels = new Uint8Array(
// 		gl.drawingBufferWidth * gl.drawingBufferHeight * 4
// 	);
// 	console.log(pixels);
// })();
