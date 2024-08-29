import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static passwordComplexity(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const isValidLength = value.length >= 8;

      const errors: any = {};

      if (!isValidLength) {
        errors.minLength = 'Minimum 8 characters required';
      }
      if (!hasUpperCase) {
        errors.upperCase = 'At least one uppercase letter is required';
      }
      if (!hasLowerCase) {
        errors.lowerCase = 'At least one lowercase letter is required';
      }
      if (!hasNumeric) {
        errors.numeric = 'At least one number is required';
      }
      if (!hasSpecial) {
        errors.special = 'At least one special character is required';
      }

      return Object.keys(errors).length ? errors : null;
    };
  }

  // Match password validator
  static matchPassword(
    controlName: string,
    matchingControlName: string
  ): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const control = formGroup.get(controlName);
      const matchingControl = formGroup.get(matchingControlName);

      if (!control || !matchingControl) {
        return null;
      }

      if (
        matchingControl.errors &&
        !matchingControl.errors['passwordMismatch']
      ) {
        return null;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ passwordMismatch: true });
      } else {
        matchingControl.setErrors(null);
      }

      return null;
    };
  }
}
