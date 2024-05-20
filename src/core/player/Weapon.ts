import Loader from '../loader';
import { Audio } from 'three';
import { GUN_HAND, GUN_FLASH, GUN_SOUND, KEY_CODE } from '@/configs';

import type Core from '../index';
import type ActionEvent from '../events/action';

export default class Weapon extends Loader {
  public name: string = 'Weapon';

  private _sound: Audio;
  private _actionEvent: ActionEvent;

  constructor(instance: Core, event: ActionEvent) {
    super();
    this._sound = new Audio(instance.listen);
    this._actionEvent = event;

    this._setupEvents();
  }

  async load() {
    const { scene: ak_scene } = await this.loadGLTF(GUN_HAND);
    const { scene: flash_scene } = await this.loadGLTF(GUN_FLASH);
    const sound = await this.loadAudio(GUN_SOUND);
    ak_scene.position.set(0, 5, 0);
    ak_scene.scale.set(0.4, 0.4, 0.4);

    ak_scene.visible = false;
    flash_scene.visible = false;

    this._sound.setBuffer(sound);

    return { ak_scene, flash_scene };
  }

  _setupEvents() {
    this._actionEvent.addEventListener(KEY_CODE, ({ message }) => {
      const { code, event } = message;
      if (event && event.repeat) return;
      switch (code) {
        case 'KeyF':
          console.log(11);
          break;
      }
    });
  }
}
