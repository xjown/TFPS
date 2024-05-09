import Entity from './Entity';

export default class EntityCollection {
  entitys: Entity[] = [];
  constructor() {
    this.entitys = [];
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

  physicsUpdate(_: number) {
    for (const entity of this.entitys) {
      entity.physicsUpdate(_);
    }
  }
}
