import Ammo from 'ammojs-typed';

class AmmoHelper {
  static init(callback = () => {}) {
    const loadAmmo = Ammo.bind(Ammo)(Ammo);
    loadAmmo.then(() => {
      callback();
    });
  }
}

export { AmmoHelper, Ammo };
