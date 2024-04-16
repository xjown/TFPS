import '@/assets/css/index.css';
import Events from '../events';
import { UI_EVENT_NAME } from '@/configs';

import type UIEvents from '../events/ui';
export default class UI {
  private _event: UIEvents = Events.getStance().getEvent(UI_EVENT_NAME);
  constructor() {
    this._manageLoad();
  }

  _manageLoad() {
    const loading: HTMLElement = document.getElementById('loading')!;
    const loadingText: HTMLElement = document.getElementById('loading-text')!;
    loadingText.innerHTML = `<div class="g-progress" id="g-progress" style="--progress: 0%"></div>`;
    const progress: HTMLElement = document.getElementById('g-progress')!;
    const that = this;
    this._event.addEventListener('load', ({ message }) => {
      const { url, itemsLoaded, itemsTotal } = message;
      if (itemsLoaded / itemsTotal >= 1) {
        loading.style.display = 'none';
        that._createControl();
      } else {
        progress.setAttribute(
          'style',
          `--progress: ${(itemsLoaded / itemsTotal) * 100}%`
        );
      }
    });
  }

  _createControl() {
    const control = document.createElement('div');
    control.setAttribute('class', 'position-control');
    document.body.appendChild(control);
    this._event.bindPositionControl(control);
  }
}
