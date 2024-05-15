import Loader from '../loader';

export default abstract class Character extends Loader {
  size: { x: number; y: number; z: number };
  mass: number;

  constructor() {
    super();
    this.mass = 0;
    this.size = { x: 0, y: 0, z: 0 };
  }

  abstract load(): void;
}
