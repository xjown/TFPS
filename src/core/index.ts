import type {
  Scene as SceneType,
  Clock as ClockType,
  WebGLRenderer as WebGLRendererType,
  Camera as CameraType,
} from 'three';

export default class Core {
  scene: SceneType;
  clock: ClockType;
  renderer: WebGLRendererType;
  camera: CameraType;

  private static instance: Core;
  constructor() {
    this.scene = new Scene();
    this.clock = new Clock();
    this.renderer = new WebGLRenderer();
    this.camera = new Camera();

    this._init();
    this._initRender();
    this._render();
  }

  private _init() {
    window.addEventListener('resize', () => {
      this._initRender();
    });
  }

  private _initRender() {
    const app: HTMLElement = document.getElementById('app')!;
    app.appendChild(this.renderer.domElement);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private _render() {
    this.renderer.setAnimationLoop(() => {
      this.renderer.render(this.scene, this.camera);
    });
  }

  public static getStance(): Core {
    if (this.instance) {
      return this.instance;
    }
    return new Core();
  }
}
