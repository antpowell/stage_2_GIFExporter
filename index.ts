// // const snapshotBtn = document.getElementById('snapshotBtn');
// // const recordBtn = document.getElementById('recordBtn') as HTMLButtonElement;
// // const recStopBtn = document.getElementById('recStopBtn') as HTMLButtonElement;
// // const downloadGIFBtn = document.getElementById('downloadGIFBtn') as HTMLButtonElement;
// // const canvas: HTMLCanvasElement = document.getElementById('renderCanvas') as HTMLCanvasElement;
// const resultsImg: HTMLImageElement = document.getElementById('resultImg') as HTMLImageElement;
// // const canvasContext = canvas.getContext('2d');
// const centerImgX = (canvas.width / 2) - (canvas.width / 2);
// const centerImgY = (canvas.height / 2) - (canvas.height / 2);
// const RGBPixelData: string[] = [];
// const HEXPixelData: string[] = [];
// let colorLookup: {
//     [index: string]: number
// } = {};
// let globalColorTable: string[] = [];
// const indexedPixels: number[] = [];
// // const blobArray: Blob[] = [];
// const blobURLArray: string[] = [];
// let canvasData: Uint8ClampedArray;
// let gifGenerator: GIFGenerator;
// let firstFrame = true;
// let recIntervalID = 0;

// function init() {

//     new ColorTableGenerator().generate(results => {
//         colorLookup = results[0];
//         globalColorTable = results[1];
//         setupGIF();
//     });
//     downloadGIFBtn.disabled = true;

// }

// window.requestAnimationFrame(() => {
//     console.log(`frame changed`)
//     console.log(`animation change width: ${canvas.width}, animation change height: ${canvas.height}`);
//     init();
// })

// document.addEventListener('DOMContentLoaded', () => {

// })

// function setupGIF() {
//     gifGenerator = new GIFGenerator(canvas.width, canvas.height, globalColorTable);
//     gifGenerator.init();
// }

// function removeAlpha(colorArray: Uint8ClampedArray) {
//     RGBPixelData.length = 0;
//     for (let i = 0; i < colorArray.length; i += 4) {
//         const pixel = (pad(snapColor(colorArray[i])) + pad(snapColor(colorArray[i + 1])) + pad(snapColor(colorArray[i + 2])))

//         RGBPixelData.push(pixel);
//     }
// }

// function snapColor(color: number) {
//     if (color % 51 > Math.floor(51 / 2)) {
//         color += (51 - (color % 51))
//     } else {
//         color -= (color % 51)
//     }
//     return color;
// }

// function pad(color: number) {
//     if (color < 16) {
//         return `0${color.toString(16)}`;
//     } else {
//         return color.toString(16);
//     }
// }

// function mapPixelIndex() {
//     RGBPixelData.forEach(pixel => {
//         indexedPixels.push(colorLookup[pixel]);
//     });
// }

// function littleEndian() {

//     var buffer = new ArrayBuffer(2);
//     new DataView(buffer).setInt16(0, 2, true);

//     return new Int16Array(buffer)[0];
// }

// function reset() {

//     RGBPixelData.length = 0;
//     indexedPixels.length = 0;
    
// }

// recordBtn.addEventListener('click', () => {

//     recIntervalID = setInterval(() => {
//         canvas.toBlob(result => {
//             // blobArray.push(result);
//             blobURLArray.push(URL.createObjectURL(result));
//         })
//     }, 60);

// })

// downloadGIFBtn.addEventListener('click', () => {
//     downloadGIFBtn.disabled = true;
//     gifGenerator.download('CanvasExporter.gif');
// });

// recStopBtn.addEventListener('click', () => {

//     clearInterval(recIntervalID);
//     processBlobs();

// })

// function processBlobs() {
//     let blobURL = blobURLArray.shift();
//     if (!blobURL) {
//         console.log('Blob processing complete');
//         downloadGIFBtn.disabled = false;
//         return;
//     }
//     let newCTXData: Uint8ClampedArray;

//     const canvas2 = document.createElement("canvas") as HTMLCanvasElement;
//     canvas2.setAttribute('width', canvas.width.toString());
//     canvas2.setAttribute('height', canvas.height.toString());
//     const ctx = canvas2.getContext('2d');

//     const img = new Image();
//     img.onload = () => {
//         ctx.drawImage(img, 0, 0, canvas2.width, canvas2.height);
//         // read new canvas data
//         newCTXData = ctx.getImageData(0, 0, canvas2.width, canvas2.height).data;
//         removeAlpha(newCTXData);
//         mapPixelIndex();
//         gifGenerator.generateFrame(indexedPixels);
//         reset();
//         processBlobs();
//     }
//     img.src = blobURL
// }