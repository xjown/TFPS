import Component from '../Component';
import { Ammo } from '@/core/ammo';

export default class WorldPhysics extends Component {
  name: string = 'worldPhysics';
  public physicsWorld: Ammo.btDiscreteDynamicsWorld;

  constructor(physicsWorld: Ammo.btDiscreteDynamicsWorld) {
    super();
    this.physicsWorld = physicsWorld;
  }

  initialize() {
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
