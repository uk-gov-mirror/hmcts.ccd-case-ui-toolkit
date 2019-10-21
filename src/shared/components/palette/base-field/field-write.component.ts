import { Component, ComponentFactoryResolver, Injector, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { PaletteService } from '../palette.service';
import { AbstractFieldWriteComponent } from './abstract-field-write.component';
import { FormControl } from '@angular/forms';
import { CaseField } from '../../../domain/definition';
import { FormValidatorsService } from '../../../services/form';
import { plainToClassFromExist } from 'class-transformer';

@Component({
  selector: 'ccd-field-write',
  template: `
    <div [hidden]="caseField.hidden">
      <ng-container #fieldContainer></ng-container>
    </div>
  `
})
export class FieldWriteComponent extends AbstractFieldWriteComponent implements OnInit {

  @Input()
  caseFields: CaseField[] = [];

  @ViewChild('fieldContainer', {read: ViewContainerRef})
  fieldContainer: ViewContainerRef;

  constructor(private resolver: ComponentFactoryResolver,
              private paletteService: PaletteService,
              private formValidatorsService: FormValidatorsService) {
    super();
  }

  protected addValidators(caseField: CaseField, control: FormControl): void {
    this.formValidatorsService.addValidators(caseField, control);
  }

  ngOnInit(): void {
    let componentClass = this.paletteService.getFieldComponentClass(this.caseField, true);
console.log('componentClass=', componentClass);
    let injector = Injector.create([], this.fieldContainer.parentInjector);
    let component = this.resolver.resolveComponentFactory(componentClass).create(injector);
    console.log('component=', component);
    // Provide component @Inputs
    component.instance['caseField'] = plainToClassFromExist(new CaseField(), this.caseField);
    console.log('caseField=', this.caseField);
    component.instance['caseFields'] = this.caseFields;
    console.log('caseFields=', this.caseFields);
    component.instance['formGroup'] = this.formGroup;
    console.log('formGroup=', this.formGroup);
    component.instance['registerControl'] = this.registerControl || this.defaultControlRegister();
    console.log('registerControl=', this.registerControl);
    component.instance['idPrefix'] = this.idPrefix;
    console.log('idPrefix=', this.idPrefix);
    if (this.caseField.field_type.id === 'AddressGlobal') {
      component.instance['ignoreMandatory'] = true;
    }
    component.instance['isExpanded'] = this.isExpanded;
    this.fieldContainer.insert(component.hostView);
  }
}
