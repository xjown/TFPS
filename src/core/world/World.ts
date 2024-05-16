import { BORDER_TEXTURE, GUN } from '@/configs';
import Loader from '../loader';
import Component from '../Component';
import Collision from '../collision';

import { LightFlowWall } from '@/core/effects';

import type Core from '../index';

export default class World extends Component {
  private _instance: Core;
  private _loader: Loader;
  private _effect!: LightFlowWall;
  private _ak = {
    position: { x: 20, y: 5, z: -15 },
    size: { radius: 2.5, height: 5 },
  };
  public name: string = 'world';
  public collision: Collision;

  constructor(instance: Core) {
    super();
    this._loader = new Loader();
    this._instance = instance;
    this.collision = new Collision();
  }

  initialize() {
    this._effect = new LightFlowWall(
      this._ak.size.radius,
      this._ak.size.height
    );
    this._effect.mesh.position.set(this._ak.position.x, 2, this._ak.position.z);
    this._instance.scene.add(this._effect.mesh);
  }

  async load() {
    const { scene } = await this._loader.loadGLTF(BORDER_TEXTURE);
    const ak = await this._loader.loadGLTF(GUN);

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

    ak.scene.position.set(
      this._ak.position.x,
      this._ak.position.y,
      this._ak.position.z
    );
    ak.scene.rotateX(-Math.PI / 10);
    ak.scene.scale.set(0.6, 0.6, 0.6);

    this._instance.scene.add(ak.scene);
    this._instance.scene.add(scene);
    return scene;
  }

  getCollision() {
    return this.collision;
  }

  update(time: number) {
    this._effect.update(time);

    // debug
    // this._instance.scene.add(this.collision.collisionsHelper);
  }
}
