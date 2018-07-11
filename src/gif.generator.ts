import { EncodedImage } from './encoded.image';
import { LZWEncoder } from './LZW';

export class GIFGenerator {
	private stream: EncodedImage = new EncodedImage();
	private width: number;
	private height: number;
	private frameIndexedPixels: number[];
	private frameCount: number = 0;
	private GCT: string[];

	constructor() {
		console.log(`Generator now running...`);
	}

	public init(width: number, height: number, GCT: string[]): void {
		this.reset();
		this.width = width;
		this.height = height;
		this.GCT = GCT;
		this.writeHeader();
		this.writeLogicalScreenDescriptor();
		this.writeGlobalColorTable();
		this.writeApplicationExtension();
	}

	public generateFrame(indexedPixels: number[]): void {
		this.frameIndexedPixels = indexedPixels;
		this.frameCount += 1;
		console.log(`generating frame ${this.frameCount}`);
		this.writeGraphicControlExtension();
		this.writeImageDescriptor();
		this.writeImageData();
	}

	public getStream(): number[] {
		this.writeTrailer();
		return this.stream.get();
	}

	private writeHeader(): void {
		this.stream.writeUTF('GIF89a'); /* GIF Header */
	}

	private writeLogicalScreenDescriptor(): void {
		this.stream.writeLittleEndian(this.width); /* Canvas Width */
		this.stream.writeLittleEndian(this.height); /* Canvas Height */
		this.stream.write(0xf7); /* Packed Field */
		this.stream.write(0); /* Background Color Index */
		this.stream.write(0); /* Pixel Aspect Ration */
	}

	private writeGraphicControlExtension(): void {
		this.stream.write(0x21); /* Extension Introducer */
		this.stream.write(0xf9); /* Graphic Control Label */
		this.stream.write(0x4); /* Byte Size */
		this.stream.write(0x4); /* Packed Field */
		this.stream.writeLittleEndian(0x9); /* Delay Time */
		this.stream.write(0x0); /* Transparent Color Index */
		this.stream.write(0x0); /* Block Terminator */
	}

	private writeImageDescriptor(): void {
		this.stream.write(0x2c); /* Image Seperator Always 2C */
		this.stream.writeLittleEndian(0x0); /* Image Left */
		this.stream.writeLittleEndian(0x0); /* Image Top */
		this.stream.writeLittleEndian(this.width); /* Image Width */
		this.stream.writeLittleEndian(this.height); /* Image Height */
		this.stream.write(0x0); /* Block Terminator */
	}

	private writeApplicationExtension(): void {
		this.stream.write(0x21); /* extension introducer */
		this.stream.write(0xff); /* app extension label */
		this.stream.write(11); /* block size */
		this.stream.writeUTF('NETSCAPE' + '2.0'); /* app id + auth code */
		this.stream.write(3); /* sub-block size */
		this.stream.write(1); /* loop sub-block id */
		this.stream.writeLittleEndian(0); /* loop count (extra iterations, 0=repeat forever) */
		this.stream.write(0); /* Block Terminator */
	}

	private writeTrailer(): void {
		this.stream.write(0x3b); /* Trailer Marker */
		console.log(`Generator now finished.`);
		this.frameCount = 0; /* Reset frame count for next GIF */
	}

	private writeGlobalColorTable(): void {
		let count = 0;

		this.GCT.forEach(color => {
			count += 3;
			this.stream.writeColor(color);
		});

		for (let i = count; i < 3 * 256; i++) {
			this.stream.write(0);
		}
	}

	private async writeImageData(): Promise<void> {
		const encoder = new LZWEncoder(this.width, this.height, this.frameIndexedPixels, 8);
		encoder.encode(this.stream);
		console.log(`completed frame ${this.frameCount}`);
	}

	private writeLocalColorTable(): void {}

	private writePlainTextExtension(): void {}

	private writeCommentExtension(): void {}

	private reset() {
		this.stream.reset();
		this.frameCount = 0;
	}
}
