import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { WindowService } from '../../../services';

import { ComponentCanDeactivate } from '../domain';

@Injectable()
export class UnsavedChangesGuard implements CanDeactivate<ComponentCanDeactivate> {

  private static readonly OPTIONS = 'Press Cancel to go back and save these changes, or OK to lose these changes.';
  public static readonly CONFIRM_MESSAGE = `You have unsaved changes. ${UnsavedChangesGuard.OPTIONS}`;

  constructor(private readonly windowService: WindowService) {}

  canDeactivate(component: ComponentCanDeactivate) {
    if (component && !component.canDeactivate()) {
      return this.windowService.confirm(UnsavedChangesGuard.CONFIRM_MESSAGE);
    }
    return true;
  }

}
