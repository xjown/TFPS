export type VisibleModeType = 'pc' | 'mobile';
export type allowKeyDownType = 'KeyW' | 'KeyS' | 'KeyA' | 'KeyD';
export default class ActionEvent extends EventDispatcher {
  mode: VisibleModeType = 'pc';
  downDowning: { [key in allowKeyDownType]: boolean } = {
    KeyW: false,
    KeyA: false,
    KeyD: false,
    KeyS: false,
  };
  private _allowKeyDown: allowKeyDownType[] = ['KeyW', 'KeyS', 'KeyA', 'KeyD'];
  constructor() {
    super();
    this._bindEvent();
  }

  private _bindEvent() {
    if ('ontouchstart' in window) {
      this.mode = 'mobile';
      // ....
    } else {
      this.mode = 'pc';
      window.addEventListener('keydown', this._keydown.bind(this));
      window.addEventListener('keyup', this._keyup.bind(this));
    }
  }
  private _keyup(event: KeyboardEvent) {
    const { code } = event;
    if (this._allowKeyDown.includes(code)) {
      this.downDowning[code as allowKeyDownType] = false;
    }
  }
  private _keydown(event: KeyboardEvent) {
    const { code } = event;
    if (this._allowKeyDown.includes(code)) {
      this.downDowning[code as allowKeyDownType] = true;
    } else {
      this._actionEvent(code);
    }
  }

  private _actionEvent(code: string) {
    this.dispatchEvent({ type: 'action', message: { code } });
  }
}
