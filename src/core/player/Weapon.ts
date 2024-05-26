import Loader from '../loader';
import Events from '../events';
import { Audio } from 'three';
import {
  GUN_HAND,
  GUN_FLASH,
  GUN_SOUND,
  ACTION_EVENT_NAME,
  KEY_CODE,
} from '@/configs';

import type { Object3D } from 'three';
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

  constructor(instance: Core) {
    super();
    this._instance = instance;
    this._sound = new Audio(instance.listen);
  }

  async load() {
    const { scene: ak_scene } = await this.loadGLTF(GUN_HAND);
    const { scene: flash_scene } = await this.loadGLTF(GUN_FLASH);
    const sound = await this.loadAudio(GUN_SOUND);
    ak_scene.scale.set(0.05, 0.05, 0.05);
    ak_scene.position.set(0.04, -0.03, 0);
    ak_scene.setRotationFromEuler(
      new Euler(MathUtils.degToRad(5), MathUtils.degToRad(185), 0)
    );

    ak_scene.visible = false;
    flash_scene.visible = false;

    this._sound.setBuffer(sound);

    this._ak_scene = ak_scene;
    this._ak_flash_scene = flash_scene;

    return { ak_scene, flash_scene };
  }

  initialize() {
    this._instance.camera.add(this._ak_scene);
    this._instance.camera.add(this._ak_flash_scene);
  }

  switchState(state: boolean) {
    this._ak_scene.visible = state;
  }

  update(time: number) {
    if (
      (this._actionEvent.downDowning.KeyW ||
        this._actionEvent.downDowning.KeyS ||
        this._actionEvent.downDowning.KeyA ||
        this._actionEvent.downDowning.KeyD) &&
      this._ak_scene.visible
    ) {
      const ps = this._ak_scene.position.z;
      this._ak_scene.position.setZ(
        0.01 * Math.sin(((this._step + 0) / 2) * Math.PI) - 0.01
      );
      console.log(ps);
      this._step += 0.08;
    }
  }
}
