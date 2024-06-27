import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';

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
    HttpClientModule,
    MatCard,
    MatCardContent,
    MatCardHeader
  ],
  providers: [HttpClient]
})
export class SignUpComponent implements OnInit {
  signUpForm: FormGroup;
  fullName = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
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
  }

  passwordValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.value.toLowerCase();
    const firstName = this.signUpForm?.get('firstName')?.value.toLowerCase();
    const lastName = this.signUpForm?.get('lastName')?.value.toLowerCase();

    if (!password) return null;
    if (password.length < 8) return { 'minLength': true };
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) return { 'case': true };
    if (password.includes(firstName) || password.includes(lastName)) return { 'nameIncluded': true };

    return null;
  }

  onSubmit(): void {
    const formValue = this.signUpForm.value;
    this.http.get(`https://jsonplaceholder.typicode.com/photos/${formValue.lastName.length}`)
      .subscribe((photos: any) => {
        const thumbnailUrl = photos.thumbnailUrl;
        const postData = {
          ...formValue,
          thumbnailUrl
        };

        this.http.post('https://jsonplaceholder.typicode.com/users', postData)
          .subscribe(response => {
            console.log('User created:', response);
          });
      });
  }
}
