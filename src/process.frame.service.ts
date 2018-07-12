const ctx: Worker = self as any;

addEventListener('message', ({ data: { job, params } }) => {
	switch (job) {
		case 'flipFrames':
			const { frames, width, height } = params;
			flipFrames(frames, width, height);
	}
});

export function flipFrames(frames: Uint8Array[], width: number, height: number) {
	const numericalRGBFrames: Uint8Array[] = [];
	const stringRGBFrames: string[][] = [];
	frames.forEach(frame => {
		const mid = (height / 2) | 0;
		const rowLen = width * 4;

		let flipRow = new Uint8Array(rowLen);
		for (let rowNum = 0; rowNum < mid; ++rowNum) {
			let topPointer = rowNum * rowLen;
			let bottomPointer = (height - rowNum - 1) * rowLen;
			if (frame === undefined) return;
			flipRow.set(frame.subarray(topPointer, topPointer + rowLen));
			frame.copyWithin(topPointer, bottomPointer, bottomPointer + rowLen);
			frame.set(flipRow, bottomPointer);
		}
		const { numericalRGBData, stringRGBData } = toRGBData(frame);
		numericalRGBFrames.push(numericalRGBData);
		stringRGBFrames.push(stringRGBData);
	});
	ctx.postMessage({ numericalRGBFrames, stringRGBFrames });
}

function toRGBData(frame: Uint8Array): { numericalRGBData: Uint8Array; stringRGBData: string[] } {
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
	return { numericalRGBData, stringRGBData };
}

function pad(color: number): string {
	if (color < 16) {
		return `0${color.toString(16)}`;
	} else {
		return color.toString(16);
	}
}
