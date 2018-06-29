class GIFExporter2 {
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
	private _imageDataCollection: ImageData[];
	private _gifGenerator: GIFGenerator;
	private _colorLookUpTable: { [index: string]: number };

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
		console.log('​GIFExporter2 -> start -> ');
		return new Promise((resolve, reject) => {
			const writingContext = this.setupCanvas();
			this.getBlobs()
				.then(this.setupImgs)
				.then(imgs =>
					this.collectImageData(imgs as HTMLImageElement[], writingContext)
				)
				.then(this.processFrames)
				.then(() => {
					console.log(`finished`);
				});
		});
	}

	stop() {
		console.log('​GIFExporter2 -> stop -> ');
		clearInterval(this._intervalRef);
	}

	download() {
		console.log('​GIFExporter2 -> download -> ');
		this.start();
	}

	private getBlobs() {
		console.log('​GIFExporter2 -> privategetBlobs -> ');
		return new Promise((resolve, reject) => {
			this._intervalRef = setInterval(this.engineBlobToURL, this._delay);
			setTimeout(() => {
				stop();
				resolve();
			}, this._duration);
		});
	}

	private engineBlobToURL() {
		console.log('​GIFExporter2 -> privateengineBlobToURL -> ');
		this._blobCount++;
		this.ToBlob(this._canvas, blob => {
			this._blobURLs.push(URL.createObjectURL(blob));
			console.log(
				'​GIFExporter2 -> privateengineBlobToURL -> this._blobURLs',
				this._blobURLs
			);
		});
	}

	private setupCanvas() {
		console.log('​GIFExporter2 -> privatesetupCanvas -> ');
		const canvas2 = document.createElement('canvas') as HTMLCanvasElement;
		canvas2.setAttribute('width', this._width.toString());
		canvas2.setAttribute('height', this._height.toString());
		const ctx = canvas2.getContext('2d');
		return ctx;
	}

	private setupImgs() {
		console.log('​GIFExporter2 -> privatesetupImgs -> ');
		return new Promise((resolve, reject) => {
			const imgs: HTMLImageElement[] = [];
			let count = this._blobCount;

			this._blobURLs.forEach(url => {
				const img = new Image();
				img.src = url;
				img.onload = () => {
					imgs.push(img);
					if (--count === 0) resolve(imgs);
				};
			});
		});
	}

	private collectImageData(
		imgs: HTMLImageElement[],
		ctx: CanvasRenderingContext2D
	) {
		return new Promise((resolve, reject) => {
			const imgDataCollection: ImageData[] = [];
			let count = imgs.length;

			imgs.forEach(img => {
				ctx.drawImage(img, 0, 0, this._width, this._height);
				imgDataCollection.push(
					ctx.getImageData(0, 0, this._width, this._height)
				);
				if (--count === 0) resolve(imgDataCollection);
			});
		});
	}

	private processFrames(imageDataCollection: ImgaeData[]) {
		console.log('​GIFExporter2 -> privateprocessFrames -> ');
		new Promise((resolve, reject) => {
			let count = imageDataCollection.length;
			imageDataCollection.forEach(imgData => {
				const rgbData = this.removeAlpha(imgData.data);
				const indexedData = this.mapPixelIndex(rgbData);
				this._gifGenerator.generateFrame(indexedData);
				if (--count === 0) resolve();
			});
		});
	}

	private removeAlpha(colorArray: Uint8ClampedArray) {
		console.log('​GIFExporter2 -> privateremoveAlpha -> ');
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
		console.log('​GIFExporter2 -> privatepad -> ');
		if (color < 16) {
			return `0${color.toString(16)}`;
		} else {
			return color.toString(16);
		}
	}

	private snapColor(color: number) {
		console.log('​GIFExporter2 -> privatesnapColor -> ');
		if (color % 51 > Math.floor(51 / 2)) {
			color += 51 - (color % 51);
		} else {
			color -= color % 51;
		}
		return color;
	}

	private mapPixelIndex(rgbData: string[]) {
		console.log('​GIFExporter2 -> privatemapPixelIndex -> ');
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
		console.log('​GIFExporter2 -> ToBlob ');
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
