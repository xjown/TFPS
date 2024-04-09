import type Core from './index';

import Player from './player';

export default class ProxyObj {
  private _instance: Core;
  private _player: Player;
  num = 0;
  constructor(instance: Core) {
    this._instance = instance;
    this._player = new Player(this._instance);
  }

  update(time: number) {
    if (this._instance.world.isReady) {
      this._player.update(time);
      /**
       * TODO:直接调用会导致生成的边界值不准确
       */
      this.num += 1;
      if (this.num == 2) {
        this._instance.collision.calculateBound();
        this._instance.scene.add(this._instance.collision.collisionsHelper);
      }
    }
  }
}
