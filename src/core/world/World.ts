import { BORDER_TEXTURE, GUN } from '@/configs';
import Loader from '../loader';
import Component from '../Component';
import Collision from '../collision';
import { LightFlowWall } from '@/core/effects';

import type Core from '../index';

export default class World extends Component {
  private _instance: Core;
  private _loader: Loader;
  private _effect: LightFlowWall;
  public name: string = 'world';
  public collision: Collision;

  constructor(instance: Core) {
    super();
    this._loader = new Loader();
    this._instance = instance;
    this.collision = new Collision();
    this._effect = new LightFlowWall(2.5, 5);
  }

  initialize() {}

  async load() {
    const { scene } = await this._loader.loadGLTF(BORDER_TEXTURE);
    const ak = await this._loader.loadGLTF(GUN);
    await this._effect.load();

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
        // this.collision.addRaycast(item);
      }
    });

    setTimeout(() => {
      this.collision.calculateBound(scene);
    }, 1000);

    ak.scene.position.set(20, 5, -15);
    ak.scene.rotateX(-Math.PI / 10);
    ak.scene.scale.set(0.6, 0.6, 0.6);

    this._instance.scene.add(this._effect.mesh);
    this._instance.scene.add(ak.scene);
    this._instance.scene.add(scene);
    return scene;
  }

  getCollision() {
    return this.collision;
  }

  update(time: number) {
    this._effect.update(time);
    // this._instance.scene.add(this.collision.collisionsHelper);
  }
}
