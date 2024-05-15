export function boxHelper(size: { x: number; y: number; z: number }) {
  const box = new BoxGeometry(size.x, size.y, size.z);
  const mart = new MeshBasicMaterial({ color: 0x00ff00 });
  const mesh = new Mesh(box, mart);
  return mesh;
}
