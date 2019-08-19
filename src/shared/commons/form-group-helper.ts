import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

export class FormGroupHelper {
  constructor() {}

  findControlValueFromFromGroup(componentName: string, group: AbstractControl): any {
    let result = this.findControlInFromTopLevelForm(componentName, group);
    if (result.length === 0) {
      return null;
    }
    return result[0];
  }
  private findControlInFromTopLevelForm(componentName: string, group: AbstractControl): any {
    let formGroup: FormGroup = <FormGroup>  group;
    let control;
    // loop through each key in the FormGroup
    let formControls = Object.keys(formGroup.controls).map((key: string) => {
      // Get a reference to the control using the FormGroup.get() method
      const abstractControl = group.get(key);
      // If the control is an instance of FormGroup i.e a nested FormGroup
      // then recursively call this same method (logKeyValuePairs) passing it
      // the FormGroup so we can get to the form controls in it
      if (abstractControl instanceof FormGroup) {
        return this.findControlInFromTopLevelForm(componentName, abstractControl);
        // If the control is not a FormGroup then we know it's a FormControl
      } else {
        if (abstractControl instanceof  FormArray) {
          return abstractControl.controls.map((formControl, i) => {
            return this.findControlInFromTopLevelForm(componentName, formControl)
          }).filter(function (el) {
            return el != null;
          });
          // If the control is not a FormGroup then we know it's a FormControl
        } else {
          if (key === componentName) {
            return abstractControl.value;
          }
        }
      }
      return control;
    }).filter(function (el) {
      return el != null;
    });
    const flattenedArray = this.flat(formControls);
    return this.flat(Array.from(new Set(flattenedArray).values()));
  }

  flat(array) {
    return array.reduce((acc, item) => {
      return acc.concat(item);
    }, []);
  }

}
