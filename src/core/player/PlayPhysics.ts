import { Ammo } from '@/core/ammo';
import Component from '@/core/Component';
export default class PlayPhysics extends Component {
  public name: string = 'playPhysics';
  physicsWorld: Ammo.btDiscreteDynamicsWorld;
  constructor(physicsWorld: Ammo.btDiscreteDynamicsWorld) {
    super();
    this.physicsWorld = physicsWorld;
  }

  initialize() {
    const transform = new Ammo.btTransform();
  }
}
