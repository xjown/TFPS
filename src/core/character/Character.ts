import Loader from '../loader';

export default abstract class Character extends Loader {
  size: { x: number; y: number; z: number };

  constructor() {
    super();
    this.size = { x: 0, y: 0, z: 0 };
  }

  abstract load(): void;
}
