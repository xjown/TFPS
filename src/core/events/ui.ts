import nipplejs from 'nipplejs';
import { UI_POSITION_CONTROL } from '@/configs';

export default class UIEvents extends EventDispatcher {
  constructor() {
    super();
  }

  bindPositionControl(el: HTMLElement) {
    const controlHandle = nipplejs.create({
      zone: el,
      mode: 'static',
      position: { left: '50%', top: '50%' },
    });
    controlHandle.on('move', (res, data) => {
      this.dispatchEvent({ type: UI_POSITION_CONTROL, message: data });
    });
  }
}
