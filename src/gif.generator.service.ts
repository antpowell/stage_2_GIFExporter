import { GIFGenerator } from './gif.generator';
function init({weight, height, GCT }: {weight: number, height: number, GCT: string[]}): void{
    const gifGenerator = new GIFGenerator(weight, height, GCT);
    gifGenerator.init();
}f