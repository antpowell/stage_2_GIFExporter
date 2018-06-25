class GIFExporter {
	private _engine: BABYLON.Engine;
	private _canvas: HTMLCanvasElement;
	private _blobURLs: iBlobURL[] = [];
	private _gifGenerator: GIFGenerator;
	private _GIFURL: Blob;
	private _GCT: string[];
	private _recIntervalID: number;
	private _blobCount: number;
	private _RGBPixelData: string[] = [];
	private _indexedPixels: number[] = [];
	private _colorLookup: {
		[index: string]: number;
	} = {};
	private _delay: number = 50;
	private _duration: number = 5000;
	private _isCapturing: boolean = false;
	private _hasNextBlob: boolean = true;
	private _CTGenerator: ColorTableGenerator;

	/* TODO: Add Options for delay, maxTime, ect. +
        constructor(canvas:BABYLONEngine [, options...])*/
	constructor(
		engine: BABYLON.Engine,
		options?: {
			delay: number;
			duration: number;
			CTGenerator?: ColorTableGenerator;
		}
	) {
		this._canvas = engine.getRenderingCanvas();
		this._delay = options.delay || 50;
		this._duration = options.duration || 5000;
		this._CTGenerator = options.CTGenerator || new ColorTableGenerator();

		this._CTGenerator.generate().then(GCT => {
			this._GCT = GCT._colorTable;
			this._colorLookup = GCT._colorLookup;
			this._gifGenerator = new GIFGenerator(
				this._canvas.width,
				this._canvas.height,
				this._GCT
			);
			this._gifGenerator.init();
		});
	}

	start() {
		this._isCapturing = true;
		let blobNumber = 0;
		/* Capture blobs at this._delay intervals and place them in an array */
		return new Promise((resolve, reject) => {
			this._recIntervalID = setInterval(() => {
				if (HTMLCanvasElement.prototype.toBlob) {
					this._canvas.toBlob(results => {
						this._blobURLs.push(
							new iBlobURL(blobNumber, URL.createObjectURL(results))
						);
						blobNumber++;
					});
				} else {
					console.log(this._canvas.toDataURL());
				}
			}, this._delay);

			/* Stop capturing blobs and start processing them. */
			setTimeout(() => {
				console.log('​start -> ', 'attempting to stop');
				this.stop().then(() => {
					this._isCapturing = false;
					console.log('​stop -> ', 'has completed inside');
					console.log(this._blobURLs);
					resolve();
				});
			}, this._duration);
		});
	}

	stop() {
		return new Promise((resolve, reject) => {
			if (this._isCapturing) {
				clearInterval(this._recIntervalID);
				this.processBlobsInOrder().then(() => {
					this.getStitchedBlob().then(() => {
						resolve();
					});
				});
				console.log('​stop -> ', 'has completed outside');
			} else {
				reject('Capturing has already complete.');
			}
		});
	}

	/* Should capture URL of each image created by the GIFGenerator as image/png to display to the user.
        This will allow the ability to select what images make up the animated GIF before stitching it together.*/
	onStitching() {}

	/* run start and instead of giving the user a Blob object it will take that Blob
      and download it to the users device. */
	download() {
		this.start().then(GIFURL => {
			// console.log(GIFURL);
			this._gifGenerator.download('insideDownload.gif');
		});
	}

	private processBlobs() {
		return new Promise((resolve, reject) => {
			let newCTXData: Uint8ClampedArray;

			const canvas2 = document.createElement('canvas') as HTMLCanvasElement;
			canvas2.setAttribute('width', this._canvas.width.toString());
			canvas2.setAttribute('height', this._canvas.height.toString());
			const ctx = canvas2.getContext('2d');

			this._blobURLs.forEach(blob => {
				const img = new Image();
				console.log('​privateprocessBlobs -> url', blob._id);

				img.onload = () => {
					console.log(img.src);
					ctx.drawImage(img, 0, 0, canvas2.width, canvas2.height);
					// read new canvas data
					newCTXData = ctx.getImageData(0, 0, canvas2.width, canvas2.height)
						.data;
					this.removeAlpha(newCTXData);
					this.mapPixelIndex();
					this._gifGenerator.generateFrame(this._indexedPixels);
					this.reset();
					if (img.src === this._blobURLs[this._blobURLs.length - 1]) {
						console.log('​img.onload -> ', 'inner completed');
						resolve();
					}
				};
				img.src = blob._url;
			});
		});
	}

	private processBlobsInOrder() {
		return new Promise((resolve, reject) => {
			const canvas2 = document.createElement('canvas') as HTMLCanvasElement;
			canvas2.setAttribute('width', this._canvas.width.toString());
			canvas2.setAttribute('height', this._canvas.height.toString());
			const ctx = canvas2.getContext('2d');

			this.process(ctx).then(_ => {
				resolve();
			});
		});
	}

	private process(ctx?: CanvasRenderingContext2D) {
		let newCTXData: Uint8ClampedArray;
		return new Promise((resolve, reject) => {
			const blobURL: iBlobURL = this._blobURLs.shift();
			if (!blobURL) {
				console.log('​img.onload -> ', 'inner completed');
				resolve();
				this._gifGenerator.download('insideDownload.gif');
				return;
			}
			const img = new Image();
			console.log('​privateprocessBlobs -> url', blobURL._url);

			img.onload = () => {
				console.log(img.src);
				ctx.drawImage(img, 0, 0, this._canvas.width, this._canvas.height);
				// read new canvas data
				newCTXData = ctx.getImageData(
					0,
					0,
					this._canvas.width,
					this._canvas.height
				).data;
				this.removeAlpha(newCTXData);
				this.mapPixelIndex();
				this._gifGenerator.generateFrame(this._indexedPixels).then(_ => {
					this.reset();
					this.process(ctx);
				});
			};
			img.src = blobURL._url;
		});
	}

	private getStitchedBlob() {
		return new Promise((resolve, reject) => {
			console.log(this._blobURLs);
			resolve();
		});
	}

	private removeAlpha(colorArray: Uint8ClampedArray) {
		this._RGBPixelData.length = 0;
		for (let i = 0; i < colorArray.length; i += 4) {
			const pixel =
				this.pad(this.snapColor(colorArray[i])) +
				this.pad(this.snapColor(colorArray[i + 1])) +
				this.pad(this.snapColor(colorArray[i + 2]));

			this._RGBPixelData.push(pixel);
		}
	}

	private pad(color: number) {
		if (color < 16) {
			return `0${color.toString(16)}`;
		} else {
			return color.toString(16);
		}
	}

	private mapPixelIndex() {
		this._RGBPixelData.forEach(pixel => {
			this._indexedPixels.push(this._colorLookup[pixel]);
		});
	}

	private reset() {
		this._RGBPixelData.length = 0;
		this._indexedPixels.length = 0;
	}

	private snapColor(color: number) {
		if (color % 51 > Math.floor(51 / 2)) {
			color += 51 - (color % 51);
		} else {
			color -= color % 51;
		}
		return color;
	}
}
