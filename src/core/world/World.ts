import { BORDER_TEXTURE, GUN } from '@/configs';
import Loader from '../loader';
import Component from '../Component';
import Collision from '../collision';

import { LightFlowWall } from '@/core/effects';

import type Core from '../index';
import type { Object3D } from 'three';

export default class World extends Component {
  private _instance: Core;
  private _loader: Loader;
  private _effect!: LightFlowWall;
  private _weapon!: Object3D;

  public name: string = 'world';
  public collision: Collision;
  public ak = {
    position: { x: 20, y: 5, z: -15 },
    size: { radius: 2.5, height: 10 },
  };

  constructor(instance: Core) {
    super();
    this._loader = new Loader();
    this._instance = instance;
    this.collision = new Collision();
  }

  initialize() {
    this._effect = new LightFlowWall(this.ak.size.radius, this.ak.size.height);
    this._effect.mesh.position.set(this.ak.position.x, 2, this.ak.position.z);
    this._instance.scene.add(this._effect.mesh);
  }

  async load() {
    const { scene } = await this._loader.loadGLTF(BORDER_TEXTURE);
    this._weapon = (await this._loader.loadGLTF(GUN)).scene;

    scene.traverse((item) => {
      if (item.name === 'home001' || item.name === 'PointLight') {
        item.castShadow = true;
      }
      if (item.name.includes('Light')) {
        item.intensity *= 800;
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

    this._weapon.position.set(
      this.ak.position.x,
      this.ak.position.y,
      this.ak.position.z
    );
    this._weapon.scale.set(0.6, 0.6, 0.6);

    this._instance.scene.add(this._weapon);
    this._instance.scene.add(scene);
    return scene;
  }

  getCollision() {
    return this.collision;
  }

  update(time: number) {
    this._effect.update(time);
    this._weapon.rotation.y += 0.005;

    // debug
    // this._instance.scene.add(this.collision.collisionsHelper);
  }
}
