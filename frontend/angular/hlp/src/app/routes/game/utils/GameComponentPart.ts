import { Observable } from 'rxjs';
export interface ComponentPart {

  // emit an event true when the component is destroyed
  destroyObeservable: Observable<boolean>;

}
