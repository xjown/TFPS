import Character from './Character';
import {
  CHARACTER_URL,
  CHARACTER_WALK_URL,
  CHARACTER_JUMP_URL,
  CHARACTER_RUNNING_URL,
  CHARACTER_IDLE_URL,
  CHARACTER_BACKWARD_URL,
} from '@/configs';

import type {
  Object3D,
  AnimationClip as AnimationClipType,
  Vector3 as Vector3Type,
} from 'three';

export type AllowActionType = 'walk' | 'jump' | 'run' | 'idle' | 'backward';

export default class Man extends Character {
  person!: Object3D;
  actions: Record<string, AnimationClipType> = {};

  constructor() {
    super();

    this.mass = 1;

    this.size.x = 2;
    this.size.y = 8;
    this.size.z = 1;
  }

  async load(): Promise<Object3D> {
    const model = await this.loadFBX(CHARACTER_URL);
    const walk = await this.loadFBX(CHARACTER_WALK_URL);
    const jump = await this.loadFBX(CHARACTER_JUMP_URL);
    const run = await this.loadFBX(CHARACTER_RUNNING_URL);
    const idle = await this.loadFBX(CHARACTER_IDLE_URL);
    const backward = await this.loadFBX(CHARACTER_BACKWARD_URL);

    this.actions['walk'] = walk.animations[0];
    this.actions['jump'] = jump.animations[0];
    this.actions['run'] = run.animations[0];
    this.actions['idle'] = idle.animations[0];
    this.actions['backward'] = backward.animations[0];
    this.person = model;
    this.person.scale.set(0.04, 0.04, 0.04);
    return this.person;
  }

  setPosition() {
    if (this.person) {
      // this.person.position.addScalar();
    }
  }
}
