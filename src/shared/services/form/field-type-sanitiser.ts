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
      if(dynamicField.field_type.type === 'DynamicList') {
        this.getDeepKeys(editForm).filter(key => key.endsWith(dynamicField.id)).forEach((key) => {
          let formValue = this.getNestedValue(editForm, key)
          let value = {
            value: this.getMatchingCodeFromListOfItems(dynamicField, formValue, key),
            list_items: dynamicField.list_items
          };
          this.setValue(key, value, editForm);
        });

      } else if (dynamicField.field_type.type === 'Collection') {
         this.sanitiseLists(dynamicField.field_type.collection_field_type.complex_fields, editForm);
      } else if (dynamicField.field_type.type === 'Complex') {
        this.sanitiseLists(dynamicField.field_type.complex_fields, editForm);
      }
    });
  }

  private createValueCodePairAlongWithListIfKeyExistsInForm(dynamicField: CaseField, key, editForm: any) {
    if (dynamicField.id === key) {
      editForm['data'][key] = {
          value: this.getMatchingCodeFromListOfItems(dynamicField, editForm, key),
          list_items: dynamicField.list_items
        };
    }
  }

  private getMatchingCodeFromListOfItems(dynamicField: CaseField, editForm: any, key) {

    let result = dynamicField.list_items.filter(value => value.code === editForm);
    return result.length > 0 ? result[0] : {};
  }

  private getListOfKeysFromEditForm(editForm: any) {
    return Object.keys(editForm['data']);
  }

  private getDynamicListsFromCaseFields(caseFields: CaseField[]): CaseField[] {
    return caseFields
      .filter(caseField => (caseField.field_type.type === 'Collection' ||
        caseField.field_type.type === 'Complex' ||
        caseField.field_type.type === 'DynamicList'));
  }

  private getDeepKeys(obj) {
    var keys = [];
    for(var key in obj) {
      keys.push(key);
      if(typeof obj[key] === "object") {
        var subkeys = this.getDeepKeys(obj[key]);
        keys = keys.concat(subkeys.map(function(subkey) {
          return key + "." + subkey;
        }));
      }
    }
    return keys;
  }

  private getNestedValue(obj, key) {
    return key.split(".").reduce(function(result, key) {
      return result[key]
    }, obj);
  }

  private setValue(propertyPath, value, obj) {

    // this is a super simple parsing, you will want to make this more complex to handle correctly any path
    // it will split by the dots at first and then simply pass along the array (on next iterations)
    let properties = Array.isArray(propertyPath) ? propertyPath : propertyPath.split(".")

    // Not yet at the last property so keep digging
    if (properties.length > 1) {
      // The property doesn't exists OR is not an object (and so we overwritte it) so we create it
      if (!obj.hasOwnProperty(properties[0]) || typeof obj[properties[0]] !== "object") obj[properties[0]] = {}
      // We iterate.
      return this.setValue(properties.slice(1), value, obj[properties[0]])
      // This is the last property - the one where to set the value
    } else {
      // We set the value to the last property
      obj[properties[0]] = value
      return true // this is the end
    }

  }
}
