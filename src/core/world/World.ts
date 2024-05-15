import { BORDER_TEXTURE } from '@/configs';
import Loader from '../loader';
import Component from '../Component';
import Collision from '../collision';

import type Core from '../index';

export default class World extends Component {
  private _instance: Core;
  private _loader: Loader;
  public name: string = 'world';
  collision: Collision;

  constructor(instance: Core) {
    super();
    this._loader = new Loader();
    this._instance = instance;
    this.collision = new Collision();
  }

  initialize() {
    this._staticCollision();
  }

  async load() {
    const { scene } = await this._loader.loadGLTF(BORDER_TEXTURE);
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
        this.collision.addRaycast(item);
      }
    });

    setTimeout(() => {
      this.collision.calculateBound(scene);
    }, 1000);

    this._instance.scene.add(scene);
    return scene;
  }

  getCollision() {
    return this.collision;
  }

  private _staticCollision() {
    const geometry = new BoxGeometry(47, 0.1, 85);
    const material = new MeshBasicMaterial({ color: 0x00ff00 });
    const plane = new Mesh(geometry, material);
    plane.position.set(5, 0, 8);
    // this._instance.scene.add(plane);
  }

  update(time: number) {
    // this._instance.scene.add(this.collision.collisionsHelper);
  }
}
