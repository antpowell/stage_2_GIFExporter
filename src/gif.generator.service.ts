import { GIFGenerator } from './gif.generator';

const gifGenerator: GIFGenerator = new GIFGenerator();

addEventListener('message', ev => {
	console.log(ev.data);
});
addEventListener('message', workHandler);

function init(width: number, height: number, GCT: string[]): void {
	console.log('initilizing');

	gifGenerator.init(width, height, GCT);
	postMessage('init complete', 'self');
}

function addFrames({ frames }: { frames: number[][] }): void {
	console.log('stitching frames');

	frames.forEach(frame => {
		gifGenerator.generateFrame(frame);
	});
}

function getStream() {
	console.log('getting data');

	postMessage(gifGenerator.getStream());
}

function workHandler({ data }: { data: any }) {
	console.log(data);
	switch (data.job) {
		case 'init':
			const { width, height, globalColorTable } = data.params;
			init(width, height, globalColorTable);
			break;
		case 'generateFrame':
			const { frames } = data.params;
			addFrames(frames);
			break;
		case 'getStream':
			getStream();
			break;
	}
}
