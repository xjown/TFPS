import type {
  Scene as SceneType,
  Clock as ClockType,
  WebGLRenderer as WebGLRendererType,
  PerspectiveCamera as PerspectiveCameraType,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Events from './events';

import ProxyObj from './ProxyObj';

export default class Core {
  scene: SceneType;
  clock: ClockType;
  renderer: WebGLRendererType;
  camera: PerspectiveCameraType;
  private _proxy: ProxyObj;
  // spatial_controls: SpatialControls;
  orbit_controls: OrbitControls;
  events: Events;

  private static _instance: Core;
  constructor() {
    this.scene = new Scene();
    this.clock = new Clock();
    this.renderer = new WebGLRenderer();
    this.camera = new PerspectiveCamera();
    this.events = new Events();
    this.orbit_controls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this._proxy = new ProxyObj(this);

    this._init();

    // this.spatial_controls = new SpatialControls(
    //   this.camera.position,
    //   this.camera.quaternion,
    //   this.renderer.domElement
    // );
    // const settings = this.spatial_controls.settings;
    // settings.general.mode = ControlMode.THIRD_PERSON;
    // settings.pointer.behaviour = PointerBehaviour.DEFAULT;
    // settings.rotation.sensitivity = 2.2;
    // settings.rotation.damping = 0.13;
    // settings.rotation.minPolarAngle = Number.NEGATIVE_INFINITY;
    // settings.rotation.maxPolarAngle = Number.POSITIVE_INFINITY;
    // settings.translation.enabled = false;
    // settings.translation.sensitivity = 1;
    // settings.translation.damping = 0.1;
    // settings.zoom.enabled = false;
    // settings.zoom.sensitivity = 0.1;
    // settings.zoom.damping = 0.15;
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
    requestAnimationFrame((time) => {
      this.renderer.render(this.scene, this.camera);
      this._proxy.update(this.clock.getDelta());
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
