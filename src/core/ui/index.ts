import '@/assets/css/index.css';
import Events from '../events';

import type UIEvents from '../events/ui';
export default class UI {
  private _event: UIEvents = Events.getStance().getEvent('UIEvents');
  constructor() {
    this._manageLoad();
  }

  _manageLoad() {
    const loading: HTMLElement = document.getElementById('loading')!;
    const loadingText: HTMLElement = document.getElementById('loading-text')!;
    loadingText.innerHTML = `<div class="g-progress" id="g-progress" style="--progress: 0%"></div>`;
    const progress: HTMLElement = document.getElementById('g-progress')!;
    this._event.addEventListener('load', ({ message }) => {
      const { url, itemsLoaded, itemsTotal } = message;
      if (itemsLoaded / itemsTotal >= 1) {
        loading.style.display = 'none';
      } else {
        progress.setAttribute(
          'style',
          `--progress: ${(itemsLoaded / itemsTotal) * 100}%`
        );
      }
    });
  }
}
