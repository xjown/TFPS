import Ammo from 'ammo.js';

class AmmoHelper {
  static init(callback = () => {}) {
    // @ts-ignore
    Ammo.bind(Ammo)(Ammo).then(() => {
      callback();
    });
  }
}

export { AmmoHelper, Ammo };
