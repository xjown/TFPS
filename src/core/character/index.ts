import { loadGLTF, loadFBX } from '@/utils';
import {
  CHARACTER_URL,
  CHARACTER_WALK_URL,
  CHARACTER_JUMP_URL,
  CHARACTER_RUNNING_URL,
  CHARACTER_IDLE_URL,
} from '@/configs';

import type {
  Mesh as MeshType,
  AnimationClip as AnimationClipType,
} from 'three';

export default class Character {
  private _firstPerson: boolean;
  person!: MeshType;
  actions: Record<string, AnimationClipType> = {};
  constructor(firstPerson: boolean = false) {
    this._firstPerson = firstPerson;
  }

  async load() {
    const model = await loadFBX(CHARACTER_URL);
    const walk = await loadFBX(CHARACTER_WALK_URL);
    const jump = await loadFBX(CHARACTER_JUMP_URL);
    const run = await loadFBX(CHARACTER_RUNNING_URL);
    const idle = await loadFBX(CHARACTER_IDLE_URL);
    this.actions['walk'] = walk.animations[0];
    this.actions['jump'] = jump.animations[0];
    this.actions['run'] = run.animations[0];
    this.actions['idle'] = idle.animations[0];
    model.scale.set(0.02, 0.02, 0.02);

    this.person = model;
    return this.person;
  }
}
