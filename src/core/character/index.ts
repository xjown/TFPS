import { loadGLTF } from '@/utils';
import { CHARACTER } from '@/configs';

export default class Character {
  firstPerson: boolean;
  constructor(firstPerson: boolean = false) {
    this.firstPerson = firstPerson;
  }

  async load() {
    return await loadGLTF(CHARACTER);
  }
}
