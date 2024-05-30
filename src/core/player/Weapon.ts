import Loader from '../loader';
import Events from '../events';
import { Audio } from 'three';
import { AmmoHelper, Ammo } from '../ammo';
import {
  GUN_HAND,
  GUN_FLASH,
  GUN_SOUND,
  ACTION_EVENT_NAME,
  MOUSE_IS_DOWN,
  DECAL_A,
  DECAL_C,
} from '@/configs';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry';

import type { RayCastResultType } from '../ammo';
import type { Object3D, Mesh as MeshType } from 'three';
import type ActionEvent from '../events/ActionEvent';
import type Core from '../index';

export default class Weapon extends Loader {
  public name: string = 'Weapon';

  private _sound: Audio;
  private _ak_scene!: Object3D;
  private _ak_flash_scene!: Object3D;
  private _instance: Core;
  private _actionEvent: ActionEvent = Events.getStance().getEvent(
    ACTION_EVENT_NAME
  ) as ActionEvent;
  private _step: number = 0.5;
  private _mouseDown: boolean = false;
  private _lastTime: number = new Date().getTime();
  private _shootTime: number = new Date().getTime();
  private _decalQueue: { mesh: MeshType; time: number }[] = [];
  private _decal = new MeshBasicMaterial({
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: 1,
    transparent: true,
    depthTest: true,
    depthWrite: false,
  });

  constructor(instance: Core) {
    super();
    this._instance = instance;
    this._sound = new Audio(instance.listen);
    this._setupEvents();
  }

  async load() {
    const { scene: ak_scene } = await this.loadGLTF(GUN_HAND);
    const { scene: flash_scene } = await this.loadGLTF(GUN_FLASH);
    const sound = await this.loadAudio(GUN_SOUND);
    const decal_a = await this.loadTexture(DECAL_A);
    const decal_c = await this.loadTexture(DECAL_C);

    this._decal.alphaMap = decal_a;
    this._decal.map = decal_c;

    ak_scene.scale.set(0.05, 0.05, 0.05);
    ak_scene.position.set(0.04, -0.03, 0);
    ak_scene.setRotationFromEuler(
      new Euler(MathUtils.degToRad(5), MathUtils.degToRad(185), 0)
    );

    ak_scene.visible = false;
    flash_scene.visible = false;

    this._sound.setBuffer(sound);
    this._sound.offset = 0.2;

    this._ak_scene = ak_scene;
    this._ak_flash_scene = flash_scene;

    return { ak_scene, flash_scene };
  }

  initialize() {
    this._instance.camera.add(this._ak_scene);
    this._instance.camera.add(this._ak_flash_scene);
  }

  _setupEvents() {
    const event = Events.getStance().getEvent(ACTION_EVENT_NAME) as ActionEvent;
    event.addEventListener(MOUSE_IS_DOWN, ({ message }) => {
      if (message.event.buttons == 1 && message.isDown) {
        this._mouseDown = message.isDown;
      } else {
        this._mouseDown = false;
      }
    });
  }

  switchState(state: boolean) {
    this._ak_scene.visible = state;
  }

  private _Raycast() {
    const start = new Vector3(0, 0, -1.0).unproject(this._instance.camera);
    const to = new Vector3(0, 0, 1.0).unproject(this._instance.camera);
    const result: RayCastResultType = {
      intersectionPoint: new Vector3(),
      intersectionNormal: new Vector3(),
    };

    if (
      AmmoHelper.rayCast(
        start,
        to,
        this._instance.physicsWorld,
        result,
        ~AmmoHelper.collisionFilterGroup.SensorTrigger
      )
    ) {
      const rigid = Ammo.castObject<typeof Ammo.btRigidBody>(
        result.collisionObject,
        Ammo.btRigidBody
      );
      if ('mesh' in rigid && (rigid as any).mesh) {
        const mat4 = new Matrix4().lookAt(
          new Vector3(0, 0, 0),
          result.intersectionNormal,
          new Vector3(0, 1, 0)
        );
        const rot = new Euler().setFromRotationMatrix(mat4);
        const size = Math.random() * 0.4 + 0.2;
        const m = new Mesh(
          new DecalGeometry(
            // @ts-ignore
            rigid.mesh,
            result.intersectionPoint,
            rot,
            new Vector3(size, size, size)
          ),
          this._decal
        );
        this._decalQueue.push({
          time: new Date().getTime(),
          mesh: m,
        });
        this._instance.scene.add(m);
      }
    }
  }

  update(time: number) {
    if (!this._ak_scene.visible) return;
    this._lastTime = new Date().getTime();
    if (
      this._actionEvent.downDowning.KeyW ||
      this._actionEvent.downDowning.KeyS ||
      this._actionEvent.downDowning.KeyA ||
      this._actionEvent.downDowning.KeyD
    ) {
      this._ak_scene.position.setZ(
        0.01 * Math.sin((this._step / 2) * Math.PI) - 0.01
      );
      this._step += 0.08;
    }
    if (this._mouseDown && this._lastTime - this._shootTime > 150) {
      this._sound.isPlaying && this._sound.stop();
      this._sound.play();
      this._Raycast();
      this._shootTime = this._lastTime;
    }

    for (let item of this._decalQueue) {
      if (new Date().getTime() - item.time > 1000 * 2) {
        this._decalQueue.splice(this._decalQueue.indexOf(item), 1);
        this._instance.scene.remove(item.mesh);
      }
    }
  }
}
