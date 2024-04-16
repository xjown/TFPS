import Events from '../events';
import {
  UI_POSITION_CONTROL,
  ACTION_EVENT_NAME,
  UI_EVENT_NAME,
} from '@/configs';

import type Core from '../index';
import type Character from '../character';
import type { AllowActionType } from '../character';
import type ActionEvent from '../events/action';
import type {
  Box3 as Box3Type,
  Line3 as Line3Type,
  Mesh as MeshType,
  BoxGeometry as BoxGeometryType,
  MeshBasicMaterial as MeshBasicMaterialType,
  Vector3 as Vector3Type,
  AnimationMixer as AnimationMixerType,
} from 'three';

export default class Player {
  private _instance: Core;
  private _player!: MeshType<BoxGeometryType, MeshBasicMaterialType>;
  private _speed: number = 6;
  private _basePlayerInfo = {
    radius: 1,
    firstPerson: true,
  };
  private _frameBox: Box3Type = new Box3();
  private _frameLine: Line3Type = new Line3();
  private _onFloor: boolean = false;
  private _downDistance: Vector3Type = new Vector3(0, 0, 0);
  private _gravity: number = 15;
  private _mixer!: AnimationMixerType;
  private _character: Character;
  private _currentAction: AllowActionType = 'idle';
  private _maxFalling: number = 15;
  private _event: ActionEvent = Events.getStance().getEvent(ACTION_EVENT_NAME);
  private _ui: ActionEvent = Events.getStance().getEvent(UI_EVENT_NAME);
  private _controlAngle: number = 0;

  constructor(instance: Core, character: Character) {
    this._instance = instance;
    this._character = character;
    this._createPlayer();

    // 处理跳跃
    this._playerOtherAction();
  }

  _createPlayer() {
    this._player = new Mesh(
      new BoxGeometry(1, 8, 1),
      new MeshBasicMaterial({ color: 0x00ff00 })
    );

    this._mixer = new AnimationMixer(this._character.person);
    this._mixer.clipAction(this._character.actions['idle']).play();
    this._switchVisual();
    this._player.visible = false;
    this._player.position.set(0, 4, 0);
    this._instance.scene.add(this._player);

    this._ui.addEventListener(UI_POSITION_CONTROL, ({ message }) => {
      this._controlAngle = message.angle.radian;
    });
  }

  update(time: number) {
    this._checkCollision(time);
    this._updatePlayer(time);
    this._checkFalling();

    // action
    this._updateAction(time);

    // 调整摄像机
    const cameraDistance = new Vector3().subVectors(
      this._player.position,
      this._instance.orbit_controls.target
    );
    this._instance.orbit_controls.target.copy(this._player.position);
    this._instance.camera.position.add(cameraDistance);
    this._instance.camera.updateMatrix();
  }

  private _checkFalling() {
    if (this._player.position.y >= this._maxFalling) {
      this.reset();
    }
  }

  reset() {}

  private _updatePlayer(time: number) {
    const angle = this._instance.orbit_controls.getAzimuthalAngle();
    const rotation = new Vector3(0, 0, 0);

    this._downDistance.y = this._onFloor ? 0 : this._gravity * time * -1;

    this._player.position.add(this._downDistance);

    if (this._event.downDowning.KeyW) {
      rotation.set(0, 0, -1).applyAxisAngle(new Vector3(0, 1, 0), angle);
      this._player.position.addScaledVector(rotation, this._speed * time);
    }

    if (this._event.downDowning.KeyS) {
      rotation.set(0, 0, 1).applyAxisAngle(new Vector3(0, 1, 0), angle);
      this._player.position.addScaledVector(rotation, this._speed * time);
    }

    if (this._event.downDowning.KeyA) {
      rotation.set(-1, 0, 0).applyAxisAngle(new Vector3(0, 1, 0), angle);
      this._player.position.addScaledVector(rotation, this._speed * time);
    }

    if (this._event.downDowning.KeyD) {
      rotation.set(1, 0, 0).applyAxisAngle(new Vector3(0, 1, 0), angle);
      this._player.position.addScaledVector(rotation, this._speed * time);
    }

    //此处必须更新。默认为自动更新，但是会慢一拍。如果不更新会导致计算距离不准确
    // 详情 _checkCollision()方法 => moveStance变量
    this._player.updateMatrixWorld();
  }

  private _switchVisual() {
    if (!this._basePlayerInfo.firstPerson) {
      this._character.person.visible = true;
      this._instance.camera.position
        .sub(this._instance.orbit_controls.target)
        .normalize()
        .multiplyScalar(10)
        .add(this._instance.orbit_controls.target);
      this._instance.orbit_controls.maxPolarAngle = Math.PI / 2;
      this._instance.orbit_controls.minDistance = 1;
      this._instance.orbit_controls.maxDistance = 20;
    } else {
      this._instance.camera.position
        .sub(this._instance.orbit_controls.target)
        .normalize();
      this._instance.camera.position.x /= 10;
      this._instance.camera.position.y /= 10;
      this._instance.camera.position.z /= 10;

      this._instance.camera.position.add(this._instance.orbit_controls.target);
      this._character.person.visible = false;
      this._instance.orbit_controls.maxPolarAngle = Math.PI;
      this._instance.orbit_controls.minDistance = 1e-4;
      this._instance.orbit_controls.maxDistance = 1e-4;
    }
    this._basePlayerInfo.firstPerson = !this._basePlayerInfo.firstPerson;
  }

  private _playerOtherAction() {
    this._event.addEventListener('action', ({ message }) => {
      const { code } = message;
      switch (code) {
        case 'Space':
          if (this._onFloor) {
            this._player.position.y += 5;
            this._onFloor = false;
          }
          break;
        case 'KeyV':
          this._switchVisual();
          break;
      }
    });
  }
  private _checkCollision(time: number) {
    // if (!this._instance.collision?.collisions) return;

    this._frameBox.makeEmpty();
    this._frameLine.set(new Vector3(0, 0, 0), new Vector3(0, -3, 0));

    this._frameLine.start.applyMatrix4(this._player.matrixWorld);
    this._frameLine.end.applyMatrix4(this._player.matrixWorld);

    this._frameBox.expandByPoint(this._frameLine.start);
    this._frameBox.expandByPoint(this._frameLine.end);

    this._frameBox.max.addScalar(this._basePlayerInfo.radius);
    this._frameBox.min.addScalar(-this._basePlayerInfo.radius);

    // this._instance.scene.add(new Box3Helper(this._frameBox, 0xffff00));

    this._instance.collision?.collisions?.geometry?.boundsTree?.shapecast({
      intersectsBounds: (box) => {
        return box.intersectsBox(this._frameBox);
      },
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
          // console.log('超出' + deep);
          // 始终为负
          const direction = lineNear.sub(triangleNear).normalize();
          // 减去deep超出值
          this._frameLine.start.addScaledVector(direction, deep);
          this._frameLine.end.addScaledVector(direction, deep);
        }
      },
    });

    const newPosition = new Vector3();
    const move_distance = new Vector3();
    newPosition.copy(this._frameLine.start);

    move_distance.subVectors(newPosition, this._player.position);
    const offsets = Math.max(0.0, move_distance.length());

    //因为偏移量乘以x，y，z轴所以遇到碰撞后x，y轴也会变化
    move_distance.normalize().multiplyScalar(offsets - 1e-5);

    // move_distance.y 大于零的情况下一定在地面上。
    this._onFloor = move_distance.y > Math.abs(this._downDistance.y);

    this._player.position.add(move_distance);
    this._player.updateMatrixWorld();
  }

  _updateAction(time: number) {
    const cameraAngle = this._instance.orbit_controls.getAzimuthalAngle();
    const characterAngle = new Quaternion().copy(
      this._character.person.quaternion
    );
    let angle: number = Math.PI;
    const move_distance = new Vector3().subVectors(
      this._frameLine.start,
      this._player.position
    );

    let nextAction!: AllowActionType;

    if (
      this._event.downDowning.KeyW ||
      this._event.downDowning.KeyA ||
      this._event.downDowning.KeyD
    ) {
      if (this._event.downDowning.KeyW) angle = Math.PI;
      if (this._event.downDowning.KeyA) angle = (Math.PI / 2) * -1;
      if (this._event.downDowning.KeyD) angle = Math.PI / 2;

      nextAction = 'walk';
    } else if (this._event.downDowning.KeyS) {
      nextAction = 'backward';
    } else if (this._onFloor) {
      nextAction = 'idle';
    } else {
      nextAction = 'jump';
    }

    if (this._currentAction !== nextAction) {
      this._mixer
        .clipAction(this._character.actions[this._currentAction])
        ?.fadeOut(0.1);
      this._mixer
        .clipAction(this._character.actions[nextAction])
        ?.reset()
        .play()
        .fadeIn(0.1);
    }

    characterAngle.setFromAxisAngle(new Vector3(0, 1, 0), cameraAngle + angle);
    this._character.person.quaternion.slerp(characterAngle, 0.2);
    this._character.person.position
      .applyMatrix4(this._player.matrixWorld)
      .copy(this._player.position.clone());
    this._character.person.translateY(-4);

    this._currentAction = nextAction;
    this._mixer.update(time);
  }
}
