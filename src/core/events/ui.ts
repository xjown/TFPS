import { LOAD_PROCESS, STATIC_LOADED } from '@/configs';

export default class UIEvents extends EventDispatcher<{
  [LOAD_PROCESS]: {
    message: { url: string; itemsLoaded: number; itemsTotal: number };
  };
  [STATIC_LOADED]: {};
}> {
  constructor() {
    super();
  }
}
