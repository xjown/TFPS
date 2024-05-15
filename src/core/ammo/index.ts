import { ConvexHull } from 'three/examples/jsm/math/ConvexHull';
import Ammo from 'ammo.js';
import { Object3D } from 'three';

class AmmoHelper {
  static init(callback = () => {}) {
    // @ts-ignore
    Ammo.bind(Ammo)(Ammo).then(() => {
      callback();
    });
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
    return shape;
  }
}

function createConvexGeom(object: Object3D) {
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
