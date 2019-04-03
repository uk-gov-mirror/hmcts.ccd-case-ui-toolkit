import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Component, OnInit } from '@angular/core';
import { templateDataString } from './template-info';

@Component({
  selector: 'ccd-write-document-assembler-field',
  templateUrl: 'write-document-assembler-field.component.html',
})
export class WriteDocumentAssemblerFieldComponent extends AbstractFieldReadComponent implements OnInit {

  // constructor(
  //   private appConfig: AbstractAppConfig
  // ) {
  //   super();
  // }
  templateName;
  templateData;
  templateDataString = templateDataString;

  ngOnInit() {
    console.log('templateDataString=', this.templateDataString);
    this.templateData = JSON.parse(this.templateDataString);
    // this.templateName = this.caseField.value;
    this.templateName = 'CV-CMC-GOR-ENG-0004-UI-Test.docx';
  }

  isDataLoaded(): boolean {
    return this.templateName && this.templateData ? true : false;
  }
}
