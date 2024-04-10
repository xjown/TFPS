import type Core from '../index';
import { loadGLTF } from '@/utils';
import { BORDER_TEXTURE } from '@/configs';

import type { Mesh as MeshType } from 'three';
export default class World {
  private _instance: Core;
  isReady: boolean = false;
  gallery_boards: Record<string, MeshType> = {};
  constructor(instance: Core) {
    this._instance = instance;
    this._loadScene();
  }

  private async _loadScene() {
    try {
      const { scene } = await loadGLTF(BORDER_TEXTURE);
      scene.traverse((item) => {
        if (item.name === 'home001' || item.name === 'PointLight') {
          item.castShadow = true;
        }
        if (item.name.includes('Light')) {
          item.intensity *= 1000;
        }
        if (item.name === 'home002') {
          item.castShadow = true;
          item.receiveShadow = true;
        }
        if (/gallery.*_board/.test(item.name) && 'isMesh' in item) {
          this.gallery_boards[item.name] = item;
        }
      });

      this._instance.scene.add(scene);
      this._instance.collision.addGroup(scene);
      this.isReady = true;
    } catch (e) {
      console.error('加载模型失败', e);
    }
  }

  update(time: number) {}
}
