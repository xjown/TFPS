import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { AudioListener } from 'three';

import Events from './events';
import { STATIC_LOADED, UI_EVENT_NAME } from '@/configs';

import { AmmoHelper, Ammo } from './ammo';

import EntityCollection from './EntityCollection';
import Entity from './Entity';

// Entity
import { PlayPhysics, PlayControl } from '@/core/player';
import { World, WorldPhysics } from './world';
import UI from './ui';

import type {
  Scene as SceneType,
  Clock as ClockType,
  WebGLRenderer as WebGLRendererType,
  PerspectiveCamera as PerspectiveCameraType,
} from 'three';
import type UIEvents from '@/core/events/UIEvents';

export default class Core {
  scene: SceneType;
  clock: ClockType;
  renderer: WebGLRendererType;
  camera: PerspectiveCameraType;
  physicsWorld!: Ammo.btDiscreteDynamicsWorld;
  entityCollection!: EntityCollection;
  listen: AudioListener;

  constructor() {
    this.scene = new Scene();
    this.clock = new Clock();
    this.renderer = new WebGLRenderer();
    this.camera = new PerspectiveCamera();
    this.listen = new AudioListener();

    AmmoHelper.init(() => this._init());
  }

  private _init() {
    this._setupEvents();
    this._setupPhysics();
    this._setupGraphic();
    this._setupEntity();
  }

  _setupEvents() {
    Events.getStance().init();
  }

  private async _setupEntity() {
    const assets: Entity[] = [];
    this.entityCollection = new EntityCollection();

    // ui
    const uiEntity = new Entity('ui');
    uiEntity.addComponent(new UI());

    // player
    const playerEntity = new Entity('player');
    playerEntity.addComponent(new PlayPhysics(this.physicsWorld));
    playerEntity.addComponent(new PlayControl(this));
    assets.push(playerEntity);

    // world
    const worldEntity = new Entity('world');
    worldEntity.addComponent(new WorldPhysics(this.physicsWorld));
    worldEntity.addComponent(new World(this));
    assets.push(worldEntity);

    this.entityCollection.addEntity(playerEntity);
    this.entityCollection.addEntity(uiEntity);
    this.entityCollection.addEntity(worldEntity);

    await this._loadAssets(assets);

    this.scene.add(this.camera);
    this.entityCollection.entitySetup();
    this.update();
  }

  _loadAssets(assets: Entity[]) {
    let count: number = 0;
    let process: number = 0;
    const ui: UIEvents = Events.getStance().getEvent(UI_EVENT_NAME);
    return new Promise((solver, reject) => {
      for (let item of assets) {
        item.load()?.then(() => {
          count += 1;
          process = (count / assets.length) * 100;
          if (process >= 100) {
            solver(true);
          }
        });
      }
    });
  }

  private _setupGraphic() {
    const app: HTMLElement = document.getElementById('app')!;

    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.outputColorSpace = SRGBColorSpace;

    this.camera.position.set(0, 0, 0);
    this.camera.add(this.listen);

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
    this.physicsWorld.setGravity(new Ammo.btVector3(0, -9.8, 0));

    this.physicsWorld.setInternalTickCallback(
      Ammo.addFunction(this._physicsUpdate.bind(this))
    );

    //  设置幽灵对象碰撞检测
    this.physicsWorld
      .getBroadphase()
      .getOverlappingPairCache()
      .setInternalGhostPairCallback(new Ammo.btGhostPairCallback());
  }

  private _RenderRespect() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.camera.updateProjectionMatrix();
  }

  private _physicsUpdate(world: Ammo.btDynamicsWorld, timeStep: number) {
    this.entityCollection.physicsUpdate(world, timeStep);
  }

  private update() {
    window.requestAnimationFrame(() => {
      const time = Math.min(1.0 / 60.0, this.clock.getDelta());

      this.physicsWorld.stepSimulation(time, 10);

      this.entityCollection.update(time);

      this.renderer.render(this.scene, this.camera);

      this.update();
    });
  }
}
