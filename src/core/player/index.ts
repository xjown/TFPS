import Core from '../index';

export default class Player {
  private _instance: Core;

  constructor(instance: Core) {
    this._instance = instance;
  }

  update(time) {}
}
