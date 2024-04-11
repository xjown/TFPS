import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

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

export const loadFBX = async (
  url: string,
  progress?: (progress: number) => void
) => {
  return new Promise((resolve, reject) => {
    const loader = new FBXLoader();
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
