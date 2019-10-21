import { NgModule } from '@angular/core';
import { ReadCasePaymentHistoryViewerFieldComponent } from './read-case-payment-history-viewer-field.component';
import { WriteCasePaymentHistoryViewerFieldComponent } from './write-case-payment-history-viewer-field.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PaletteUtilsModule } from '../utils/utils.module';
import { PaymentLibModule } from '@hmcts/ccpay-web-component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PaletteUtilsModule,
    PaymentLibModule,
  ],
  declarations: [
    ReadCasePaymentHistoryViewerFieldComponent,
    WriteCasePaymentHistoryViewerFieldComponent,
  ],
  entryComponents: [
    ReadCasePaymentHistoryViewerFieldComponent,
    WriteCasePaymentHistoryViewerFieldComponent,
  ]
})
export class CasePaymentHistoryViewerModule {}
