import { Ammo } from '@/core/ammo';
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

    const localInertia = new Ammo.btVector3(0, 0, 0);
    const boxShape = new Ammo.btBoxShape(
      new Ammo.btVector3(
        playControl.character.size.x,
        playControl.character.size.y,
        playControl.character.size.z
      )
    );
    boxShape.calculateLocalInertia(playControl.character.mass, localInertia);
    boxShape.setMargin(0.05);

    const motionState = new Ammo.btDefaultMotionState(transform);

    const bodyInfo = new Ammo.btRigidBodyConstructionInfo(
      playControl.character.mass,
      motionState,
      boxShape,
      localInertia
    );
    this.body = new Ammo.btRigidBody(bodyInfo);
    this.physicsWorld.addRigidBody(this.body);
  }
}
