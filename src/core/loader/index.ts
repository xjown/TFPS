import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

import type { LoadingManager as LoadingManagerType } from 'three';

export default class Loader {
  private _manager: LoadingManagerType;
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
    this._manager.onProgress = function (url, itemsLoaded, itemsTotal) {
      console.log(`进度:${url}${(itemsLoaded / itemsTotal) * 100}%`);
    };
    // this._manager.onStart = function (url, itemsLoaded, itemsTotal) {
    //   console.log(`开始加载: ${url}`);
    // };
  }
}
