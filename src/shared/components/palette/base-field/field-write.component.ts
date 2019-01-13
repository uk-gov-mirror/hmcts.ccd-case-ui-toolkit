import {
  Component,
  ComponentFactoryResolver,
  Injector,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { PaletteService } from '../palette.service';
import { AbstractFieldWriteComponent } from './abstract-field-write.component';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FormValidatorsService } from '../../../services/form/form-validators.service';

@Component({
  selector: 'ccd-field-write',
  template: `
    <div [hidden]="!isVisible()">
      <ng-container #fieldContainer></ng-container>
    </div>
  `
})
export class FieldWriteComponent extends AbstractFieldWriteComponent implements OnInit {

  @Input()
  formGroup: FormGroup;

  @ViewChild('fieldContainer', {read: ViewContainerRef})
  fieldContainer: ViewContainerRef;

  private defaultControlRegistrer(formGroup: FormGroup,
                                   caseField: CaseField): (control: FormControl) => AbstractControl {
    return control => {
      if (formGroup.controls[caseField.id]) {
        return formGroup.get(caseField.id);
      }
      this.formValidatorsService.addValidators(caseField, control);
      formGroup.addControl(caseField.id, control);
      return control;
    };
  }

  constructor(private resolver: ComponentFactoryResolver,
              private paletteService: PaletteService,
              private formValidatorsService: FormValidatorsService) {
    super();
  }

  ngOnInit(): void {
    let componentClass = this.paletteService.getFieldComponentClass(this.caseField, true);

    let injector = Injector.create([], this.fieldContainer.parentInjector);
    let component = this.resolver.resolveComponentFactory(componentClass).create(injector);

    // Provide component @Inputs
    component.instance['caseField'] = this.caseField;
    component.instance['registerControl'] = this.registerControl
      || this.defaultControlRegistrer(this.formGroup, this.caseField);
    component.instance['idPrefix'] = this.idPrefix;
    if (this.caseField.field_type.id === 'AddressGlobal') {
      component.instance['ignoreMandatory'] = true;
    }
    component.instance['isExpanded'] = this.isExpanded;
    component.instance['mask'] = this.mask;
    let castedObject: AbstractFieldWriteComponent = <AbstractFieldWriteComponent> component.instance;
    this.processMask(this.mask, castedObject.id());
    this.fieldContainer.insert(component.hostView);
  }

  private processMask(mask: object, fieldId: string): any {
    if (mask && mask.hasOwnProperty(fieldId) && mask[fieldId]['display_context'] !== 'HIDDEN') {
      let fieldMask = mask[fieldId];
      this.caseField.display_context = fieldMask['display_context'];
      this.caseField.order = fieldMask['order'];
      this.caseField.label = this.updateFieldIfNewValuePresent(fieldMask['label'], this.caseField.label);
      this.caseField.hint_text = this.updateFieldIfNewValuePresent(fieldMask['hint_text'], this.caseField.hint_text);
      this.caseField.show_condition = this.updateFieldIfNewValuePresent(fieldMask['show_condition'], this.caseField.show_condition);
    }
  }

  private updateFieldIfNewValuePresent(fieldMaskValue: string, currentValue: string) {
    if (fieldMaskValue.trim().length > 0) {
      return fieldMaskValue;
    }
    return currentValue;
  }

  isVisible(): boolean {
    console.log('FieldId: '  + this.id()); // TODO: delete this
    console.log('Mask: ', this.mask); // TODO: delete this
    if (!this.mask) {
      return true;
    }
    let fullyQualifiedId = this.id().replace(/_/g, '.');
    // console.log(fullyQualifiedId, this.mask, this.caseField.id); // TODO: delete this

    let foundElement = this.mask.find(item => {
      return item.complex_field_id === fullyQualifiedId
    });

    if (foundElement) {
      return foundElement.display_context !== 'HIDDEN';
    } else {
      return true;
    }
  }
}
