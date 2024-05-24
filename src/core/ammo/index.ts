import { ConvexHull } from 'three/examples/jsm/math/ConvexHull';
import Ammo from 'ammo.js';
import { Object3D } from 'three';

class AmmoHelper {
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

  // 物体不会移动,但会对其他物体施加力。
  static CF_STATIC_OBJECT: number = 1;

  // 将物体标记为运动学物体，运动学物体由用户代码移动，而不是由物理引擎模拟。
  static CF_KINEMATIC_OBJECT: number = 2;

  // 物体本身不受碰撞影响，不会产生移动、旋转等物理响应。但它仍能检测和报告与其他物体的碰撞。
  static CF_NO_CONTACT_RESPONSE: number = 4;

  // 将物体标记为角色对象，可以用于角色控制器。
  static CF_CHARACTER_OBJECT: number = 16;

  static init(callback = () => {}) {
    // @ts-ignore
    Ammo.bind(Ammo)(Ammo).then(() => {
      callback();
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
    ghostObj.setCollisionFlags(this.CF_NO_CONTACT_RESPONSE);
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
