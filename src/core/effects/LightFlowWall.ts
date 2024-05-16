import Effect from './Effect';
import { LIGHT_FLOW_TEXTURE } from '@/configs';
import { lightFLowFragment, lightFLowVertex } from '../glsl';

import type {
  BufferGeometry as BufferGeometryType,
  Mesh as MeshType,
} from 'three';
export default class LightFlowWall extends Effect {
  private _shape: BufferGeometryType;
  private _material!: ShaderMaterial;
  public mesh!: MeshType;

  constructor(radius: number, height: number) {
    super();
    this._shape = new CylinderGeometry(radius, radius, height, 32, 1, true);
  }

  async load() {
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

    this.mesh = new Mesh(this._shape, this._material);

    this.mesh.position.set(20, 2, -15);

    return Promise.resolve();
  }

  update(time: number): void {
    this._material.uniforms['iTime'].value += time;
  }
}
