import Events from '../events';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { TextureLoader } from 'three';
import { UI_EVENT_NAME, LOAD_PROCESS } from '@/configs';

import type UIEvent from '../events/UIEvents';
import type { Object3D } from 'three';

export default class Loader {
  private _event: UIEvent = Events.getStance().getEvent(UI_EVENT_NAME);
  private _gltfHandle: GLTFLoader;
  private _fbxhandle: FBXLoader;
  private _textureHandle: TextureLoader;
  private _audioHandle: AudioLoader;
  constructor() {
    this._loadOnprogress();
    this._fbxhandle = new FBXLoader();
    this._gltfHandle = new GLTFLoader();
    this._textureHandle = new TextureLoader();
    this._audioHandle = new AudioLoader();
  }

  async loadGLTF(url: string) {
    return this._gltfHandle.loadAsync(url);
  }

  async loadFBX(url: string): Promise<Object3D> {
    return this._fbxhandle.loadAsync(url);
  }

  async loadAudio(url: string) {
    return this._audioHandle.loadAsync(url);
  }

  async loadTexture(url: string) {
    return this._textureHandle.loadAsync(url);
  }

  private _loadOnprogress() {
    const that: Loader = this;
    DefaultLoadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
      that._event.dispatchEvent({
        type: LOAD_PROCESS,
        message: { url, itemsLoaded, itemsTotal },
      });
    };
    DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      that._event.dispatchEvent({
        type: LOAD_PROCESS,
        message: { url, itemsLoaded, itemsTotal },
      });
    };
  }
}
