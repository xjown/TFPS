import Events from '../events';
import {
  ACTION_EVENT_NAME,
  KEY_CODE,
  MOUSE_EVENT,
  SCREEN_IS_LOCK,
  POINT_LOCK_EVENT_NAME,
} from '@/configs';
import Component from '@/core/Component';
import { Man } from '../character';
import { Ammo } from '@/core/ammo';
import Weapon from './Weapon';

import type Core from '../index';
import type ActionEvent from '../events/ActionEvent';
import type PointLock from '../events/PointLock';
import type PlayPhysics from './PlayPhysics';
import type {
  Vector3 as Vector3Type,
  AnimationMixer as AnimationMixerType,
} from 'three';

export default class PlayControl extends Component {
  private _instance: Core;
  private _speed: number;
  private _firstPerson: boolean;
  private _canJump: boolean;
  private _mixer!: AnimationMixerType;
  private _currentAction: string;
  private _event: ActionEvent;
  private _body!: Ammo.btRigidBody;
  private _physicsWorld!: PlayPhysics;
  private _weapon: Weapon;
  private _angle: { x: number; y: number };
  private _isLock: boolean;

  public position: Vector3Type;
  public character: Man;
  public name: string;
  public xAxis = new Quaternion();
  public yAxis = new Quaternion();

  constructor(instance: Core) {
    super();
    this.name = 'playControl';
    this._instance = instance;
    this._event = Events.getStance().getEvent(ACTION_EVENT_NAME) as ActionEvent;
    this.position = new Vector3(3, 3, 0);
    this._firstPerson = true;
    this._speed = 5;
    this._currentAction = 'idle';
    this._canJump = false;
    this._isLock = false;
    this._angle = {
      x: 0,
      y: 0,
    };

    // default Character
    this.character = new Man();
    this._weapon = new Weapon(instance);
  }

  initialize() {
    this._physicsWorld = this.getComponent('playPhysics')! as PlayPhysics;
    this._body = this._physicsWorld.body!;
    this._mixer = new AnimationMixer(this.character.person);

    this._setupEvents();
    this._switchVisual();
    this._weapon.initialize();
  }

  async load() {
    const model = await this.character.load();
    await this._weapon.load();

    this._instance.scene.add(model);
    return model;
  }

  update(time: number) {
    const ms = this._body.getMotionState();
    this._updatePlayer(time);

    if (ms) {
      const transform = new Ammo.btTransform();
      const position = transform.getOrigin();
      ms.getWorldTransform(transform);

      this._instance.camera.position.set(
        position.x(),
        position.y(),
        position.z()
      );

      this._instance.camera.quaternion.copy(
        new Quaternion().multiplyQuaternions(this.xAxis, this.yAxis).normalize()
      );

      /**
       * TODO: 第三人称
       */
      // this.character.person.position.copy(this._instance.camera.position);
      // this.character.person.quaternion.copy(
      //   new Quaternion().multiplyQuaternions(this.yAxis, this.xAxis).normalize()
      // );

      this._updateAction(time);
      this._weapon.update(time);
      this._instance.camera.updateMatrix();
    }
  }

  private _updatePlayer(time: number) {
    const distance = new Vector3(0, 0, 0);
    const velocity = this._body.getLinearVelocity();

    if (this._event.downDowning.KeyW) {
      distance
        .set(0, 0, -1)
        .multiplyScalar(this._speed)
        .applyQuaternion(this.xAxis);
    }
    if (this._event.downDowning.KeyS) {
      distance
        .set(0, 0, 1)
        .applyQuaternion(this.xAxis)
        .multiplyScalar(this._speed);
    }
    if (this._event.downDowning.KeyA) {
      distance
        .set(-1, 0, 0)
        .applyQuaternion(this.xAxis)
        .multiplyScalar(this._speed);
    }
    if (this._event.downDowning.KeyD) {
      distance
        .set(1, 0, 0)
        .applyQuaternion(this.xAxis)
        .multiplyScalar(this._speed);
    }

    if (this._canJump) {
      velocity.setY(4);
      this._physicsWorld.canJump = false;
      this._canJump = false;
    }

    velocity.setZ(distance.z);
    velocity.setX(distance.x);

    this._body.setLinearVelocity(velocity);
  }

  private _switchVisual() {
    this._firstPerson = !this._firstPerson;
    this.character.person.visible = !this.character.person.visible;
  }

  _updateAction(time: number) {
    let nextAction: string = '';
    if (
      this._event.downDowning.KeyW ||
      this._event.downDowning.KeyA ||
      this._event.downDowning.KeyD
    ) {
      nextAction = 'walk';
    } else if (this._event.downDowning.KeyS) {
      nextAction = 'backward';
    } else if (this._canJump) {
      nextAction = 'idle';
    } else {
      nextAction = 'jump';
    }

    if (this._currentAction !== nextAction) {
      this._mixer
        .clipAction(this.character.actions[this._currentAction])
        ?.fadeOut(0.1);
      this._mixer
        .clipAction(this.character.actions[nextAction])
        ?.reset()
        .play()
        .fadeIn(0.1);
    }
    this._currentAction = nextAction;
    this._mixer.update(time);
  }

  private _setupEvents() {
    this._onMouseMove();
    this._onKeyDown();
    this._screenLock();
  }

  private _onMouseMove() {
    const mouseSpeed = 0.0015;
    this._event.addEventListener(MOUSE_EVENT, ({ message }) => {
      if (!this._isLock) return;
      this._angle.x -= message.movementX * mouseSpeed;
      this._angle.y -= message.movementY * mouseSpeed;

      // 沿x轴
      this._angle.y = Math.max(
        Math.min(this._angle.y, Math.PI / 2),
        -Math.PI / 2
      );

      this.xAxis
        .setFromAxisAngle(new Vector3(0, 1, 0), this._angle.x)
        .normalize();
      this.yAxis
        .setFromAxisAngle(new Vector3(1, 0, 0), this._angle.y)
        .normalize();
    });
  }

  private _onKeyDown() {
    this._event.addEventListener(KEY_CODE, ({ message }) => {
      if (!this._isLock) return;
      const { code, event } = message;
      if (event && event.repeat) return;
      switch (code) {
        case 'Space':
          this._canJump = this._physicsWorld.canJump;
          break;
        case 'KeyV':
          this._switchVisual();
          break;
        case 'Pick':
          this._weapon.switchState(true);
      }
    });
  }

  private _screenLock() {
    const handle = Events.getStance().getEvent(
      POINT_LOCK_EVENT_NAME
    ) as PointLock;
    handle.addEventListener(SCREEN_IS_LOCK, ({ message }) => {
      this._isLock = message;
    });
  }
}
