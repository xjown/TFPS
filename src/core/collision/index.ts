import type { Object3D as Object3DType, Mesh as MeshType } from 'three';
import {
  MeshBVH,
  StaticGeometryGenerator,
  MeshBVHHelper,
} from 'three-mesh-bvh';
export default class Collision {
  collisions!: MeshType;
  collisionsHelper!: MeshBVHHelper;
  private _children!: Object3DType;

  addGroup(child: Object3DType) {
    this._children = child;
  }

  calculateBound() {
    const geometry = new StaticGeometryGenerator(this._children);

    geometry.attributes = ['position'];
    const collision = geometry.generate();
    collision.boundsTree = new MeshBVH(collision, {
      onProgress: (progress) => {
        if (progress == 1) {
        }
      },
    });

    this.collisions = new Mesh(collision);
    this.collisionsHelper = new MeshBVHHelper(this.collisions, 10);
    this.collisionsHelper.opacity = 0.8;
  }
}
