import type Loader from '../loader';
import {
  CHARACTER_URL,
  CHARACTER_WALK_URL,
  CHARACTER_JUMP_URL,
  CHARACTER_RUNNING_URL,
  CHARACTER_IDLE_URL,
  CHARACTER_BACKWARD_URL,
} from '@/configs';

import type {
  Mesh as MeshType,
  AnimationClip as AnimationClipType,
} from 'three';

export type AllowActionType = 'walk' | 'jump' | 'run' | 'idle' | 'backward';

export default class Character {
  private _firstPerson: boolean;
  person!: MeshType;
  actions: Record<string, AnimationClipType> = {};
  constructor(firstPerson: boolean = false) {
    this._firstPerson = firstPerson;
  }

  async load(handle: Loader) {
    const model = await handle.loadFBX(CHARACTER_URL);
    const walk = await handle.loadFBX(CHARACTER_WALK_URL);
    const jump = await handle.loadFBX(CHARACTER_JUMP_URL);
    const run = await handle.loadFBX(CHARACTER_RUNNING_URL);
    const idle = await handle.loadFBX(CHARACTER_IDLE_URL);
    const backward = await handle.loadFBX(CHARACTER_BACKWARD_URL);

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
      this.person.position.addScalar();
    }
  }
}
