import Core from '../index';
import { loadGLTF } from '@/utils';
import { BORDER_TEXTURE } from '@/configs';

export default class World {
  private _instance: Core;
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

        if (item.name.includes('PointLight')) {
          item.intensity *= 1000;
        }

        if (item.name === 'home002') {
          item.castShadow = true;
          item.receiveShadow = true;
        }
      });
      this._instance.scene.add(scene);
    } catch (e) {
      console.error('加载模型失败', e);
    }
  }

  update(time: number) {}
}
