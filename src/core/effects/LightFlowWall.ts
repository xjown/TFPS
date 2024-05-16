import Effect from './Effect';
import { lightFLowFragment, lightFLowVertex } from '../glsl';

import type {
  BufferGeometry as BufferGeometryType,
  Mesh as MeshType,
  ShaderMaterial as ShaderMaterialType,
} from 'three';
export default class LightFlowWall extends Effect {
  private _shape: BufferGeometryType;
  private _material!: ShaderMaterialType;
  private _mesh!: MeshType;

  constructor(radius: number, height: number) {
    super();
    this._shape = new CylinderGeometry(radius, radius, height, 32, 1, true);
    this._material = new ShaderMaterial({
      uniforms: {
        iTime: {
          value: 1.0,
        },
      },
      vertexShader: lightFLowVertex,
      fragmentShader: lightFLowFragment,
      side: DoubleSide,
      depthTest: false,
      blending: AdditiveBlending,
    });

    this._mesh = new Mesh(this._shape, this._material);
    this._mesh.rotateY(Math.PI / 7);
  }

  get mesh() {
    return this._mesh;
  }

  set mesh(_) {
    throw new Error();
  }

  update(time: number): void {
    this._material.uniforms['iTime'].value += time;
  }

  dispose() {
    this.mesh.removeFromParent();
  }
}
