import Events from '../events';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { UI_EVENT_NAME, LOAD_PROCESS } from '@/configs';

import type UIEvent from '../events/ui';

export default class Loader {
  private _event: UIEvent = Events.getStance().getEvent(UI_EVENT_NAME);
  private _gltfHandle: GLTFLoader;
  private _fbxhandle: FBXLoader;
  constructor() {
    this._loadOnprogress();
    this._fbxhandle = new FBXLoader();
    this._gltfHandle = new GLTFLoader();
  }

  async loadGLTF(url: string) {
    return new Promise((resolve, reject) => {
      this._gltfHandle.load(url, (res) => {
        resolve(res);
      });
    });
  }

  async loadFBX(url: string) {
    return new Promise((resolve, reject) => {
      this._fbxhandle.load(url, (res) => {
        resolve(res);
      });
    });
  }

  getManage() {
    return this._manager;
  }

  private _loadOnprogress() {
    const that: Loader = this;
    let loadName: string = '';
    DefaultLoadingManager.onStart = (url, loaded: number, total: number) => {
      loadName = url;
    };
    DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      that._event.dispatchEvent({
        type: LOAD_PROCESS,
        message: { url: loadName, itemsLoaded, itemsTotal },
      });
    };
  }
}
