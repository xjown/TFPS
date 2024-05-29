import { ConvexHull } from 'three/examples/jsm/math/ConvexHull';
import Ammo, { btCollisionObject } from 'ammo.js';

import type { Object3D, Vector3 } from 'three';

class AmmoHelper {
  static _startRayVector: Ammo.btVector3;
  static _endRayVector: Ammo.btVector3;
  static collisionFilterGroup = {
    // 00000001
    DefaultFilter: 1 << 0,
    // 00000010
    StaticFilter: 1 << 1,
    // 00000100
    KinematicFilter: 1 << 2,
    // 00001000
    DebrisFilter: 1 << 3,
    // 00010000
    SensorTrigger: 1 << 4,
    // 00100000
    CharacterFilter: 1 << 5,
    // 11111111
    AllFilter: -1,
  };

  static bodyActiveState = {
    // 物体受到力或碰撞影响，参与物理模拟。
    ACTIVE_TAG: 1,
    // 物体处于休眠状态，不参与物理模拟。
    ISLAND_SLEEPING: 2,
    // 物体希望被取消激活，一般用于性能优化。
    WANTS_DEACTIVATION: 3,
    // 物体不能被自动休眠，一直保持活跃。
    DISABLE_DEACTIVATION: 4,
    // 物体从模拟中完全移除。
    DISABLE_SIMULATION: 5,
  };

  static collisionFlag = {
    // 物体不会移动,但会对其他物体施加力。
    CF_STATIC_OBJECT: 1,
    // 将物体标记为运动学物体，运动学物体由用户代码移动，而不是由物理引擎模拟。
    CF_KINEMATIC_OBJECT: 2,
    // 物体本身不受碰撞影响，不会产生移动、旋转等物理响应。但它仍能检测和报告与其他物体的碰撞。
    CF_NO_CONTACT_RESPONSE: 4,
    // 将物体标记为角色对象，可以用于角色控制器。
    CF_CHARACTER_OBJECT: 16,
  };

  static init(callback = () => {}) {
    // @ts-ignore
    Ammo.bind(Ammo)(Ammo).then(() => {
      callback();

      this._endRayVector = new Ammo.btVector3(0, 0, 0);
      this._startRayVector = new Ammo.btVector3(0, 0, 0);
    });
  }

  /**
   * 不参与模拟
   * @param shape
   * @param position
   * @param angle
   * @returns
   */
  static createGhostBody(
    shape: Ammo.btCollisionShape,
    position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 },
    angle: { x: number; y: number; z: number; w: number } = {
      x: 0,
      y: 0,
      z: 0,
      w: 1,
    }
  ) {
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
    transform.setRotation(
      new Ammo.btQuaternion(angle.x, angle.y, angle.z, angle.w)
    );

    const ghostObj = new Ammo.btPairCachingGhostObject();
    ghostObj.setCollisionShape(shape);
    ghostObj.setWorldTransform(transform);
    // 物体本身不参与碰撞反应
    ghostObj.setCollisionFlags(this.collisionFlag.CF_NO_CONTACT_RESPONSE);
    ghostObj.setUserIndex(8);

    return ghostObj;
  }

  static IsTriggerOverlapping(
    ghostObj: Ammo.btGhostObject,
    rigidBody: Ammo.btRigidBody
  ) {
    for (let i = 0; i < ghostObj.getNumOverlappingObjects(); i++) {
      const body = Ammo.castObject<typeof Ammo.btRigidBody>(
        ghostObj.getOverlappingObject(i),
        Ammo.btRigidBody
      );
      if (body === rigidBody) return true;
    }

    return false;
  }

  /**
   * 建立凸包
   * @param object
   * @returns
   */
  static createConvexHullShape(object: Object3D) {
    const geometry = createConvexGeom(object);
    let coords = geometry.attributes.position.array;
    let tempVec = new Ammo.btVector3(0, 0, 0);
    let shape = new Ammo.btConvexHullShape();
    for (let i = 0, il = coords.length; i < il; i += 3) {
      tempVec.setValue(coords[i], coords[i + 1], coords[i + 2]);
      let lastOne = i >= il - 3;
      shape.addPoint(tempVec, lastOne);
    }
    return { shape, geometry };
  }

  static rayCast(
    start: Vector3,
    end: Vector3,
    physicsWorld: Ammo.btDiscreteDynamicsWorld,
    result: RayCastResultType
  ) {
    this._startRayVector.setValue(start.x, start.y, start.z);
    this._endRayVector.setValue(end.x, end.y, end.z);

    const rayCallBack = new Ammo.ClosestRayResultCallback(
      this._startRayVector,
      this._endRayVector
    );

    rayCallBack.set_m_closestHitFraction(1);
    // @ts-ignore
    rayCallBack.set_m_collisionObject(undefined);

    physicsWorld.rayTest(this._startRayVector, this._endRayVector, rayCallBack);

    if (rayCallBack.hasHit()) {
      const ps = rayCallBack.get_m_hitPointWorld();
      const nor = rayCallBack.get_m_hitNormalWorld();
      // console.log(ps.x(), ps.y(), ps.z());
      result.collisionObject = rayCallBack.get_m_collisionObject();
      result.intersectionNormal.set(nor.x(), nor.y(), nor.z());
      result.intersectionPoint.set(ps.x(), ps.y(), ps.z());
      return true;
    }
    return false;
  }
}

function createConvexGeom(object: Object3D) {
  // Compute the 3D convex hull.
  let hull = new ConvexHull().setFromObject(object);
  let faces = hull.faces;
  let vertices = [];
  let normals = [];

  for (var i = 0; i < faces.length; i++) {
    var face = faces[i];
    var edge = face.edge;
    do {
      var point = edge.head().point;
      vertices.push(point.x, point.y, point.z);
      normals.push(face.normal.x, face.normal.y, face.normal.z);
      edge = edge.next;
    } while (edge !== face.edge);
  }

  const geom = new BufferGeometry();
  geom.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  geom.setAttribute('normal', new Float32BufferAttribute(normals, 3));

  return geom;
}

export { AmmoHelper, Ammo };

export type RayCastResultType = {
  intersectionPoint: Vector3;
  intersectionNormal: Vector3;
  collisionObject?: Ammo.btCollisionObject;
};
