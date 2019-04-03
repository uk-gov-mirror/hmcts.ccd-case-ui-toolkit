import { NgModule } from '@angular/core';
import { ReadDocumentAssemblerFieldComponent } from './read-document-assembler-field.component';
import { WriteDocumentAssemblerFieldComponent } from './write-document-assembler-field.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PaletteUtilsModule } from '../utils/utils.module';
import { AssemblyModule } from '@hmcts/dg-docassembly-webcomponent';
import { TransferState } from '@angular/platform-browser';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PaletteUtilsModule,
    AssemblyModule,
  ],
  declarations: [
    ReadDocumentAssemblerFieldComponent,
    WriteDocumentAssemblerFieldComponent
  ],
  entryComponents: [
    ReadDocumentAssemblerFieldComponent,
    WriteDocumentAssemblerFieldComponent
  ],
  providers: [TransferState]
})
export class DocumentAssemblerModule {}
