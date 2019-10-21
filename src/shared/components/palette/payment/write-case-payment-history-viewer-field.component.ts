import { Component, OnInit } from '@angular/core';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { AbstractAppConfig } from '../../../../app.config';
import { FormControl } from '@angular/forms';
// import { FormControl, FormGroup, FormArray } from '@angular/forms';

@Component({
  selector: 'ccd-write-case-payment-history-viewer-field',
  templateUrl: './write-case-payment-history-viewer-field.html'
})
export class WriteCasePaymentHistoryViewerFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  paymentStatus: FormControl;

  constructor(
    private appConfig: AbstractAppConfig
  ) {
    super();
  }

  getBaseURL() {
    return this.appConfig.getPaymentsUrl();
  }

  ngOnInit(): void {
    this.paymentStatus = this.registerControl(new FormControl({ value: '', disabled: true }, [this.paymentStatusValidator]));
  }

  paymentStatusValidator(control: FormControl) {
    let paymentStatus = control.value;
    if (paymentStatus !== 'SUCCESS') {
      return {
        paymentStatusDomain: {
          parsedPaymentStatus: paymentStatus
        }
      }
    }
    return null;
  }

  processPaymentStatus(paymentStatus) {
    this.paymentStatus.setValue(paymentStatus);
  }
}
