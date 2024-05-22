import Loader from '../loader';
import { Audio, Object3D } from 'three';
import { GUN_HAND, GUN_FLASH, GUN_SOUND } from '@/configs';

import type Core from '../index';

export default class Weapon extends Loader {
  public name: string = 'Weapon';

  private _sound: Audio;
  private _ak_scene!: Object3D;
  private _ak_flash_scene!: Object3D;
  private _instance: Core;

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
    ak_scene.position.set(0.04, -0.02, 0.0);
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
}
