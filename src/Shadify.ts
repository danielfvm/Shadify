export namespace Shadify {
  const vertShader = `
      attribute vec2 coords;
      void main(void) {
          gl_Position = vec4(coords.xy, 0.0, 1.0);
      }
  `;

  class Wallpaper {
    public gl: WebGLRenderingContext;
    public canvas: HTMLCanvasElement;

    private uniformResolution: WebGLUniformLocation;
    private uniformTime: WebGLUniformLocation;
    private uniformMouse: WebGLUniformLocation;

    private pid: WebGLProgram;
    private vert: WebGLShader;
    private frag: WebGLShader;

    private target: HTMLElement;

    private mouseX: number;
    private mouseY: number;

    private running = true;

    private eventHandlerResize = this.resize.bind(this);
    private eventHandlerMouse = this.mouse.bind(this);

    private _quality: number = 2;
    public speed: number = 1;

    constructor(fragShader: string, target: HTMLElement) {
      this.canvas = document.createElement("canvas");
      this.target = target;

      target.append(this.canvas);

      // Setting this in body would break the fullscreen look
      if (target !== document.body) {
        const style = getComputedStyle(target);
        const radius = style.borderRadius || 0;
        target.style.clipPath = `inset(0 0 0 0 round ${radius})`;
      }

      this.canvas.style.position = "fixed";
      this.canvas.style.left = "0%";
      this.canvas.style.right = "0%";
      this.canvas.style.top = "0%";
      this.canvas.style.bottom = "0%";
      this.canvas.style.width = "100%";
      this.canvas.style.height = "100%";
      this.canvas.style.zIndex = "-1";

      // Fetches the attributes and sets quality and speed if given
      this.updateAttributes();

      // Get gl context from canvas
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

      const observer = new MutationObserver((_) => {
        this.updateAttributes();
      });

      observer.observe(target, {
        subtree: false,
        childList: false,
        attributes: true,
        attributeFilter: ["data-shader", "data-shader-quality", "data-shader-speed"],
      });

      this.update();
    }

    private updateAttributes() {
      this.quality = Number(this.target.attributes.getNamedItem("data-shader-quality")?.value) || this.quality;
      this.speed = Number(this.target.attributes.getNamedItem("data-shader-speed")?.value) || this.speed;

      if (!this.target.attributes.getNamedItem("data-shader")?.value)
        this.destroy();
    }

    private resize() {
      this.canvas.width = window.innerWidth / this.quality;
      this.canvas.height = window.innerHeight / this.quality;
    }

    private mouse(e: MouseEvent) {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    }

    private update() {
      const { width, height } = this.canvas;

      if (!this.running)
        return;

      this.gl.uniform2f(this.uniformMouse, this.mouseX / width / this.quality, 1 - this.mouseY / height / this.quality);
      this.gl.uniform2f(this.uniformResolution, width, height);
      this.gl.uniform1f(this.uniformTime, performance.now() / 1000 * this.speed);

      this.gl.viewport(0, 0, width, height);
      this.gl.clearColor(0, 0, 0, 0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);

      requestAnimationFrame(this.update.bind(this));
    }

    /**
     * Returns a WebGLUniformLocation for the given name in the fragment shader.
     * @param {string} name
     * @returns {WebGLUniformLocation}
     */
    public getUniform(name: string): WebGLUniformLocation {
      return this.gl.getUniformLocation(this.pid, name);
    }

    /**
     * This function has to be called to clean up the WebGL context.
     * It is also called when the element is removed from the DOM.
     * @returns {void}
     */
    public destroy(): void {
      (this.target as any).shaderWallpaper = undefined;

      this.running = false;

      this.gl.deleteProgram(this.pid);
      this.gl.deleteShader(this.vert);
      this.gl.deleteShader(this.frag);
      this.canvas.remove();

      window.removeEventListener("resize", this.eventHandlerResize);
      window.removeEventListener("mousemove", this.eventHandlerMouse);
    }

    get quality(): number {
      return this._quality;
    }

    set quality(value: number) {
      this._quality = value;
      this.resize();
    }
  }

  /** 
   * Helper function for creating a WebGLShader in Wallpaper class
   * @param {WebGLRenderingContext} gl
   * @param {string} sourceCode
   * @param {number} type
   * @returns {WebGLShader}
   */
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

  /**
   * Fetches the shader code from the given URL.
   * If URL is from glslsandbox.com, it will fetch the code from the item page.
   * @param {string} url
   * @returns {Promise<string>}
   */
  async function getCodeFromURL(url: string): Promise<string> {
    // link to glslsandbox website is a special case
    if (url.includes("glslsandbox.com") && url.includes("/e#")) {
      url = url.replace("/e#", "/item/");
      const res = await fetch(url);
      const text = await res.json();

      if (typeof text.code === "undefined")
        throw new Error("Could not get shader code");

      return text.code;
    }

    // otherwise we expect a link to a source file and return the code
    const res = await fetch(url);
    return await res.text();
  }

  /**
   * Helper function for handling elements with the "data-shader" attribute.
   * @param {HTMLElement} target
   * @returns {void}
   */
  async function handleHTMLElement(target: HTMLElement): Promise<void> {
    if (target == null)
      return;

    const url = target.attributes.getNamedItem("data-shader")?.value;

    if (url == null)
      return;

    if ((target as any)?.shadify != null)
      (target as any).shadify.destroy();
    else
      (target as any).shadify = new Wallpaper(await getCodeFromURL(url), target);
  }

  /**
   * Initializes Shadify.
   * @returns {void}
   */
  function init(): void {
    const observer = new MutationObserver((mutationList) => {
      mutationList.forEach((mutation) => handleHTMLElement(mutation.target as HTMLElement));
    });

    observer.observe(document.body, {
      subtree: true,
      childList: false,
      attributeFilter: ["data-shader"]
    });

    // Handle elements with the "data-shader" attribute
    document.querySelectorAll('[data-shader]').forEach((e) => handleHTMLElement(e as HTMLElement));

    document.removeEventListener("DOMContentLoaded", init);
  }

  document.addEventListener("DOMContentLoaded", init);
}
