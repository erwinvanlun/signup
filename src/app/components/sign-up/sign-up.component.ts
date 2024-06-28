import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { AccountService } from '../../services/account/account.service';
import { SignUpFormValue } from './sign-up-form.type';

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
export class SignUpComponent implements OnInit {
  signUpForm: FormGroup;
  fullName = '';

  constructor(private fb: FormBuilder, private accountService: AccountService) {
    this.signUpForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordValidator.bind(this)]]
    });
  }

  ngOnInit(): void {

    this.signUpForm.valueChanges.subscribe(values => {
      this.fullName = `${values.firstName} ${values.lastName}`;
    });

    // as password is the last field, and user Joe Doe, who used 'Doe' in his
    // password might wonder why the button is not enabled. Therefore, after 8 chars the validator function is executed.

    this.signUpForm.get('password')?.valueChanges.subscribe(value => {
      if (value.length >= passwordMinLength) {
        this.signUpForm.get('password')?.markAsTouched();
      }
    });
  }

  passwordValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.value;
    const firstName = this.signUpForm?.get('firstName')?.value;
    const lastName = this.signUpForm?.get('lastName')?.value;

    if (!password) return null;
    if (password.length < passwordMinLength) return {'minLength': true};
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) return {'case': true};
    if (password.toLowerCase().includes(firstName.toLowerCase()) || password.toLowerCase().includes(lastName.toLowerCase())) return {'nameIncluded': true};

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
      console.error('Error signing up, please try again:', e);

      this.signUpForm.enable();

    }

  }
}
