import '@/assets/css/index.css';
import Events from '../events';
import {
  UI_EVENT_NAME,
  STATIC_LOADED,
  LOAD_PROCESS,
  ACTION_EVENT_NAME,
} from '@/configs';

import type UIEvents from '../events/ui';
import type ActionEvent from '../events/action';
export default class UI {
  private _event: UIEvents;
  private _actionEvent: ActionEvent;
  private _loadingHandle: HTMLElement;
  constructor() {
    this._event = Events.getStance().getEvent(UI_EVENT_NAME);
    this._actionEvent = Events.getStance().getEvent(ACTION_EVENT_NAME);
    this._loadingHandle = document.getElementById('loading')!;
    this._manageLoad();
    this._loadingOff();
  }

  _loadingOff() {
    this._event.addEventListener(STATIC_LOADED, () => {
      const controlHandle = this._createControl();
      this._actionEvent.bindEvent(controlHandle);
      this._loadingHandle.style.display = 'none';
    });
  }

  _manageLoad() {
    const loadingText: HTMLElement = document.getElementById('loading-text')!;
    const loadName = document.createElement('p');
    loadingText.innerHTML = `<div class="g-progress" id="g-progress" style="--progress: 0%"></div>`;
    loadingText.appendChild(loadName);
    loadName.style.lineHeight = '30px';
    const progress: HTMLElement = document.getElementById('g-progress')!;
    this._event.addEventListener(LOAD_PROCESS, ({ message }) => {
      const { url, itemsLoaded, itemsTotal } = message;
      if (itemsLoaded / itemsTotal >= 1) {
        progress.setAttribute('style', `--progress: 0%`);
      } else {
        progress.setAttribute(
          'style',
          `--progress: ${(itemsLoaded / itemsTotal) * 100}%`
        );
      }
      loadName.innerText = `正在加载${url.split('/').pop()}`;
    });
  }

  _createControl() {
    const control = document.createElement('div');
    control.setAttribute('class', 'position-control');
    document.body.appendChild(control);
    return control;
  }
}
