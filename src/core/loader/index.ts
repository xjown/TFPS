import Events from '../events';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { UI_EVENT_NAME } from '@/configs';

import type { LoadingManager as LoadingManagerType } from 'three';
import type UIEvent from '../events/ui';

export default class Loader {
  private _manager: LoadingManagerType;
  private _event: UIEvent = Events.getStance().getEvent(UI_EVENT_NAME);
  constructor() {
    this._manager = new LoadingManager();
    this._loadOnprogress();
  }

  async loadGLTF(url: string) {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader(this._manager);
      loader.load(url, (res) => {
        resolve(res);
      });
    });
  }

  async loadFBX(url: string) {
    return new Promise((resolve, reject) => {
      const loader = new FBXLoader(this._manager);
      loader.load(url, (res) => {
        resolve(res);
      });
    });
  }

  getManage() {
    return this._manager;
  }

  private _loadOnprogress() {
    const that: Loader = this;
    this._manager.onProgress = function (url, itemsLoaded, itemsTotal) {
      that._event.dispatchEvent({
        type: 'load',
        message: { url, itemsLoaded, itemsTotal },
      });
    };
  }
}
