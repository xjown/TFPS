import { Ammo } from '@/core/ammo';
import Component from '@/core/Component';
export default class PlayPhysics extends Component {
  public name: string = 'playPhysics';
  constructor() {
    super();
    this.name = 'playPhysics';
  }

  initialize() {
    const transform = new Ammo.btTransform();
  }
}
