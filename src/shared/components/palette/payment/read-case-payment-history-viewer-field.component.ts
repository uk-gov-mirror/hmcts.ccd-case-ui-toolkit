import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Component } from '@angular/core';
import { AbstractAppConfig } from '../../../../app.config';

@Component({
  selector: 'read-ccd-case-payment-history-viewer-field',
  templateUrl: 'read-case-payment-history-viewer-field.html',
})
export class ReadCasePaymentHistoryViewerFieldComponent extends AbstractFieldReadComponent {

  constructor(
    private appConfig: AbstractAppConfig
  ) {
    super();
  }

  getBaseURL() {
    return this.appConfig.getPaymentsUrl();
  }

}
