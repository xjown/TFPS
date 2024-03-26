import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export const loadGLTF = async (
  url: string,
  progress?: (progress: number) => void
) => {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (res) => {
        resolve(res);
      },
      (xhr) => {
        progress && progress((xhr.loaded / xhr.total) * 100);
      },
      (err) => {
        reject(err);
      }
    );
  });
};
