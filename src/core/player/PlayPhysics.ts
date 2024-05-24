import { Ammo, AmmoHelper } from '@/core/ammo';
import Component from '@/core/Component';

import type PlayControl from './PlayControl';

export default class PlayPhysics extends Component {
  public name: string = 'playPhysics';
  public physicsWorld: Ammo.btDiscreteDynamicsWorld;
  public body: Ammo.btRigidBody | null;

  constructor(physicsWorld: Ammo.btDiscreteDynamicsWorld) {
    super();
    this.body = null;
    this.physicsWorld = physicsWorld;
  }

  initialize() {
    const playControl: PlayControl = this.getComponent(
      'playControl'
    ) as PlayControl;

    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(
      new Ammo.btVector3(
        playControl.position.x,
        playControl.position.y,
        playControl.position.z
      )
    );

    const motionState = new Ammo.btDefaultMotionState(transform);
    const shape = new Ammo.btCapsuleShape(
      playControl.character.size.radius,
      playControl.character.size.height / 2 + playControl.character.size.radius
    );
    const localInertia = new Ammo.btVector3(0, 0, 0);
    const bodyInfo = new Ammo.btRigidBodyConstructionInfo(
      playControl.character.mass,
      motionState,
      shape,
      localInertia
    );

    this.body = new Ammo.btRigidBody(bodyInfo);
    this.body.setActivationState(AmmoHelper.CF_NO_CONTACT_RESPONSE);

    this.physicsWorld.addRigidBody(this.body);
  }

  physicsUpdate(world: Ammo.btDynamicsWorld, timeStep: number): void {
    const dispatcher = this.physicsWorld.getDispatcher();
    // 获取接触点数量
    const numManifolds = dispatcher.getNumManifolds();
    for (let i = 0; i < numManifolds; i++) {
      // 储和管理两个碰撞体之间的接触信息
      const contactManifold = dispatcher.getManifoldByIndexInternal(i);
      const obj0: Ammo.btRigidBody = Ammo.castObject<typeof Ammo.btRigidBody>(
        contactManifold.getBody0(),
        Ammo.btRigidBody
      );
      const obj1: Ammo.btRigidBody = Ammo.castObject<typeof Ammo.btRigidBody>(
        contactManifold.getBody1(),
        Ammo.btRigidBody
      );
      if (obj0 != this.body && obj1 != this.body) continue;
      const numContacts = contactManifold.getNumContacts();
      for (let j = 0; j < numContacts; j++) {}
    }
  }
}
