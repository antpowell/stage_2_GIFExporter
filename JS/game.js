var Game = /** @class */ (function () {
    function Game(canvasElement) {
        this._canvas = document.getElementById(canvasElement);
        this._engine = new BABYLON.Engine(this._canvas, true, {
            preserveDrawingBuffer: true
        });
        this._gifExporter = new GIFExporter3(this._engine, {
            delay: 60,
            duration: 1000
        });
    }
    Game.prototype.createScene = function () {
        // Create a basic BJS Scene object.
        this._scene = new BABYLON.Scene(this._engine);
        // Create a FreeCamera, and set its position to (x:0, y:5, z:-10).
        this._camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), this._scene);
        // Target the camera to scene origin.
        this._camera.setTarget(BABYLON.Vector3.Zero());
        // Attach the camera to the canvas.
        this._camera.attachControl(this._canvas, false);
        // Create a basic light, aiming 0,1,0 - meaning, to the sky.
        this._light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), this._scene);
        // Create a built-in "sphere" shape; with 16 segments and diameter of 2.
        var sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {
            segments: 16,
            diameter: 2
        }, this._scene);
        // Move the sphere upward 1/2 of its height.
        sphere.position.y = 1;
        // Create a built-in "ground" shape.
        var ground = BABYLON.MeshBuilder.CreateGround('ground', {
            width: 6,
            height: 6,
            subdivisions: 2
        }, this._scene);
    };
    Game.prototype.doRender = function () {
        var _this = this;
        // Run the render loop.
        this._engine.runRenderLoop(function () {
            _this._scene.render();
        });
        // The canvas/window resize event handler.
        window.addEventListener('resize', function () {
            _this._engine.resize();
        });
    };
    Game.prototype.downloadGIF = function () {
        this._gifExporter.download();
    };
    Game.prototype.stopGIF = function () {
        this._gifExporter.start();
    };
    return Game;
}());
window.addEventListener('DOMContentLoaded', function () {
    var recordBtn = document.getElementById('recordBtn');
    var stopBtn = document.getElementById('recStopBtn');
    // Setup GIF generator
    // Create the game using the 'renderCanvas'.
    var game = new Game('renderCanvas');
    // Create the scene.
    game.createScene();
    // Start render loop.
    game.doRender();
    recordBtn.addEventListener('click', function () {
        game.downloadGIF();
    });
    stopBtn.addEventListener('click', function () {
        game.stopGIF();
    });
});
//# sourceMappingURL=game.js.map