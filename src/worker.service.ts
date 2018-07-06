export class WorkerService {
	constructor() {}

	public LZW(data: any) {
		return new Promise((resolve, reject) => {
			const worker = new Worker('./lzw.service.ts');

			worker.postMessage(data);

			worker.onmessage = encodedData => {};
		});
	}

	public GIFGenerator(obj: any) {
		return new Promise((resolve, reject) => {
			// // const worker = new Worker('./gif');
			// worker.postMessage(obj);
			// worker.onmessage = stream => resolve(stream);
		});
	}
}
