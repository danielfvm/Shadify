# Shadify
![Repository size](https://img.shields.io/github/repo-size/ItsKaedeV/Shadify?color=39d45f) 
[![GitHub last commit](https://img.shields.io/github/last-commit/ItsKaedeV/Shadify?color=39d45f)](https://github.com/ItsKaedeV/Shadify/commits/master) 
![License](https://img.shields.io/badge/license-MIT-39d45f) 
[![Stargazers](https://img.shields.io/github/stars/ItsKaedeV/Shadify?color=39d45f&logo=github)](https://github.com/ItsKaedeV/Shadify/stargazers)

A library for adding a shader wallpaper to the background of your website or any of your divs.
You can find a live example [here](https://ItsKaedeV.github.io/Shadify/example/) and you can find the code in the `example/` folder.

![untitled](https://github.com/ItsKaedeV/Shadify/assets/23420640/bee4a957-7d08-4db6-849c-7e7ff3bdd1d8)


## Usage
Include shadify in your project.
```html
<script type="text/javascript" src="https://unpkg.com/shadify@1.0.1/lib/Shadify.js"></script>
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
* Access the shader uniforms using `myDiv.shadify.getUniform(name)`

## Planned
* Support links from `shadertoy.com`
* Improved README.md
* Documentation
* Reuse same shaders

## Build library
Run following commands to build this library yourself. You will find the output at `dist/`.
```bash
git clone https://github.com/ItsKaedeV/Shadify.git
cd Shadify
npm install
npm run build
```
