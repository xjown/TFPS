import Events from '../events';
import { ACTION_EVENT_NAME, KEY_CODE, MOUSE_EVENT } from '@/configs';
import Component from '@/core/Component';
import { Man } from '../character';
import { Ammo } from '@/core/ammo';
import Weapon from './Weapon';

import type Core from '../index';
import type ActionEvent from '../events/ActionEvent';
import type PlayPhysics from './PlayPhysics';
import type {
  Vector3 as Vector3Type,
  AnimationMixer as AnimationMixerType,
} from 'three';

export default class PlayControl extends Component {
  private _instance: Core;
  private _speed: number;
  private _firstPerson: boolean;
  private _onFloor: boolean;
  private _mixer!: AnimationMixerType;
  private _currentAction: string;
  private _event: ActionEvent;
  private _body!: Ammo.btRigidBody;
  private _physicsWorld!: PlayPhysics;
  private _weapon: Weapon;
  private _angle: { x: number; y: number };

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
    this.position = new Vector3(0, 0, 0);
    this._firstPerson = true;
    this._speed = 6;
    this._currentAction = 'idle';
    this._onFloor = true;
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

      this._instance.camera.updateMatrix();
    }
  }

  private _updatePlayer(time: number) {
    const distance = new Vector3(0, 0, 0);

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

    const physicsPos = new Ammo.btVector3(distance.x, distance.y, distance.z);
    this._body.setLinearVelocity(physicsPos);
    this._body.setAngularVelocity(new Ammo.btVector3(0, 0, 0));
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
    } else if (this._onFloor) {
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
  }

  private _onMouseMove() {
    const mouseSpeed = 0.004;
    this._event.addEventListener(MOUSE_EVENT, ({ message }) => {
      this._angle.x -= message.movementX * mouseSpeed;
      this._angle.y -= message.movementY * mouseSpeed;

      // 沿x轴
      this._angle.y = Math.max(Math.min(this._angle.y, Math.PI), -Math.PI / 2);
      // 沿y轴
      this._angle.x = Math.max(Math.min(this._angle.x, Math.PI), -Math.PI / 2);

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
      const { code, event } = message;
      if (event && event.repeat) return;
      switch (code) {
        case 'Space':
          break;
        case 'KeyV':
          this._switchVisual();
          break;
        case 'Pick':
          this._weapon.switchState(true);
      }
    });
  }
}
