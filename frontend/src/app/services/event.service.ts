import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable, Subject } from 'rxjs';

export class AppEvent<T> {
  constructor(public type: string, public payload: T) {}
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private eventBroker = new Subject<AppEvent<any>>();

  on<T>(type: string): Observable<AppEvent<T>> {
    return this.eventBroker.pipe(filter((e) => e.type === type));
  }

  dispatch<T>(type: string, event?: T) {
    this.eventBroker.next(new AppEvent<T | undefined>(type, event));
  }
}
