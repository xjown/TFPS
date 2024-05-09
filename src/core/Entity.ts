import type Component from './Component';
import type EntityCollection from './EntityCollection';
export default class Entity {
  private components: { [key: string]: Component };

  private name: string;
  private parent: EntityCollection | null;

  constructor(name: string) {
    this.components = {};
    this.name = name;
    this.parent = null;
  }

  addComponent(component: Component): void {
    component.setParent(this);
    this.components[component.name as string] = component;
  }

  getComponent(name: string): Component {
    return this.components[name];
  }

  setParent(entity: EntityCollection) {
    this.parent = entity;
  }

  findEntity() {}

  update(_: number) {
    for (let i in this.components) {
      this.components[i].update(_);
    }
  }

  physicsUpdate(_: number) {
    for (let i in this.components) {
      this.components[i].physicsUpdate(_);
    }
  }
}
