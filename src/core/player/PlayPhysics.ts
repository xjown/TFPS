import { Ammo, AmmoHelper } from '@/core/ammo';
import Component from '@/core/Component';

import type PlayControl from './PlayControl';

export default class PlayPhysics extends Component {
  public name: string = 'playPhysics';
  public physicsWorld: Ammo.btDiscreteDynamicsWorld;
  public body: Ammo.btRigidBody | null;
  public canJump: boolean;

  private _shatterNormal: Ammo.btVector3 = new Ammo.btVector3(0, 1, 0);

  constructor(physicsWorld: Ammo.btDiscreteDynamicsWorld) {
    super();
    this.body = null;
    this.physicsWorld = physicsWorld;
    this.canJump = false;
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
    this.body.setActivationState(
      AmmoHelper.bodyActiveState.DISABLE_DEACTIVATION
    );
    this.body.setUserIndex(0);

    this.physicsWorld.addRigidBody(this.body);
  }

  physicsUpdate() {
    this.canJump = false;
    const dispatcher = this.physicsWorld.getDispatcher();
    // 获取碰撞对数量
    const numManifolds = dispatcher.getNumManifolds();
    for (let i = 0; i < numManifolds; i++) {
      // 碰撞对之间的接触信息
      const contactManifold = dispatcher.getManifoldByIndexInternal(i);

      // A 碰撞物
      const obj0: Ammo.btRigidBody = Ammo.castObject<typeof Ammo.btRigidBody>(
        contactManifold.getBody0(),
        Ammo.btRigidBody
      );
      // B 被撞物体
      const obj1: Ammo.btRigidBody = Ammo.castObject<typeof Ammo.btRigidBody>(
        contactManifold.getBody1(),
        Ammo.btRigidBody
      );
      if (obj0 != this.body && obj1 != this.body) continue;

      const numContacts = contactManifold.getNumContacts();

      for (let j = 0; j < numContacts; j++) {
        if (this.canJump) return;

        const contactPoint = contactManifold.getContactPoint(j);
        const normal = contactPoint.get_m_normalWorldOnB();

        const dot = this._shatterNormal.dot(normal);
        this.canJump = dot > 0.5;
      }
    }
  }
}
