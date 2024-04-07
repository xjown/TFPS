import Core from '../index';
import { Mesh, BoxGeometry, MeshBasicMaterial } from 'three';

export default class Player {
  private _instance: Core;
  private _player: Mesh<BoxGeometry, MeshBasicMaterial>;
  private _speed: number = 6;

  constructor(instance: Core) {
    this._instance = instance;
    this._createPlayer();
  }

  _createPlayer() {
    this._player = new Mesh(
      new BoxGeometry(0.5, 2.5, 0.5),
      new MeshBasicMaterial({ color: 0x00ff00 })
    );

    this._instance.scene.add(this._player);
  }

  update(time: number) {
    // this._updatePlayer(time);
  }

  _updatePlayer(time: number) {
    const angle = new Vector3();
    // this._instance.orbit_controls.getViewDirection(angle);
    // console.log(this._instance.orbit_controls.getAzimuthalAngle());
    if (this._instance.events.downDowning.KeyW) {
      angle.multiply(new Vector3(1, 0, 1));
      this._player.position.addScaledVector(angle, this._speed * time);
    }

    if (this._instance.events.downDowning.KeyS) {
      angle.multiply(new Vector3(-1, 0, -1));
      this._player.position.addScaledVector(angle, this._speed * time);
    }

    if (this._instance.events.downDowning.KeyA) {
      // angle.multiply(new Vector3(-1, 0, 0));
      console.log(angle.angleTo(new Vector3(0, 0, 0)));
      const aaa = new Vector3(1, 0, 0).applyAxisAngle(
        new Vector3(0, 1, 0),
        angle.angleTo(new Vector3(0, 0, 0))
      );
      this._player.position.addScaledVector(aaa, this._speed * time);
    }

    if (this._instance.events.downDowning.KeyD) {
      angle.multiply(new Vector3(1, 0, 0));
      this._player.position.addScaledVector(angle, this._speed * time);
    }

    this._player.updateMatrixWorld();
  }
}
