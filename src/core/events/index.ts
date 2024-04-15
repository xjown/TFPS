import type { EventDispatcher } from 'three';
import ActionEvent from './action';
import UIEvents from './ui';
export default class Events {
  private static _instance: Events;
  private _events: { [key: string]: EventDispatcher } = {};

  public static getStance(): Events {
    if (Events._instance) {
      return Events._instance;
    } else {
      Events._instance = new Events();
    }
    return Events._instance;
  }

  init() {
    this._registerEvents(new ActionEvent(), 'ActionEvent');
    this._registerEvents(new UIEvents(), 'UIEvents');
  }

  private _registerEvents(event: EventDispatcher, name: string) {
    if (this._events[name]) {
      return;
    }
    this._events[name] = event;
  }

  getEvent(name: string) {
    return this._events[name];
  }
}
