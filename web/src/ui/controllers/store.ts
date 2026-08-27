import { ReactiveController, ReactiveControllerHost } from 'lit';
import { ReadableAtom } from 'nanostores';

export class StoreController<T> implements ReactiveController {
  private host: ReactiveControllerHost;
  private store: ReadableAtom<T>;
  private unsubscribe?: () => void;
  public value: T;

  constructor(host: ReactiveControllerHost, store: ReadableAtom<T>) {
    this.host = host;
    this.store = store;
    this.value = store.get();
    this.host.addController(this);
  }

  hostConnected(): void {
    this.unsubscribe = this.store.subscribe((val) => {
      this.value = val;
      this.host.requestUpdate();
    });
  }

  hostDisconnected(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
  }
}
