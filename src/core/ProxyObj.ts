import type Core from './index';

import World from './world';
import Player from './player';

export default class ProxyObj {
  private _instance: Core;
  private _world: World;
  private _player: Player;
  constructor(instance: Core) {
    this._instance = instance;
    this._world = new World(this._instance);
    this._player = new Player(this._instance);
  }

  update(time: number) {
    this._world.update(time);
    this._player.update(time);
  }
}
