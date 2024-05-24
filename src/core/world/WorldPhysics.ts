import Component from '../Component';
import { Ammo, AmmoHelper } from '@/core/ammo';

import type World from './World';
import type { PlayPhysics } from '../player';
import type UI from '../ui';
import { Object3D } from 'three';

export default class WorldPhysics extends Component {
  private _world!: World;
  private _playPhysics!: PlayPhysics;
  private _ui!: UI;

  public isPlayerOverlapping: boolean;
  public weaponPhysics!: Ammo.btGhostObject;
  public name: string = 'worldPhysics';
  public physicsWorld: Ammo.btDiscreteDynamicsWorld;

  constructor(physicsWorld: Ammo.btDiscreteDynamicsWorld) {
    super();
    this.isPlayerOverlapping = false;
    this.physicsWorld = physicsWorld;
  }

  initialize() {
    this._world = this.getComponent('world') as World;
    this._playPhysics = this.FindEntity('player')!.getComponent(
      'playPhysics'
    ) as PlayPhysics;
    this._ui = this.FindEntity('ui')!.getComponent('ui') as UI;

    for (let item of this._world.ConvexHullShape) {
      this._createBorder(item);
    }

    // weapon
    this.weaponPhysics = AmmoHelper.createGhostBody(
      new Ammo.btCylinderShape(
        new Ammo.btVector3(
          this._world.ak.size.radius,
          this._world.ak.size.height,
          this._world.ak.size.radius
        )
      ),
      {
        x: this._world.ak.position.x,
        y: 0,
        z: this._world.ak.position.z,
      }
    );

    this.physicsWorld.addCollisionObject(
      this.weaponPhysics,
      AmmoHelper.collisionFilterGroup.SensorTrigger
    );
  }

  _createBorder(mesh: Object3D) {
    const mass = 0;
    const { shape, geometry } = AmmoHelper.createConvexHullShape(mesh);

    const transform = new Ammo.btTransform();
    transform.setIdentity();

    const motionState = new Ammo.btDefaultMotionState(transform);
    const localInertia = new Ammo.btVector3(0, 0, 0);

    const bodyInfo = new Ammo.btRigidBodyConstructionInfo(
      mass,
      motionState,
      shape,
      localInertia
    );
    const body = new Ammo.btRigidBody(bodyInfo);

    this.physicsWorld.addRigidBody(body);
  }

  physicsUpdate(): void {
    if (
      AmmoHelper.IsTriggerOverlapping(
        this.weaponPhysics,
        this._playPhysics.body!
      )
    ) {
      this.isPlayerOverlapping = true;
      if (!this._ui.weaponTip) this._ui.weaponTip = true;
    } else {
      this.isPlayerOverlapping = false;
      if (this._ui.weaponTip) this._ui.weaponTip = false;
    }
  }
}
