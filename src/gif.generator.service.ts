import { GIFGenerator } from './gif.generator';

onmessage = ({ data: { message, data } }) => {
	switch (message) {
		case 'init':
			init(data);
			break;
		case 'add frames':
			addFrames(data);
			break;
		default:
			throw new Error('invalid message to GIF worker');
			break;
	}
};

function init({ weight, height, GCT }: { weight: number; height: number; GCT: string[] }): void {
	const gifGenerator = new GIFGenerator(weight, height, GCT);
	gifGenerator.init();
	postMessage('init complete', 'self');
}

function addFrames({ frames, gifInstance }: { frames: number[][]; gifInstance: GIFGenerator }): void {
	frames.forEach(async frame => {
		await gifInstance.generateFrame(frame);
	});
}
