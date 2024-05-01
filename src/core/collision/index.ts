import type { Object3D as Object3DType, Mesh as MeshType } from 'three';
import {
  MeshBVH,
  StaticGeometryGenerator,
  MeshBVHHelper,
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
} from 'three-mesh-bvh';
export default class Collision {
  collisions!: MeshType;
  collisionsHelper!: MeshBVHHelper;
  rayCastGroup: MeshType[] = [];
  private _children!: Object3DType;

  addGroup(child: Object3DType) {
    this._children = child;
  }

  addRaycast(item: MeshType) {
    item.raycast = acceleratedRaycast;
    item.geometry.computeBoundsTree = computeBoundsTree;
    item.geometry.disposeBoundsTree = disposeBoundsTree;
    item.geometry.computeVertexNormals();
    item.geometry.computeBoundsTree();
    console.log(item.geometry);
    this.rayCastGroup.push(item);
  }

  calculateBound() {
    const geometry = new StaticGeometryGenerator(this._children);

    geometry.attributes = ['position'];
    const collision = geometry.generate();
    collision.boundsTree = new MeshBVH(collision);
    this.collisions = new Mesh(collision);
    this.collisionsHelper = new MeshBVHHelper(this.collisions, 2);
    this.collisionsHelper.opacity = 0.8;
  }
}
