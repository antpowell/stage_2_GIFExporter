// onmessage = ({
// 	data: {
// 		message,
// 		data: { frame, width, height },
// 	},
// }) => {
// 	switch (message) {
// 		case 'processFrame':
// 			flipFrame(frame, width, height);
// 			break;
// 		default:
// 			throw new Error('invalid message to frame processer worker');
// 	}
// };

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

			flipRow.set(frame.subarray(topPointer, topPointer + rowLen));
			frame.copyWithin(topPointer, bottomPointer, bottomPointer + rowLen);
			frame.set(flipRow, bottomPointer);
		}
		resolve(await toRGBData(frame));
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
	//create pixels from frame
	//remove alpha
	//transform pixels into string formated version
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
		// postMessage({ message: 'processFrame complete', data: { numericalRGBData, stringRGBData } });
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
