import Core from '../index';
import type {
  Box3 as Box3Type,
  Line3 as Line3Type,
  Mesh as MeshType,
  BoxGeometry as BoxGeometryType,
  MeshBasicMaterial as MeshBasicMaterialType,
} from 'three';

export default class Player {
  private _instance: Core;
  private _player!: MeshType<BoxGeometryType, MeshBasicMaterialType>;
  private _speed: number = 6;
  private _basePlayerInfo = {
    radius: 1,
  };
  private _frameBox: Box3Type = new Box3();
  private _frameLine: Line3Type = new Line3();

  constructor(instance: Core) {
    this._instance = instance;
    this._createPlayer();
  }

  _createPlayer() {
    this._player = new Mesh(
      new BoxGeometry(1, 1, 1),
      new MeshBasicMaterial({ color: 0x00ff00 })
    );
    this._player.position.set(0, 1, 0);
    this._instance.scene.add(this._player);
  }

  update(time: number) {
    this._updatePlayer(time);
    this._checkCollision();
  }

  private _updatePlayer(time: number) {
    const angle = this._instance.orbit_controls.getAzimuthalAngle();
    const rotation = new Vector3(0, 0, 0);

    if (this._instance.events.downDowning.KeyW) {
      rotation.set(0, 0, -1).applyAxisAngle(new Vector3(0, 1, 0), angle);
      this._player.position.addScaledVector(rotation, this._speed * time);
    }

    if (this._instance.events.downDowning.KeyS) {
      rotation.set(0, 0, 1).applyAxisAngle(new Vector3(0, 1, 0), angle);
      this._player.position.addScaledVector(rotation, this._speed * time);
    }

    if (this._instance.events.downDowning.KeyA) {
      rotation.set(-1, 0, 0).applyAxisAngle(new Vector3(0, 1, 0), angle);
      this._player.position.addScaledVector(rotation, this._speed * time);
    }

    if (this._instance.events.downDowning.KeyD) {
      rotation.set(1, 0, 0).applyAxisAngle(new Vector3(0, 1, 0), angle);
      this._player.position.addScaledVector(rotation, this._speed * time);
    }

    //此处必须更新。默认为自动更新，但是会慢一拍。如果不更新会导致计算距离不准确
    // 详情 _checkCollision()方法 => moveStance变量
    this._player.updateMatrixWorld();
  }

  private _checkCollision() {
    if (!this._instance.collision?.collisions) return;
    this._frameBox.makeEmpty();
    this._frameLine.set(new Vector3(0, 0, 0), new Vector3(0, 0, 0));

    this._frameLine.start
      .applyMatrix4(this._player.matrixWorld)
      .applyMatrix4(this._instance.collision?.collisions.matrixWorld.invert());
    this._frameLine.end
      .applyMatrix4(this._player.matrixWorld)
      .applyMatrix4(this._instance.collision?.collisions.matrixWorld.invert());

    this._frameBox.expandByPoint(this._frameLine.start);
    this._frameBox.expandByPoint(this._frameLine.end);

    this._frameBox.max.addScalar(this._basePlayerInfo.radius);
    this._frameBox.min.addScalar(-this._basePlayerInfo.radius);

    this._instance.collision?.collisions?.geometry?.boundsTree?.shapecast({
      intersectsBounds: (box) => box.intersectsBox(this._frameBox),
      intersectsTriangle: (triangle) => {
        const triangleNear = new Vector3();
        const lineNear = new Vector3();
        const distance = triangle.closestPointToSegment(
          this._frameLine,
          triangleNear,
          lineNear
        );
        if (distance < this._basePlayerInfo.radius) {
          const deep = this._basePlayerInfo.radius - distance;
          const direction = lineNear.sub(triangleNear).normalize();
          this._frameLine.start.addScaledVector(direction, deep);
          this._frameLine.end.addScaledVector(direction, deep);
        }
      },
    });

    const newPosition = new Vector3();
    const move_distance = new Vector3();
    newPosition
      .copy(this._frameLine.start)
      .applyMatrix4(this._instance.collision?.collisions.matrixWorld);

    move_distance.subVectors(newPosition, this._player.position);

    const offsets = Math.max(0.0, move_distance.length() - 1e-2);
    move_distance.normalize().multiplyScalar(offsets);

    this._player.position.add(move_distance);
  }
}
