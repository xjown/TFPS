import { BORDER_TEXTURE, UI_EVENT_NAME, STATIC_LOADED } from '@/configs';
import Character from '../character';
import Player from '../player';
import Loader from '../loader';
import Events from '../events';

import type Core from '../index';
import type { Mesh as MeshType } from 'three';
export default class World {
  private _instance: Core;
  private _isReady: boolean = false;
  gallery_boards: Record<string, MeshType> = {};
  private _num: number = 1;
  private _character: Character;
  private _player!: Player;
  private _loader: Loader;
  private _event = Events.getStance().getEvent(UI_EVENT_NAME);

  constructor(instance: Core) {
    this._instance = instance;
    this._character = new Character();
    this._loader = new Loader();
    this._init();
  }

  private async _init() {
    try {
      const scene = await this._loadScene();
      const model = await this._character.load(this._loader);
      this._instance.scene.add(model);
      this._instance.scene.add(scene);
      this._updateCharacterState();
      this._isReady = true;
      this._event.dispatchEvent({ type: STATIC_LOADED });
    } catch (e) {
      console.error('加载失败 ', e);
    }
  }

  private _updateCharacterState() {
    this._player = new Player(this._instance, this._character);
  }

  private async _loadScene() {
    const { scene } = await this._loader.loadGLTF(BORDER_TEXTURE);
    scene.traverse((item) => {
      if (item.name === 'home001' || item.name === 'PointLight') {
        item.castShadow = true;
      }
      if (item.name.includes('Light')) {
        item.intensity *= 1000;
      }
      if (item.name === 'home002') {
        item.castShadow = true;
        item.receiveShadow = true;
      }
      if (/gallery.*_board/.test(item.name) && 'isMesh' in item) {
        this.gallery_boards[item.name] = item;
      }
    });

    this._instance.collision.addGroup(scene);
    return scene;
  }

  getState() {
    return this._isReady;
  }

  update(time: number) {
    if (this.getState()) {
      this._player.update(time);
      /**
       * TODO:直接调用会导致生成的边界值不准确
       */
      this._num += 1;
      if (this._num == 2) {
        this._instance.collision.calculateBound();
        // this._instance.scene.add(this._instance.collision.collisionsHelper);
      }
    }
  }
}
