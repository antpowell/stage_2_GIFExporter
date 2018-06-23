// const snapshotBtn = document.getElementById('snapshotBtn');
// const recordBtn = document.getElementById('recordBtn') as HTMLButtonElement;
// const recStopBtn = document.getElementById('recStopBtn') as HTMLButtonElement;
// const downloadGIFBtn = document.getElementById('downloadGIFBtn') as HTMLButtonElement;
// const canvas: HTMLCanvasElement = document.getElementById('renderCanvas') as HTMLCanvasElement;


// recordBtn.addEventListener('click', () => {
    
//     /* Test start without options */
//     // new GIFExporter(canvas, {delay: 60, duration: 3000}).start()
//     //     .then(GIFURL => {
//     //         //Do something with encodedGIF number[] value
//     //         console.log('​encodeGIF', GIFURL);
//     //     });

//     /* Test start with no options */
//     // new GIFExporter(canvas).start()
//     //     .then(GIFURL => {
//     //         //Do something with encodedGIF number[] value
//     //         console.log('​encodeGIF', GIFURL);
//     //     });
    
//         /* Test download with no options */
//     new GIFExporter(canvas, {delay:20, duration:1000}).download();
    
        
// })

// /* var recorder = new GIFExporter(canvas, {
//     delay: 60, // Default 50
//     maxTime: 1000, // Default 5000
// })

// recordBtn.addEventListener('click', () => {
//     recorder.start().then(encodeAnimatedGIFObjectURL => {
//     //Do something with encodeAnimatedGIFObjectURL ObjectURL
//     console.log('encodeGIF', encodeAnimatedGIFObjectURL);
//     });

// recorder.onStitching((pngsObjectURLs, resolve, reject) => {
//     pngsObjectURLs.length -= 3;

//     resolve(pngsObjectURL);

//     reject("Canceled by user.");
// });

// stopBtn.addEventListener('click', () => {
//     recorder.stop()
// }); */

// /* recordBtn.addEventListener('click', () => {
//     recorder.start().then(encodeAnimatedGIFObjectURL => {
//     //Do something with encodeAnimatedGIFObjectURL ObjectURL
//     console.log('encodeGIF', encodeAnimatedGIFObjectURL);
//     })
//      */