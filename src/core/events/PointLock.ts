import { WARNING_MSG } from '@/configs';

export default class PointLock extends EventDispatcher<{
  [WARNING_MSG]: { message: string };
}> {
  constructor() {
    super();
    this._init();
  }

  _init() {
    const havePointerLock =
      'pointerLockElement' in document ||
      'mozPointerLockElement' in document ||
      'webkitPointerLockElement' in document;

    if (havePointerLock) {
      document.body.requestPointerLock =
        document.body.requestPointerLock ||
        document.mozRequestPointerLock ||
        document.webkitRequestPointerLock;
      document.addEventListener('click', () => {
        document.body.requestPointerLock();
      });
    } else {
      this.dispatchEvent({
        type: WARNING_MSG,
        message: 'This browser does not support “pointerLockElement”',
      });
    }
  }
}
