import { CaseField } from '../../domain/definition';
import { Injectable } from '@angular/core';

@Injectable()
export class FieldTypeSanitiser {

  /**
   * This method finds dynamiclists in a form and replaces its string value, with
   * following example JSON format
   * @return {value: {code:'xyz',label:'XYZ'}, list_items: [{code:'xyz',label:'XYZ'},{code:'abc',label:'ABC'}]}
   * @param caseFields
   * @param editForm
   */
   sanitiseLists(caseFields: CaseField[], editForm: any) {
    this.getDynamicListsFromCaseFields(caseFields).forEach(dynamicField => {
      this.getDeepKeys(editForm['data']).filter(key => key.endsWith(dynamicField.id)).forEach((key) => {
        if (dynamicField.field_type.type === 'DynamicList') {
          let formValue = this.getNestedValue(editForm['data'], key);
          let value = {
            value: this.getMatchingCodeFromListOfItems(dynamicField, formValue, key),
            list_items: dynamicField.list_items
          };
          this.setValue(key, value, editForm['data']);
        } else if (dynamicField.field_type.type === 'Collection') {
          this.sanitiseLists(dynamicField.field_type.collection_field_type.complex_fields, editForm);
        } else if (dynamicField.field_type.type === 'Complex') {
          this.sanitiseLists(dynamicField.field_type.complex_fields, editForm);
        }
      });
    });
  }

  private getMatchingCodeFromListOfItems(dynamicField: CaseField, editForm: any, key) {
    if (!dynamicField.list_items) {
      return {};
    }
    let result = dynamicField.list_items.filter(value => value.code === editForm);
    return result.length > 0 ? result[0] : {};
  }

  private getDynamicListsFromCaseFields(caseFields: CaseField[]): CaseField[] {
    return caseFields
    .filter(caseField => (caseField.field_type.type === 'Collection' ||
      caseField.field_type.type === 'Complex' ||
      caseField.field_type.type === 'DynamicList'));
  }

  private getDeepKeys(obj) {
    let keys = [];
    Object.keys(obj).forEach((key) => {
      keys.push(key);
      if (this.isObject(obj[key])) {
        let subkeys = this.getDeepKeys(obj[key]);
        keys = keys.concat(subkeys.map(function(subkey) {
          return key + '.' + subkey;
        }));
      }
      if (this.isArray(obj[key])) {
        obj[key].forEach((elem, index) => {
          if (this.isObject(elem.value)) {
            let subkeys = this.getDeepKeys(elem.value);
            keys = keys.concat(subkeys.map(function(subkey) {
              return key + '.' + index +  '.' + 'value' + '.' + subkey;
            }));
          }
        });
      }
    });
    return keys;
  }

  private getNestedValue(obj, key) {
    return key.split('.').reduce(function(result, key) {
      return result[key]
    }, obj);
  }

  private setValue(propertyPath, value, obj) {

    // this is a super simple parsing, you will want to make this more complex to handle correctly any path
    // it will split by the dots at first and then simply pass along the array (on next iterations)
    let properties = Array.isArray(propertyPath) ? propertyPath : propertyPath.split('.');

    // Not yet at the last property so keep digging
    if (properties.length > 1) {
      // The property doesn't exists OR is not an object (and so we overwritte it) so we create it
      if (!obj.hasOwnProperty(properties[0]) || typeof obj[properties[0]] !== 'object') {
        obj[properties[0]] = {};
      }
      // We iterate.
      return this.setValue(properties.slice(1), value, obj[properties[0]])
      // This is the last property - the one where to set the value
    } else {
      // We set the value to the last property
      if (!this.isObject(obj[properties[0]])) {
        obj[properties[0]] = value;
      }
      return true // this is the end
    }

  }

  private getType(elem): string {
    return Object.prototype.toString.call(elem).slice(8, -1);
  }

  private isObject(elem) {
    return this.getType(elem) === 'Object';
  }

  private isArray(elem) {
    return this.getType(elem) === 'Array';
  }
}
