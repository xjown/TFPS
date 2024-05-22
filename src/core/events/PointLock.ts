import { WARNING_MSG, SCREEN_IS_LOCK } from '@/configs';

export default class PointLock extends EventDispatcher<{
  [WARNING_MSG]: { message: string };
  [SCREEN_IS_LOCK]: { message: boolean };
}> {
  private _havePointerLock: boolean;
  private _isLock: boolean;

  constructor() {
    super();
    this._havePointerLock =
      'pointerLockElement' in document ||
      'mozPointerLockElement' in document ||
      'webkitPointerLockElement' in document;
    this._isLock = false;
    this._setupEvents();
  }

  _setupEvents() {
    if (this._havePointerLock) {
      document.addEventListener('click', () => {
        document.body.requestPointerLock();
      });

      document.addEventListener('pointerlockchange', this._setLock.bind(this));
      document.addEventListener(
        'mozpointerlockchange',
        this._setLock.bind(this)
      );
      document.addEventListener(
        'webkitpointerlockchange',
        this._setLock.bind(this)
      );
    } else {
      this._setLock();
      this.dispatchEvent({
        type: WARNING_MSG,
        message: 'This browser does not support “pointerLockElement”',
      });
    }
  }

  _setLock() {
    this._isLock = !!document.pointerLockElement;

    this.dispatchEvent({
      type: SCREEN_IS_LOCK,
      message: this._isLock,
    });
  }
}
