import { CaseField } from '../../domain/definition';
import { Injectable } from '@angular/core';
import { FieldsUtils } from '../fields';

@Injectable()
export class FieldTypeSanitiser {

  constructor(
    private fieldsUtils: FieldsUtils,
  ) {}

  /**
   * This method finds dynamiclists in a form and replaces its string value, with
   * following example JSON format
   * @return {value: {code:'xyz',label:'XYZ'}, list_items: [{code:'xyz',label:'XYZ'},{code:'abc',label:'ABC'}]}
   * @param caseFields
   * @param editForm
   */
   sanitiseLists(caseFields: CaseField[], editForm: any) {
    this.getDynamicListsFromCaseFields(caseFields).forEach(dynamicField => {
      this.fieldsUtils.getDeepKeys(editForm['data']).filter(key => key.endsWith(dynamicField.id)).forEach((key) => {
        if (dynamicField.field_type.type === 'DynamicList') {
          let formValue = this.fieldsUtils.getNestedValue(editForm['data'], key);
          let value = {
            value: this.getMatchingCodeFromListOfItems(dynamicField, formValue),
            list_items: dynamicField.list_items
          };
          this.fieldsUtils.setValue(key, value, editForm['data']);
        } else if (this.isCollectionOfSimpleDynamicListType(dynamicField)) {
          let dynamicListCollectionValues: any[] = this.fieldsUtils.getNestedValue(editForm['data'], key);
          dynamicListCollectionValues.forEach((formValue, index) => {
            if (formValue.value) {
              let value = {
                value: this.getMatchingCodeFromListOfItems(dynamicField, formValue.value),
                list_items: dynamicField.value[0].value.list_items
              };
              editForm['data'][dynamicField.id][index].value = value;
            }
          });
        } else if (dynamicField.field_type.type === 'Collection') {
          this.sanitiseLists(dynamicField.field_type.collection_field_type.complex_fields, editForm);
        } else if (dynamicField.field_type.type === 'Complex') {
          this.sanitiseLists(dynamicField.field_type.complex_fields, editForm);
        }
      });
    });
  }

  private isCollectionOfSimpleDynamicListType(dynamicField: CaseField) {
    return dynamicField.field_type.collection_field_type &&
      dynamicField.field_type.collection_field_type.type === 'DynamicList'
  }

  private getMatchingCodeFromListOfItems(dynamicField: CaseField, formValue: any) {
    let result = [];
    if (this.hasListItems(dynamicField)) {
      // dynamic list inside complex or collection of complex
      result = dynamicField.list_items.filter(value => value.code === formValue);
    } else if (dynamicField.value && dynamicField.value[0]) {
      // dynamic list as a simple collection
      result = dynamicField.value[0].value.list_items.filter(value => value.code === formValue);
    }
    return result.length > 0 ? result[0] : {};
  }

  private hasListItems(dynamicField: CaseField) {
    return dynamicField.list_items && dynamicField.list_items.length > 0;
  }

  private getDynamicListsFromCaseFields(caseFields: CaseField[]): CaseField[] {
    return caseFields
    .filter(caseField => (caseField.field_type.type === 'Collection' ||
      caseField.field_type.type === 'Complex' ||
      caseField.field_type.type === 'DynamicList'));
  }

}
