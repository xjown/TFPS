import type {
  Scene as SceneType,
  Clock as ClockType,
  WebGLRenderer as WebGLRendererType,
  PerspectiveCamera as PerspectiveCameraType,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import ProxyObj from './ProxyObj';

export default class Core {
  scene: SceneType;
  clock: ClockType;
  renderer: WebGLRendererType;
  camera: PerspectiveCameraType;
  private _proxy: ProxyObj;
  orbit_controls: OrbitControls;

  private static _instance: Core;
  constructor() {
    this.scene = new Scene();
    this.clock = new Clock();
    this.renderer = new WebGLRenderer();
    this.camera = new PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this._proxy = new ProxyObj(this);
    this.orbit_controls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.orbit_controls.dampingFactor = 0.2;
    this.orbit_controls.enableDamping = true;

    this.camera.position.set(0, 0, 2);

    this._init();
  }

  private _init() {
    const app: HTMLElement = document.getElementById('app')!;

    window.addEventListener('resize', () => {
      this._RenderRespect();
    });
    app.appendChild(this.renderer.domElement);
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this._RenderRespect();
    this.update();
  }

  private _RenderRespect() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.camera.updateProjectionMatrix();
  }

  private update() {
    this.renderer.setAnimationLoop(() => {
      this.renderer.render(this.scene, this.camera);
      this._proxy.update(this.clock.getDelta());
      this.orbit_controls.update();
    });
  }

  public static getStance(): Core {
    if (this._instance) {
      return this._instance;
    }
    return new Core();
  }
}
