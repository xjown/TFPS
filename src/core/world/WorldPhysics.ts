import Component from '../Component';
import { Ammo, AmmoHelper } from '@/core/ammo';

import type World from './World';
export default class WorldPhysics extends Component {
  private _world!: World;
  public name: string = 'worldPhysics';
  public physicsWorld: Ammo.btDiscreteDynamicsWorld;

  constructor(physicsWorld: Ammo.btDiscreteDynamicsWorld) {
    super();
    this.physicsWorld = physicsWorld;
  }

  initialize() {
    this._world = this.getComponent('world') as World;

    // weapon
    const ak = AmmoHelper.createGhostBody(
      new Ammo.btCylinderShape(
        new Ammo.btVector3(
          this._world.ak.size.radius,
          this._world.ak.size.height,
          this._world.ak.size.radius
        )
      ),
      {
        x: this._world.ak.position.x,
        y: this._world.ak.position.y,
        z: this._world.ak.position.z,
      }
    );
    this.physicsWorld.addCollisionObject(ak);

    // ground
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(0, -0.1, 0));

    const motionState = new Ammo.btDefaultMotionState(transform);
    const localInertia = new Ammo.btVector3(0, 0, 0);

    const groundShape = new Ammo.btStaticPlaneShape(
      new Ammo.btVector3(0, 1, 0),
      0
    );

    const bodyInfo = new Ammo.btRigidBodyConstructionInfo(
      0,
      motionState,
      groundShape,
      localInertia
    );
    const body = new Ammo.btRigidBody(bodyInfo);
    this.physicsWorld.addRigidBody(body);
  }
}
