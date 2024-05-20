import { KEY_CODE } from '@/configs';
import nipplejs from 'nipplejs';

export type allowKeyDownType = 'KeyW' | 'KeyS' | 'KeyA' | 'KeyD';

export default class ActionEvent extends EventDispatcher<{
  [KEY_CODE]: { message: { code: string; event?: KeyboardEvent } };
}> {
  downDowning: { [key in allowKeyDownType]: boolean } = {
    KeyW: false,
    KeyA: false,
    KeyD: false,
    KeyS: false,
  };
  private _allowKeyDown: allowKeyDownType[] = [
    'KeyW',
    'KeyS',
    'KeyA',
    'KeyD',
  ] as const;

  constructor() {
    super();
  }

  bindEvent(controlHandle: HTMLElement) {
    if ('ontouchstart' in window) {
    } else {
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
    control.on('move', (res, data) => {
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
    });
    control.on('end', () => {
      this._resetKey();
    });
  }

  private _resetKey() {
    let i: allowKeyDownType;
    for (i of this._allowKeyDown) {
      this.downDowning[i] = false;
    }
  }

  private _keyup(event: KeyboardEvent) {
    const { code } = event;
    if (
      this._allowKeyDown.includes(code as (typeof this._allowKeyDown)[number])
    ) {
      this.downDowning[code as allowKeyDownType] = false;
    }
  }

  private _keydown(event: KeyboardEvent) {
    const { code } = event;
    if (
      this._allowKeyDown.includes(code as (typeof this._allowKeyDown)[number])
    ) {
      this.downDowning[code as allowKeyDownType] = true;
    } else {
      this.actionEvent(code, event);
    }
  }

  actionEvent(code: string, event?: KeyboardEvent) {
    this.dispatchEvent({ type: KEY_CODE, message: { code, event } });
  }
}
