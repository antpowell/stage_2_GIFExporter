export class EncodedImage {
	data: number[] = [];

	constructor() {}

	public get(): number[] {
		return this.data;
	}

	public write(byte: number): void {
		this.data.push(byte);
	}

	public writeArray(array: number[], arraySize: number): void {
		for (let i = 0; i < arraySize; i++) {
			this.write(array[i]);
		}
	}

	public writeUTF(UTF: string): void {
		for (let i = 0; i < UTF.length; i++) {
			this.write(UTF.charCodeAt(i));
		}
	}

	public writeColor(color: string): void {
		for (let i = 0; i < color.length; i += 2) {
			const intValue: number = parseInt(color[i] + color[i + 1], 16);
			this.write(intValue);
		}
	}

	public writeLittleEndian(num: number): void {
		this.write(num & 0xff);
		this.write((num >> 8) & 0xff);
	}
}
