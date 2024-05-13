import {
  MeshBVH,
  StaticGeometryGenerator,
  MeshBVHHelper,
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
} from 'three-mesh-bvh';

import type { Object3D as Object3DType, Mesh as MeshType } from 'three';
import type { MeshBVHOptions } from 'three-mesh-bvh';

export default class Collision {
  collisions!: MeshType;
  collisionsHelper!: MeshBVHHelper;
  rayCastGroup: MeshType[] = [];

  addRaycast(item: MeshType) {
    item.raycast = acceleratedRaycast;
    item.geometry.computeBoundsTree = computeBoundsTree;
    item.geometry.disposeBoundsTree = disposeBoundsTree;
    item.geometry.computeVertexNormals();
    item.geometry.computeBoundsTree();
    this.rayCastGroup.push(item);
  }

  calculateBound(scene: Object3DType) {
    const geometry = new StaticGeometryGenerator(scene);

    geometry.attributes = ['position'];

    const collision = geometry.generate();

    collision.boundsTree = new MeshBVH(collision, {
      lazyGeneration: false,
    } as MeshBVHOptions);

    this.collisions = new Mesh(collision);

    this.collisionsHelper = new MeshBVHHelper(this.collisions, 2);
    this.collisionsHelper.opacity = 0.8;
  }
}
