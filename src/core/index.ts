import type {
  Scene as SceneType,
  Clock as ClockType,
  WebGLRenderer as WebGLRendererType,
  PerspectiveCamera as PerspectiveCameraType,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Events from './events';
import Collision from './collision';
import World from './world';
import UI from './ui';

export default class Core {
  scene: SceneType;
  clock: ClockType;
  renderer: WebGLRendererType;
  camera: PerspectiveCameraType;
  orbit_controls: OrbitControls;
  collision: Collision;
  world: World;
  ui: UI;

  private static _instance: Core;
  constructor() {
    this.scene = new Scene();
    this.clock = new Clock();
    this.renderer = new WebGLRenderer();
    this.camera = new PerspectiveCamera();
    this.orbit_controls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    Events.getStance().init();
    this.collision = new Collision();
    this.world = new World(this);
    this.ui = new UI();

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
    this.camera.position.set(0, 0, 1);
    this.orbit_controls.dampingFactor = 0.2;
    this.orbit_controls.enableZoom = false;
    this.orbit_controls.enablePan = false;
  }

  private _RenderRespect() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.camera.updateProjectionMatrix();
  }

  private update() {
    requestAnimationFrame((time) => {
      this.renderer.render(this.scene, this.camera);
      this.world.update(Math.min(0.03, this.clock.getDelta()));
      this.orbit_controls.update();
      this.update();
    });
  }

  public static getStance(): Core {
    if (this._instance) {
      return this._instance;
    }
    return new Core();
  }
}
