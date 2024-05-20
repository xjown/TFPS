import Events from '../events';
import { ACTION_EVENT_NAME, KEY_CODE } from '@/configs';
import Component from '@/core/Component';
import { Man } from '../character';
import { Ammo } from '@/core/ammo';
import Weapon from './Weapon';

import UI from '../ui';
import type Core from '../index';
import type ActionEvent from '../events/action';
import type Collision from '../collision';
import type { World } from '../world';
import type PlayPhysics from './PlayPhysics';
import type {
  Box3 as Box3Type,
  Line3 as Line3Type,
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
  private _frameBox: Box3Type;
  private _frameLine: Line3Type;
  private _onFloor: boolean;
  private _downDistance: Vector3Type;
  private _mixer!: AnimationMixerType;
  private _currentAction: string;
  private _event: ActionEvent;
  private _worldEntity!: World;
  private _body!: Ammo.btRigidBody;
  private _physicsWorld!: PlayPhysics;
  private _weapon: Weapon;
  private _ui!: UI;

  public position: Vector3Type;
  public character: Man;
  public name: string;

  constructor(instance: Core) {
    super();
    this.name = 'playControl';
    this._instance = instance;
    this._event = Events.getStance().getEvent(ACTION_EVENT_NAME) as ActionEvent;
    this.position = new Vector3(0, 0, 0);
    this._frameBox = new Box3();
    this._frameLine = new Line3();
    this._speed = 6;
    this._currentAction = 'idle';
    this._downDistance = new Vector3(0, 0, 0);
    this._onFloor = true;
    this._weapon = new Weapon(instance, this._event);

    // default Character
    this.character = new Man();
  }

  initialize() {
    this._ui = this.FindEntity('ui')?.getComponent('ui') as UI;
    this._physicsWorld = this.getComponent('playPhysics')! as PlayPhysics;
    this._worldEntity = this.FindEntity('world')?.getComponent(
      'world'
    ) as World;
    this._body = this._physicsWorld.body!;

    this._createPlayer();
    this._setupEvents();
    this._switchVisual();
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
      }
    });
  }

  physicsUpdate(world: Ammo.btDynamicsWorld, timeStep: number): void {
    const ms = this._body.getMotionState();
    if (ms) {
      const transform = new Ammo.btTransform();
      ms.getWorldTransform(transform);
      // 调整摄像机
      const cameraDistance = new Vector3().subVectors(
        new Vector3(
          transform.getOrigin().x(),
          transform.getOrigin().y(),
          transform.getOrigin().z()
        ),
        this._instance.orbit_controls.target
      );
      this._player.position.set(
        transform.getOrigin().x(),
        transform.getOrigin().y(),
        transform.getOrigin().z()
      );

      // const cameraDistance = new Vector3().subVectors(
      //   this.position,
      //   this._instance.orbit_controls.target
      // );

      this._instance.orbit_controls.target.copy(
        new Vector3(
          transform.getOrigin().x(),
          transform.getOrigin().y(),
          transform.getOrigin().z()
        )
      );

      // this._instance.orbit_controls.target.copy(this.position);

      this._updateAction(timeStep, {
        x: transform.getOrigin().x(),
        y: transform.getOrigin().y(),
        z: transform.getOrigin().z(),
      });

      this._instance.camera.position.add(cameraDistance);
      this._instance.camera.updateMatrix();
    }
  }

  update(time: number) {
    // this.position.set(
    //   this._player.position.x,
    //   this._player.position.y,
    //   this._player.position.z
    // );

    if ((this._worldEntity as World).getCollision().collisions) {
      // this._checkCollision(time);
      this._updatePlayer(time);
    }

    // action
    // this._updateAction(time);

    // // 调整摄像机
    // const cameraDistance = new Vector3().subVectors(
    //   this._player.position,
    //   this._instance.orbit_controls.target
    // );
    // this._instance.orbit_controls.target.copy(this._player.position);
    // this._instance.camera.position.add(cameraDistance);
    // this._instance.camera.updateMatrix();
  }

  private _updatePlayer(time: number) {
    const angle = this._instance.orbit_controls.getAzimuthalAngle();
    const rotation = new Vector3(0, 0, 0);

    // this._downDistance.y = this._onFloor ? 0 : this._gravity * time * -1;

    // this._player.position.add(this._downDistance);

    if (this._event.downDowning.KeyW) {
      rotation.set(0, 0, -1).applyAxisAngle(new Vector3(0, 1, 0), angle);
    }
    if (this._event.downDowning.KeyS) {
      rotation.set(0, 0, 1).applyAxisAngle(new Vector3(0, 1, 0), angle);
    }
    if (this._event.downDowning.KeyA) {
      rotation.set(-1, 0, 0).applyAxisAngle(new Vector3(0, 1, 0), angle);
    }
    if (this._event.downDowning.KeyD) {
      rotation.set(1, 0, 0).applyAxisAngle(new Vector3(0, 1, 0), angle);
    }

    const currentPos = rotation.clone().multiplyScalar(this._speed);

    const physicsPos = new Ammo.btVector3(
      currentPos.x,
      currentPos.y,
      currentPos.z
    );
    this._body.setLinearVelocity(physicsPos);
    this._body.setAngularVelocity(new Ammo.btVector3(0, angle, 0));

    // this._player.position.addScaledVector(rotation, this._speed * time);

    //此处必须更新。默认为自动更新，但是会慢一拍。如果不更新会导致计算距离不准确
    // 详情 _checkCollision()方法 => moveStance变量
    // this._player.updateMatrixWorld();
  }

  private _switchVisual() {
    if (!this._basePlayerInfo.firstPerson) {
      this._instance.camera.position
        .sub(this._instance.orbit_controls.target)
        .normalize()
        .multiplyScalar(10)
        .add(this._instance.orbit_controls.target);
      this._instance.orbit_controls.maxPolarAngle = Math.PI / 2;
      this._instance.orbit_controls.minDistance = 1;
      this._instance.orbit_controls.maxDistance = 20;
      this.character.person.visible = true;
    } else {
      this._instance.camera.position
        .sub(this._instance.orbit_controls.target)
        .normalize();
      this._instance.camera.position.x /= 10;
      this._instance.camera.position.y /= 10;
      this._instance.camera.position.z /= 10;
      this._instance.camera.position.add(this._instance.orbit_controls.target);
      this._instance.orbit_controls.maxPolarAngle = Math.PI;
      this._instance.orbit_controls.minDistance = 1e-4;
      this._instance.orbit_controls.maxDistance = 1e-4;
      this.character.person.visible = false;
    }
    this._basePlayerInfo.firstPerson = !this._basePlayerInfo.firstPerson;
  }

  private _checkCollision(time: number) {
    const collisionComponent: Collision = (
      this._worldEntity as World
    ).getCollision();

    this._frameBox.makeEmpty();
    this._frameLine.set(new Vector3(0, 0, 0), new Vector3(0, -3, 0));

    this._frameLine.start.applyMatrix4(this._player.matrixWorld);
    this._frameLine.end.applyMatrix4(this._player.matrixWorld);

    this._frameBox.expandByPoint(this._frameLine.start);
    this._frameBox.expandByPoint(this._frameLine.end);

    this._frameBox.max.addScalar(this._basePlayerInfo.radius);
    this._frameBox.min.addScalar(-this._basePlayerInfo.radius);

    collisionComponent.collisions?.geometry?.boundsTree?.shapecast({
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

  _updateAction(time: number, pos: { x: number; y: number; z: number }) {
    let angle: number = Math.PI;
    let nextAction: string = '';
    const cameraAngle = this._instance.orbit_controls.getAzimuthalAngle();
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

    characterAngle.setFromAxisAngle(new Vector3(0, 1, 0), cameraAngle + angle);
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
