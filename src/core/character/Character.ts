import Loader from '../loader';

export default abstract class Character extends Loader {
  size: { radius: number; height: number };
  mass: number;

  constructor() {
    super();
    this.mass = 0;
    this.size = { radius: 0, height: 0 };
  }

  abstract load(): void;
}
