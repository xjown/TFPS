import { UI_EVENT_NAME, ACTION_EVENT_NAME } from '@/configs';
import ActionEvent from './action';
import UIEvents from './ui';

import type { EventDispatcher } from 'three';

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
    this._registerEvents(new ActionEvent(), ACTION_EVENT_NAME);
    this._registerEvents(new UIEvents(), UI_EVENT_NAME);
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
