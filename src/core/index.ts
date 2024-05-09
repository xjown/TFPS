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
import { AmmoHelper, Ammo } from './ammo';

import EntityCollection from './EntityCollection';
import Entity from './Entity';

import { PlayPhysics } from '@/core/player';

export default class Core {
  scene: SceneType;
  clock: ClockType;
  renderer: WebGLRendererType;
  camera: PerspectiveCameraType;
  orbit_controls: OrbitControls;
  collision: Collision;
  world: World;
  physicsWorld!: Ammo.btDiscreteDynamicsWorld;
  ui: UI;
  entityCollection!: EntityCollection;

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
    AmmoHelper.init(() => this._init());
  }

  private _init() {
    this._setupPhysics();
    this._setupGraphic();
    this._entitySetup();
    this.update();
  }

  private _entitySetup() {
    this.entityCollection = new EntityCollection();

    // player
    const playerEntity = new Entity('player');
    playerEntity.addComponent(new PlayPhysics());

    this.entityCollection.addEntity(playerEntity);
  }

  private _setupGraphic() {
    const app: HTMLElement = document.getElementById('app')!;

    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.camera.position.set(0, 0, 1);
    this.orbit_controls.dampingFactor = 0.2;
    this.orbit_controls.enableZoom = false;
    this.orbit_controls.enablePan = false;

    this._RenderRespect();
    window.addEventListener('resize', () => {
      this._RenderRespect();
    });

    app.appendChild(this.renderer.domElement);
  }

  private _setupPhysics() {
    // 碰撞配置
    const collisionDefaultConfig = new Ammo.btDefaultCollisionConfiguration();
    // 根据碰撞配置（btCollisionConfiguration）分派碰撞请求给适当的碰撞算法
    const dispatch = new Ammo.btCollisionDispatcher(collisionDefaultConfig);
    // 宽阶段碰撞检测
    const overlappingPairCache = new Ammo.btDbvtBroadphase();
    // 约束求解器类。
    // 基于连续脉冲（Sequential Impulses）的方法来解决刚体间的接触约束和关节约束，以确保物理模拟的稳定性并正确处理碰撞响应。
    const solver = new Ammo.btSequentialImpulseConstraintSolver();
    this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(
      dispatch,
      overlappingPairCache,
      solver,
      collisionDefaultConfig
    );

    // 设置重力
    this.physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
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
      this.entityCollection.update(Math.min(0.03, this.clock.getDelta()));
      this.world.update(Math.min(0.03, this.clock.getDelta()));
      this.orbit_controls.update();
      this.update();
    });
  }
}
