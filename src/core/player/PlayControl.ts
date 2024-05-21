import Events from '../events';
import { ACTION_EVENT_NAME, KEY_CODE, MOUSE_EVENT } from '@/configs';
import Component from '@/core/Component';
import { Man } from '../character';
import { Ammo } from '@/core/ammo';
import Weapon from './Weapon';

import type Core from '../index';
import type ActionEvent from '../events/action';
import type { World } from '../world';
import type PlayPhysics from './PlayPhysics';
import type {
  Mesh as MeshType,
  BufferGeometry as BufferGeometryType,
  MeshBasicMaterial as MeshBasicMaterialType,
  Vector3 as Vector3Type,
  AnimationMixer as AnimationMixerType,
} from 'three';

export default class PlayControl extends Component {
  private _instance: Core;
  private _player!: MeshType<BufferGeometryType, MeshBasicMaterialType>;
  private _speed: number;
  private _basePlayerInfo = {
    radius: 1,
    firstPerson: true,
  };
  private _onFloor: boolean;
  private _mixer!: AnimationMixerType;
  private _currentAction: string;
  private _event: ActionEvent;
  private _worldEntity!: World;
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
    this._speed = 6;
    this._currentAction = 'idle';
    this._onFloor = true;
    this._weapon = new Weapon(instance);
    this._angle = {
      x: 0,
      y: 0,
    };

    // default Character
    this.character = new Man();
  }

  initialize() {
    this._physicsWorld = this.getComponent('playPhysics')! as PlayPhysics;
    this._worldEntity = this.FindEntity('world')?.getComponent(
      'world'
    ) as World;
    this._body = this._physicsWorld.body!;

    this._createPlayer();
    this._setupEvents();
    this._switchVisual();
    this._weapon.initialize();
  }

  async load() {
    const model = await this.character.load();
    const { ak_scene, flash_scene } = await this._weapon.load();

    this._instance.scene.add(model);
    this._instance.scene.add(ak_scene);
    this._instance.scene.add(flash_scene);

    return model;
  }

  _createPlayer() {
    this._player = new Mesh(
      new CylinderGeometry(
        this.character.size.z,
        this.character.size.z,
        this.character.size.y
      ),
      new MeshBasicMaterial({ color: 0x00ff00 })
    );

    this._mixer = new AnimationMixer(this.character.person);
    this._mixer.clipAction(this.character.actions['idle']).play();

    this._player.visible = false;
    this._player.position.set(
      this.position.x,
      this.position.y,
      this.position.z
    );

    this._instance.scene.add(this._player);
  }

  private _setupEvents() {
    const mouseSpeed = 0.004;

    this._event.addEventListener(KEY_CODE, ({ message }) => {
      const { code, event } = message;
      if (event && event.repeat) return;
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
        case 'Pick':
          this._weapon.switchState(true);
      }
    });

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

  physicsUpdate(world: Ammo.btDynamicsWorld, timeStep: number): void {
    const ms = this._body.getMotionState();
    if (ms) {
      const transform = new Ammo.btTransform();
      const position = transform.getOrigin();
      const rotation = transform.getRotation();

      ms.getWorldTransform(transform);
      // this._player.position.set(
      //   transform.getOrigin().x(),
      //   transform.getOrigin().y(),
      //   transform.getOrigin().z()
      // );

      this._instance.camera.position.set(
        position.x(),
        position.y(),
        position.z()
      );

      this._instance.camera.quaternion.copy(
        new Quaternion().multiplyQuaternions(this.xAxis, this.yAxis).normalize()
      );

      this._updateAction(timeStep, {
        x: position.x(),
        y: position.y(),
        z: position.z(),
      });

      this._instance.camera.updateMatrix();
    }
  }

  update(time: number) {
    if ((this._worldEntity as World).getCollision().collisions) {
      this._updatePlayer(time);
    }

    this._instance.camera.updateMatrix();
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
    if (!this._basePlayerInfo.firstPerson) {
      this.character.person.visible = true;
    } else {
      this.character.person.visible = false;
    }
    this._basePlayerInfo.firstPerson = !this._basePlayerInfo.firstPerson;
  }

  _updateAction(time: number, pos: { x: number; y: number; z: number }) {
    let angle: number = Math.PI;
    let nextAction: string = '';
    const characterAngle = new Quaternion().copy(
      this.character.person.quaternion
    );

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
        .clipAction(this.character.actions[this._currentAction])
        ?.fadeOut(0.1);
      this._mixer
        .clipAction(this.character.actions[nextAction])
        ?.reset()
        .play()
        .fadeIn(0.1);
    }

    // characterAngle.setFromAxisAngle(new Vector3(0, 1, 0), cameraAngle + angle);
    this.character.person.quaternion.slerp(characterAngle, 0.2);
    // this.character.person.position
    //   .applyMatrix4(this._player.matrixWorld)
    //   .copy(this._player.position.clone());

    this.character.person.position.set(pos.x, pos.y + 1, pos.z);

    this.character.person.translateY(-4);

    this._currentAction = nextAction;

    this._mixer.update(time);
  }
}
