export function flipFrames(
	frames: Uint8Array[],
	width: number,
	height: number
): Promise<{ numericalRGBFrames: Uint8Array[]; stringRGBFrames: string[][] }> {
	return new Promise(async (resolve, reject) => {
		const numericalRGBFrames: Uint8Array[] = [];
		const stringRGBFrames: string[][] = [];
		frames.forEach(async frame => {
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
			const { numericalRGBData, stringRGBData } = await toRGBData(frame);
			numericalRGBFrames.push(numericalRGBData);
			stringRGBFrames.push(stringRGBData);
		});

		resolve({ numericalRGBFrames, stringRGBFrames });
	});
}

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
		resolve({ numericalRGBData, stringRGBData });
	});
}

function pad(color: number): string {
	if (color < 16) {
		return `0${color.toString(16)}`;
	} else {
		return color.toString(16);
	}
}