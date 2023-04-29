import { Component } from '@angular/core';

export const MockComponent = (selector: string) => {
  @Component({ selector, template: `<div id="${selector}"></div>` })
  class _MockedComponent {}

  return _MockedComponent;
};
