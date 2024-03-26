import type Core from './index';

import World from './world';

export default class ProxyObj {
  private _instance: Core;
  private _world: World;
  constructor(instance: Core) {
    this._instance = instance;
    this._world = new World(this._instance);
  }

  update(time: number) {
    this._world.update(time);
  }
}
