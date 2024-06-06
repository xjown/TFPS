import { BORDER_TEXTURE, GUN } from '@/configs';
import Loader from '../loader';
import Component from '../Component';
import { ACTION_EVENT_NAME, KEY_CODE } from '@/configs';
import Events from '../events';
import Sky from './Sky';
import Collision from '../collision';

import { LightFlowWall } from '@/core/effects';

import WorldPhysics from './WorldPhysics';
import type ActionEvent from '../events/ActionEvent';
import type Core from '../index';
import type { Object3D } from 'three';

export default class World extends Component {
  private _instance: Core;
  private _loader: Loader;
  private _effect!: LightFlowWall;
  private _weapon!: Object3D;
  private _worldPhysics!: WorldPhysics;
  private _sky: Sky;

  public ConvexHullShape: Object3D[] = [];
  public name: string = 'world';
  public collision: Collision;
  public ak = {
    position: { x: 10, y: 1.5, z: 2 },
    size: { radius: 1, height: 3 },
  };

  constructor(instance: Core) {
    super();
    this._loader = new Loader();
    this._instance = instance;
    this.collision = new Collision();
    this._sky = new Sky(instance);
  }

  initialize() {
    const hemiLight = new AmbientLight(0x404040, 30);

    this._effect = new LightFlowWall(this.ak.size.radius, this.ak.size.height);
    this._effect.mesh.position.set(this.ak.position.x, 1, this.ak.position.z);
    this._worldPhysics = this.getComponent('worldPhysics') as WorldPhysics;

    this._setupEvents();

    this._instance.scene.add(this._effect.mesh);
    this._instance.scene.add(hemiLight);
  }

  _setupEvents() {
    const _event = Events.getStance().getEvent(
      ACTION_EVENT_NAME
    ) as ActionEvent;
    _event.addEventListener(KEY_CODE, ({ message }) => {
      const { code, event } = message;
      if (event && event.repeat) return;
      switch (code) {
        case 'KeyF':
          if (this._worldPhysics.isPlayerOverlapping) {
            _event.dispatchEvent({
              type: KEY_CODE,
              message: { code: 'Pick', event },
            });
          }
          break;
      }
    });
  }

  async load() {
    await this._sky.load();
    const { scene } = await this._loader.loadGLTF(BORDER_TEXTURE);
    this._weapon = (await this._loader.loadGLTF(GUN)).scene;

    scene.traverse((item) => {
      if (item.type == 'Mesh') {
        item.receiveShadow = true;
        this.ConvexHullShape.push(item);
      }
    });

    this._weapon.position.set(
      this.ak.position.x,
      this.ak.position.y,
      this.ak.position.z
    );
    this._weapon.scale.set(0.2, 0.2, 0.2);

    this._instance.scene.add(this._weapon);
    this._instance.scene.add(scene);
    return scene;
  }

  update(time: number) {
    this._effect.update(time);
    this._weapon.rotation.y += 0.005;
  }
}
