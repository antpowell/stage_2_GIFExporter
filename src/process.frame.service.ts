onmessage = ({ data: { message, data } }) => {
	switch (message) {
		case 'processFrame':
			flipFrame(data);
			break;
		default:
			throw new Error('invalid message to frame processer worker');
	}
};

function flipFrame({ frame, width, height }: { frame: Uint8Array; width: number; height: number }) {
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
	toRGBData({ frame, width, height });
}

/**
 * Removes Alpha values from frame and transform data into number[] and string[]
 *
 * @param frame
 * @param width
 * @param hieght
 * @return { rgbData:number[], rgbData: string[]}
 */
function toRGBData({ frame, height, width }: { frame: Uint8Array; height: number; width: number }) {
	//create pixels from frame
	//remove alpha
	//transform pixels into string formated version

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

	postMessage({ message: 'processFrame complete', data: { numericalRGBData, stringRGBData } });
}

function pad(color: number): string {
	if (color < 16) {
		return `0${color.toString(16)}`;
	} else {
		return color.toString(16);
	}
}
