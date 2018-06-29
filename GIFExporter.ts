class GIFExporter {
	private _engine: BABYLON.Engine;
	private _canvas: HTMLCanvasElement;
	private _blobURLs: iBlobURL[] = [];
	private _gifGenerator: GIFGenerator;
	private _GIFURL: Blob;
	private _GCT: string[];
	private _recIntervalID: number;
	private _blobCount: number = 0;
	private _RGBPixelData: string[] = [];
	private _indexedPixels: number[] = [];
	private _colorLookup: {
		[index: string]: number;
	} = {};
	private _delay: number = 50;
	private _duration: number = 5000;
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
		let blobNumber = 0;
		/* Capture blobs at this._delay intervals and place them in an array */
		return new Promise((resolve, reject) => {
			/**
			 * TODO: find a better way of adjusting snapshot interval.
			 */
			this._recIntervalID = setInterval(() => {
				this.ToBlob(this._canvas, blob => {
					console.log(blob);
					this._blobURLs.push(
						new iBlobURL(blobNumber, URL.createObjectURL(blob))
					);
				});

				/* if (HTMLCanvasElement.prototype.toBlob) {
					this._canvas.toBlob(results => {
						this._blobURLs.push(
							new iBlobURL(blobNumber, URL.createObjectURL(results))
						);
						blobNumber++;
					});
				} else {
					// console.log(this._canvas.toDataURL());
				} */
			}, this._delay);

			/* Stop capturing blobs and start processing them. */
			setTimeout(() => {
				console.log('​start -> ', 'attempting to stop');
				this.stop().then(() => {
					console.log('​stop -> ', 'has completed inside');
					console.log(this._blobURLs);
					resolve();
				});
			}, this._duration);
		});
	}

	stop() {
		alert(`processing GIF`);
		clearInterval(this._recIntervalID);

		// return new Promise((resolve, reject) => {
		// 	clearInterval(this._recIntervalID);
		// 	this.processBlobs().then(() => {
		// 		this.getStitchedBlob().then(() => {
		// 			resolve();
		// 		});
		// 	});
		// 	console.log('​stop -> ', 'has completed outside');
		// 	reject('Capturing has already complete.');
		// });
	}

	/* Should capture URL of each image created by the GIFGenerator as image/png to display to the user.
        This will allow the ability to select what images make up the animated GIF before stitching it together.*/
	onStitching() {}

	/* run start and instead of giving the user a Blob object it will take that Blob
      and download it to the users device. */
	download() {
		this.getBlobs(this._canvas).then(() => {
			console.log(
				'​GIFExporter -> download -> ',
				`blob[] filled with ${this._blobURLs}`
			);

			this.setupCanvas().then(canvas => {
				// this.getImageData(canvas);
			});
		});
		this._blobURLs.forEach(blob => {
			this.getImages(blob);
		});
	}

	private processBlobs() {
		const canvasPromises = this._blobURLs.map(this.getImages);
		Promise.all(canvasPromises).then(data => console.log(data));
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
		console.log('​GIFExporter -> privateprocess -> ');
		let newCTXData: Uint8ClampedArray;
		let allIndexedImages: any[] = [];
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
				allIndexedImages.push(this._indexedPixels);
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

	private getImages(blob: { _url: any }) {
		const url = blob._url;
		return new Promise((resolve, reject) => {
			let image = new Image();

			image.onload = () => {
				resolve(image);
			};

			image.onerror = () => {
				reject(`${url} did not load as an image correctly`);
			};

			image.src = url;
		});
	}

	/**
	 * ToBlob Edge fix from Babylon.js
	 * @param canvas
	 * @param successCallback
	 * @param mimeType
	 */
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

	private getBlobs(canvas: HTMLCanvasElement) {
		/* Get Blob */
		/* create URL for each blob in Blob[] */
		/* return Blob[] */
		return new Promise((resolve, reject) => {
			console.log('​GIFExporter -> privategetBlobs -> ', `start`);
			/**
			 * // TODO: find a better way of adjusting snapshot interval.
			 */
			this._recIntervalID = setInterval(() => {
				this._blobCount++;
				console.log(
					'​GIFExporter -> this._recIntervalID -> ',
					`iteration ${this._blobCount}`
				);
				console.log(this._recIntervalID);
				this.ToBlob(canvas, blob => {
					this._blobURLs.push(
						new iBlobURL(this._blobCount, URL.createObjectURL(blob))
					);
				});
			}, this._delay);

			setTimeout(() => {
				this.stop();
				resolve();
			}, this._duration);
		});
	}

	private setupCanvas() {
		return new Promise((resolve, reject) => {
			const canvas2 = document.createElement('canvas') as HTMLCanvasElement;
			canvas2.setAttribute('width', this._canvas.width.toString());
			canvas2.setAttribute('height', this._canvas.height.toString());
			const ctx = canvas2.getContext('2d');
			resolve(ctx);
		});
	}
}
