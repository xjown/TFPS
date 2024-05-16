import Loader from '../loader';

export default abstract class Effect extends Loader {
  load() {}

  abstract update(time: number): void;
}
