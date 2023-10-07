# Shadify
A library for adding a shader wallpaper to the background of your website.
You can find a live example [here](https://danielfvm.github.io/WebShaderWallpaper/example/) and you can find the code at `example/`

![untitled](https://github.com/danielfvm/WebShaderWallpaper/assets/23420640/bee4a957-7d08-4db6-849c-7e7ff3bdd1d8)


## Usage
Download the latest release and include it into your project.
```html
<script type="text/javascript" src="./WebShaderWallpaper.js"></script>
```

To add a shader to the background or any other div add `data-shader` with a link to a [glslsandbox.com](https://glslsandbox.com/) shader or to your own shader source file.
```html
<body data-shader="https://glslsandbox.com/e#106611.0">
...
</body>
```

Additionally you can set `data-shader-speed` (1.0 default) and `data-shader-quality` (2.0 default) settings. Here an example with the same shader
but at twice the speed and a quarter the quality. 
```html
<div data-shader="https://glslsandbox.com/e#106611.0" data-shader-speed="2.0" data-shader-quality="4.0">
....
</div>
```

## Features
* Shaders can directly be loaded from [glslsandbox.com](https://glslsandbox.com/)
* Support for setting shader quality and speed
* Supports mouse input
* Attributes can be changed using JavaScript at runtime

## Planned
* Add support for custom uniform values that can be passed to the shaders
