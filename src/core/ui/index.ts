import '@/assets/css/index.css';
export default class Ui {
  constructor() {
    const loadingText: HTMLElement = document.getElementById('loading-text')!;
    const loading: HTMLElement = document.getElementById('loading')!;

    loading.style.display = 'none';

    loadingText.innerHTML = `<div class="g-progress" style="--progress: 90%"></div>`;
    this._manageLoad();
  }

  _manageLoad() {}
}
