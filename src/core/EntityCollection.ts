import Entity from './Entity';

import type { Ammo } from '@/core/ammo';

export default class EntityCollection {
  entitys: Entity[] = [];
  constructor() {
    this.entitys = [];
  }

  find(name: string) {
    return this.entitys.find((el) => el.name === name);
  }

  addEntity(entity: Entity) {
    entity.setParent(this);
    this.entitys.push(entity);
  }

  update(_: number) {
    for (const entity of this.entitys) {
      entity.update(_);
    }
  }

  physicsUpdate(world: Ammo.btDynamicsWorld, timeStep: number) {
    for (const entity of this.entitys) {
      entity.physicsUpdate(world, timeStep);
    }
  }

  entitySetup() {
    for (const entity of this.entitys) {
      entity.initialize();
    }
  }
}
