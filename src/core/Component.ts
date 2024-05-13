import type Entity from './Entity';
export default abstract class Component {
  parent: Entity | null;
  name: string | null;

  constructor() {
    this.name = null;
    this.parent = null;
  }

  setParent(component: Entity) {
    this.parent = component;
  }

  FindEntity(name: string) {
    if (this.parent) {
      return this.parent.FindEntity(name);
    }
    return null;
  }

  getComponent(name: string): Component | null {
    if (this.parent) {
      return this.parent.getComponent(name);
    }
    return null;
  }

  public abstract initialize(): void;

  update(_: number) {}

  load(): Promise<unknown> {
    return Promise.resolve();
  }

  physicsUpdate(_: number) {}
}
