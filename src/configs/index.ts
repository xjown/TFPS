export * from './define';

export const BORDER_TEXTURE = new URL(
  '../assets/models/level.glb',
  import.meta.url
).href;

export const CHARACTER_URL = new URL(
  '../assets/models/character.fbx',
  import.meta.url
).href;

export const LIGHT_FLOW_TEXTURE = new URL(
  '../assets/images/linearGradient.png',
  import.meta.url
).href;

export const DECAL_A = new URL('../assets/ak47/decal_a.jpg', import.meta.url)
  .href;
export const DECAL_C = new URL('../assets/ak47/decal_c.jpg', import.meta.url)
  .href;
export const DECAL_N = new URL('../assets/ak47/decal_n.jpg', import.meta.url)
  .href;

export const GUN = new URL('../assets/ak47/gun.glb', import.meta.url).href;
export const GUN_HAND = new URL('../assets/ak47/ak47.glb', import.meta.url)
  .href;
export const GUN_FLASH = new URL(
  '../assets/ak47/muzzle_flash.glb',
  import.meta.url
).href;
export const GUN_SOUND = new URL(
  '../assets/sounds/ak47_shot.wav',
  import.meta.url
).href;

export const CHARACTER_WALK_URL = new URL(
  '../assets/animates/Walking_31_k50.fbx',
  import.meta.url
).href;

export const CHARACTER_JUMP_URL = new URL(
  '../assets/animates/Jumping_17_k50.fbx',
  import.meta.url
).href;

export const CHARACTER_RUNNING_URL = new URL(
  '../assets/animates/Run_16_k50.fbx',
  import.meta.url
).href;

export const CHARACTER_IDLE_URL = new URL(
  '../assets/animates/Idle_59_k50.fbx',
  import.meta.url
).href;

export const CHARACTER_BACKWARD_URL = new URL(
  '../assets/animates/Backwards_25_k50.fbx',
  import.meta.url
).href;
