import { KEY_CODE, UI_POSITION_CONTROL } from '@/configs';
import nipplejs from 'nipplejs';

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
  private _allowKeyDown: string[] = ['KeyW', 'KeyS', 'KeyA', 'KeyD'];
  constructor() {
    super();
  }

  bindEvent(controlHandle: HTMLElement) {
    if ('ontouchstart' in window) {
      this.mode = 'mobile';
    } else {
      this.mode = 'pc';
      window.addEventListener('keydown', this._keydown.bind(this));
      window.addEventListener('keyup', this._keyup.bind(this));
    }
    this._initControl(controlHandle);
  }

  private _initControl(controlHandle: HTMLElement) {
    const control = nipplejs.create({
      zone: controlHandle,
      mode: 'static',
      position: { left: '50%', top: '50%' },
    });
    control
      .on('move', (res, data) => {
        const { direction, angle } = data;
        if (!angle) return;

        const { degree } = angle;
        if (degree >= 330 || degree <= 60) {
          this._resetKey();
          this.downDowning['KeyD'] = true;
        } else if (degree >= 60 && degree <= 150) {
          this._resetKey();
          this.downDowning['KeyW'] = true;
        } else if (degree >= 150 && degree <= 240) {
          this._resetKey();
          this.downDowning['KeyA'] = true;
        } else if (degree >= 240 && degree <= 330) {
          this._resetKey();
          this.downDowning['KeyS'] = true;
        }
      })
      .on('end', () => {
        this._resetKey();
      });
  }

  private _resetKey() {
    this.downDowning['KeyD'] = false;
    this.downDowning['KeyA'] = false;
    this.downDowning['KeyW'] = false;
    this.downDowning['KeyS'] = false;
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
      this.actionEvent(code);
    }
  }

  actionEvent(code: string) {
    this.dispatchEvent({ type: KEY_CODE, message: { code } });
  }
}
