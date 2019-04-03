import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Component } from '@angular/core';
import { AbstractAppConfig } from '../../../../app.config';

@Component({
  selector: 'ccd-read-document-assembler-field',
  templateUrl: 'read-document-assembler-field.component.html',
})
export class ReadDocumentAssemblerFieldComponent extends AbstractFieldReadComponent {

  // constructor(
  //   private appConfig: AbstractAppConfig
  // ) {
  //   super();
  // }

  getTemplateName() {
    return this.caseField.value;
  }

}
