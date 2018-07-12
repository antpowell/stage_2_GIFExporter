const ctx: Worker = self as any;
addEventListener('message', async ({ data: { job, params } }) => {
	switch (job) {
		case 'flipFrame':
			console.log(`recieved request to ${job}...💫`);
			const { frame, width, height } = params;
			postMessage(await flipFrame(frame, width, height));
			break;
	}
});

onmessage = routeCall;

export function flipFrame(
	frame: Uint8Array,
	width: number,
	height: number
): Promise<{ numericalRGBData: Uint8Array; stringRGBData: string[] }> {
	return new Promise(async (resolve, reject) => {
		const mid = (height / 2) | 0;
		const rowLen = width * 4;

		let flipRow = new Uint8Array(rowLen);
		for (let rowNum = 0; rowNum < mid; ++rowNum) {
			let topPointer = rowNum * rowLen;
			let bottomPointer = (height - rowNum - 1) * rowLen;
			if (frame === undefined) reject();
			flipRow.set(frame.subarray(topPointer, topPointer + rowLen));
			frame.copyWithin(topPointer, bottomPointer, bottomPointer + rowLen);
			frame.set(flipRow, bottomPointer);
		}
		resolve(toRGBData(frame));
	});
}

/**
 * Removes Alpha values from frame and transform data into number[] and string[]
 *
 * @param frame
 * @param width
 * @param hieght
 * @return { rgbData:number[], rgbData: string[]}
 */
function toRGBData(frame: Uint8Array): Promise<{ numericalRGBData: Uint8Array; stringRGBData: string[] }> {
	return new Promise((resolve, reject) => {
		const numericalRGBData = frame.filter((pixel: number, index: number) => (index + 1) % 4 !== 0);
		const stringRGBData: string[] = [];
		let pixel = '';
		numericalRGBData.forEach((color, index) => {
			pixel += pad(color);
			if ((index + 1) % 3 === 0) {
				stringRGBData.push(pixel);
				pixel = '';
			}
		});
		ctx.postMessage({ message: 'processFrame complete', data: { numericalRGBData, stringRGBData } });
		// resolve({ numericalRGBData, stringRGBData });
	});
}

function pad(color: number): string {
	if (color < 16) {
		return `0${color.toString(16)}`;
	} else {
		return color.toString(16);
	}
}

function finished(numericalRGBFrames: Uint8Array[], stringRGBFrames: string[][]) {
	ctx.postMessage({ message: 'processFrame complete', data: { numericalRGBFrames, stringRGBFrames } });
}

async function routeCall({
	data: { job, params },
}: {
	data: { job: string; params: { frames: Uint8Array[]; width: number; height: number } };
}) {
	switch (job) {
		case 'flipFrame':
			console.log(`recieved request to ${job}...💫`);
			const { frames, width, height } = params;
			if (frames === undefined) break;

			const numericalRGBFrames: Uint8Array[] = [];
			const stringRGBFrames: string[][] = [];
			console.log(frames);
			frames.forEach(async frame => {
				if (frame === undefined) {
				} else {
					const { numericalRGBData, stringRGBData } = await flipFrame(frame, width, height);
					numericalRGBFrames.push(numericalRGBData);
					stringRGBFrames.push(stringRGBData);
				}
			});
			finished(numericalRGBFrames, stringRGBFrames);
			break;
	}
}
