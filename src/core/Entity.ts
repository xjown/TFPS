import type Component from './Component';
import type EntityCollection from './EntityCollection';
import type { Ammo } from '@/core/ammo';

export default class Entity {
  private components: { [key: string]: Component };
  private parent: EntityCollection | null;

  name: string;

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

  FindEntity(name: string) {
    if (this.parent) {
      return this.parent.find(name);
    } else {
      return null;
    }
  }

  setParent(entity: EntityCollection) {
    this.parent = entity;
  }

  update(_: number) {
    for (let i in this.components) {
      this.components[i].update(_);
    }
  }

  load() {
    const promise: Promise<unknown>[] = [];
    for (let i in this.components) {
      promise.push(this.components[i].load());
    }
    return Promise.all(promise);
  }

  physicsUpdate(world: Ammo.btDynamicsWorld, timeStep: number) {
    for (let i in this.components) {
      this.components[i].physicsUpdate(world, timeStep);
    }
  }

  initialize() {
    for (let i in this.components) {
      this.components[i].initialize();
    }
  }
}
