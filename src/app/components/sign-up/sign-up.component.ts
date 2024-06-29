import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { AccountService } from '../../services/account/account.service';
import { SignUpFormValue } from './sign-up-form.type';
import { pairwise, Subject, takeUntil } from 'rxjs';

const passwordMinLength = 8;

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
  ],
  providers: [AccountService]
})
export class SignUpComponent implements OnInit, OnDestroy {
  signUpForm: FormGroup;
  @Output() fullNameChange = new EventEmitter<string>();
  protected destroyed$ = new Subject<void>();

  constructor(private fb: FormBuilder, private accountService: AccountService) {
    this.signUpForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, customEmailValidator()]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordValidator.bind(this)]]
    });
  }

  ngOnInit(): void {

    this.signUpForm.valueChanges.pipe(
      takeUntil(this.destroyed$),
      pairwise()
    ).subscribe(([previousValues, currentValues]) => {
        this.fullNameChange.emit(`${currentValues.firstName} ${currentValues.lastName}`);

        if (previousValues.firstName !== currentValues.firstName || previousValues.lastName !== currentValues.lastName) {
          this.signUpForm.get('password')?.updateValueAndValidity();
        }
      }
    );

    // as password is the last field, and user Joe Doe, who used 'Doe' in his
    // password might wonder why the button is not enabled. Therefore, after 8 chars the validator function is executed.

    this.signUpForm.get('password')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
      if (value.length >= passwordMinLength) {
        this.signUpForm.get('password')?.markAsTouched();
      }
    });
  }


  passwordValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.value || '';
    const firstName = (this.signUpForm?.get('firstName')?.value || '').toLowerCase();
    const lastName = (this.signUpForm?.get('lastName')?.value || '').toLowerCase();

    if (!password) return null;
    if (password.length < passwordMinLength) return {'minLength': true};
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) return {'case': true};

    if (firstName.length > 0 && password.toLowerCase().includes(firstName)) return {'nameIncluded': true};
    if (lastName.length > 0 && password.toLowerCase().includes(lastName)) return {'nameIncluded': true};

    return null;
  }

  async onSubmit(): Promise<void> {

    this.signUpForm.disable();

    console.log('Signing up... ')

    try {
      await (this.accountService.signup(this.signUpForm.value as SignUpFormValue));

      console.log('Successfully signed up');

      this.signUpForm.enable();

    } catch (e) {
      console.log('Error signing up, please try again ' + e);

      this.signUpForm.enable();

    }

  }

  ngOnDestroy(): void {

    this.destroyed$.next();
    this.destroyed$.complete();
  }

}

function customEmailValidator(): ValidatorFn {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }
    return emailRegex.test(value) ? null : {emailInvalid: true};
  };
}
