import Loader from '../loader';
import { SHY_TEXTURE } from '@/configs';

import type Core from '../index';

export default class Sky extends Loader {
  private _instance: Core;
  constructor(instance: Core) {
    super();
    this._instance = instance;
  }

  async load() {
    const res = await this.loadTexture(SHY_TEXTURE);
    const shape = new SphereGeometry(100);
    const material = new MeshBasicMaterial({
      map: res,
      side: BackSide,
      depthWrite: false,
      toneMapped: false,
    });

    const sky = new Mesh(shape, material);
    sky.translateY(-20);

    this._instance.scene.add(sky);
  }
}
