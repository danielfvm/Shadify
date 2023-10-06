# WebShaderWallpaper
A library for adding a shader wallpaper to the background of your website.
You can find a live example [here](https://danielfvm.github.io/WebShaderWallpaper/example/) and you can find the code at `example/`

![untitled](https://github.com/danielfvm/WebShaderWallpaper/assets/23420640/bee4a957-7d08-4db6-849c-7e7ff3bdd1d8)


## Usage
Download the latest release and include it into your project.
```html
<script type="text/javascript" src="./WebShaderWallpaper.js"></script>
```


The following code creates a new wallpaper that automaticly is set as the background (z-index: -1).
```js
const wallpaper = new WebShaderWallpaper.Wallpaper(fragShaderCode, options);
```
You can find example glsl shader programs at [glslsandbox.com](https://glslsandbox.com/) and [shadertoy.com](https://www.shadertoy.com/).
You can set the following options:
```
allowMouse: boolean        // Enable it for mouse support in shaders
resolution: number         // Default 2, Increase this number to reduce the size rendered
target: HTMLCanvasElement  // You can set your own canvas if it already exist
speedFactor: number        // Default 1, 
fullscreen: boolean        // If enabled will put the canvas in the background in fullscreen
autoUpdate: boolean        // Enable it to automaticly update the screen, otherwise call wallpaper.update yourself
```
