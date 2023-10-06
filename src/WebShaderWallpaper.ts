export namespace WebShaderWallpaper {
  export interface Config {
    allowMouse: boolean;
    resolution: number;
    target: HTMLCanvasElement;
    speedFactor: number;
    fullscreen: boolean;
    autoUpdate: boolean;
  };

  const DefaultConfig: Config = {
    allowMouse: true,
    resolution: 2,
    speedFactor: 1,
    target: null,
    fullscreen: true,
    autoUpdate: true,
  }

  const vertShader = `
      attribute vec2 coords;
      void main(void) {
          gl_Position = vec4(coords.xy, 0.0, 1.0);
      }
  `;

  function createShader(gl: WebGLRenderingContext, sourceCode: string, type: number): WebGLShader {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      throw `Could not compile WebGL program. \n\n${info}`;
    }
    return shader;
  }

  export class Wallpaper {
    private gl: WebGLRenderingContext;
    private canvas: HTMLCanvasElement;
    private config: Config;

    private uniformResolution: WebGLUniformLocation;
    private uniformTime: WebGLUniformLocation;
    private uniformMouse: WebGLUniformLocation;

    private pid: WebGLProgram;
    private vert: WebGLShader;
    private frag: WebGLShader;

    private mouseX: number;
    private mouseY: number;

    private running = true;

    private eventHandlerResize = this.resize.bind(this);
    private eventHandlerMouse = this.mouse.bind(this);

    constructor(fragShader: string, config: Config = DefaultConfig) {
      this.config = config;
      this.config.allowMouse ??= DefaultConfig.allowMouse;
      this.config.autoUpdate ??= DefaultConfig.autoUpdate;
      this.config.fullscreen ??= DefaultConfig.fullscreen;
      this.config.speedFactor ??= DefaultConfig.speedFactor;
      this.config.target ??= DefaultConfig.target;
      this.config.resolution ??= DefaultConfig.resolution;

      // Get gl context from canvas
      if (config?.target) {
        if (this.canvas.tagName !== "canvas") {
          throw new Error("Target canvas is not a canvas element");
        }
        this.canvas = config.target;
      } else {
        this.canvas = document.createElement("canvas");
        document.body.appendChild(this.canvas);
      }

      if (this.config.fullscreen) {
        this.canvas.style.position = "fixed";
        this.canvas.style.left = "0%";
        this.canvas.style.right = "0%";
        this.canvas.style.top = "0%";
        this.canvas.style.bottom = "0%";
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.canvas.style.zIndex = "-1";
      }

      this.resize();

      this.gl = (this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl")) as WebGLRenderingContext;

      // Create shader program
      this.pid = this.gl.createProgram();

      // Compile vertex shader
      this.vert = createShader(this.gl, vertShader, this.gl.VERTEX_SHADER);
      this.gl.attachShader(this.pid, this.vert);

      // Compile fragment shader
      this.frag = createShader(this.gl, fragShader, this.gl.FRAGMENT_SHADER);
      this.gl.attachShader(this.pid, this.frag);
      this.gl.linkProgram(this.pid);
      this.gl.useProgram(this.pid);

      // Create buffer
      let array = new Float32Array([-1, 3, -1, -1, 3, -1]);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer());
      this.gl.bufferData(this.gl.ARRAY_BUFFER, array, this.gl.STATIC_DRAW);

      let al = this.gl.getAttribLocation(this.pid, "coords");
      this.gl.vertexAttribPointer(al, 2, this.gl.FLOAT, false, 0, 0);
      this.gl.enableVertexAttribArray(al);

      // Read uniforms
      this.uniformResolution = this.gl.getUniformLocation(this.pid, "resolution");
      this.uniformTime = this.gl.getUniformLocation(this.pid, "time");
      this.uniformMouse = this.gl.getUniformLocation(this.pid, "mouse");

      window.addEventListener("resize", this.eventHandlerResize);
      window.addEventListener("mousemove", this.eventHandlerMouse);

      const refresh = () => {
        this.update();
        if (this.running)
          requestAnimationFrame(refresh);
      };

      if (this.config.autoUpdate) {
        refresh();
      }
    }

    private resize() {
      if (this.config.fullscreen) {
        this.canvas.width = window.innerWidth / this.config.resolution;
        this.canvas.height = window.innerHeight / this.config.resolution;
      }
    }

    private mouse(e: MouseEvent) {
      if (!this.config.allowMouse) {
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        return;
      }

      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    }

    public update() {
      const {width, height} = this.canvas;

      this.gl.uniform2f(this.uniformMouse, this.mouseX / width / this.config.resolution, 1 - this.mouseY / height / this.config.resolution);
      this.gl.uniform2f(this.uniformResolution, width, height);
      this.gl.uniform1f(this.uniformTime, performance.now() / 1000 * this.config.speedFactor);

      this.gl.viewport(0, 0, width, height);
      this.gl.clearColor(0, 0, 0, 0);
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
    }

    destroy() {
      this.gl.deleteProgram(this.pid);
      this.gl.deleteShader(this.vert);
      this.gl.deleteShader(this.frag);

      this.running = false;

      window.removeEventListener("resize", this.eventHandlerResize);
      window.removeEventListener("mousemove", this.eventHandlerMouse);
    }
  }
}
