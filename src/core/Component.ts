import type Entity from './Entity';
export default class Component {
  parent: Entity | null;
  name: string | null;

  constructor() {
    this.name = null;
    this.parent = null;
  }

  setParent(component: Entity) {
    this.parent = component;
  }

  getComponent(name: string): Component | null {
    if (this.parent) {
      return this.parent.getComponent(name);
    }
    return null;
  }

  initialize(_: number) {}

  update(_: number) {}

  physicsUpdate(_: number) {}
}
