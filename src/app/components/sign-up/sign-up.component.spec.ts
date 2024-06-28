import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignUpComponent } from './sign-up.component';
import { AccountService } from '../../services/account/account.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

jest.mock('../../services/account/account.service');

const mockAccountService = {
  signup: jest.fn(),
};
describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [
        SignUpComponent,
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
        MatFormFieldModule,
        MatCardModule
      ],
      providers: [{ provide: AccountService, useValue: mockAccountService }]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should invalidate the form if required fields are missing', () => {
      component.signUpForm.setValue({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      });
      expect(component.signUpForm.invalid).toBe(true);;
    });

    it('should validate the email format', () => {
      component.signUpForm.get('email')?.setValue('invalid-email');
      expect(component.signUpForm.get('email')?.invalid).toBe(true);;

      component.signUpForm.get('email')?.setValue('valid.email@example.com');
      expect(component.signUpForm.get('email')?.valid).toBe(true);;
    });

    it('should validate the password length', () => {
      component.signUpForm.get('password')?.setValue('short');
      expect(component.signUpForm.get('password')?.errors?.['minLength']).toBeTruthy();

      component.signUpForm.get('password')?.setValue('LongEnoughPassword');
      expect(component.signUpForm.get('password')?.errors?.['minLength']).toBeFalsy();
    });

    it('should validate the password case', () => {
      component.signUpForm.get('password')?.setValue('alllowercase');
      expect(component.signUpForm.get('password')?.errors?.['case']).toBeTruthy();

      component.signUpForm.get('password')?.setValue('ALLUPPERCASE');
      expect(component.signUpForm.get('password')?.errors?.['case']).toBeTruthy();

      component.signUpForm.get('password')?.setValue('MixedCasePassword');
      expect(component.signUpForm.get('password')?.errors?.['case']).toBeFalsy();
    });

    it('should validate the password not including first or last name', () => {
      component.signUpForm.setValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'john12345'
      });
      expect(component.signUpForm.get('password')?.errors?.['nameIncluded']).toBeTruthy();

      component.signUpForm.setValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'doe12345'
      });
      expect(component.signUpForm.get('password')?.errors?.['nameIncluded']).toBeTruthy();

      component.signUpForm.setValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'ValidPassword123'
      });
      expect(component.signUpForm.get('password')?.errors?.['nameIncluded']).toBeFalsy();
    });
  });

  it('should enable the button when the form is valid', () => {
    component.signUpForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'ValidPassword123'
    });
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(button.disabled).toBe(false);
  });

  it('should call the sign-up function when the form is submitted', async () => {
    component.signUpForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'ValidPassword123'
    });
    mockAccountService.signup.mockReturnValue(of({}).toPromise());

    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    button.click();
    fixture.detectChanges();

    await fixture.whenStable();

    expect(mockAccountService.signup).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'ValidPassword123'
    });
  });

  it('should handle sign-up error', async () => {
    component.signUpForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'ValidPassword123'
    });
    mockAccountService.signup.mockReturnValue(throwError('Error signing up').toPromise());

    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    button.click();
    fixture.detectChanges();

    await fixture.whenStable();

    expect(mockAccountService.signup).toHaveBeenCalled();
    expect(component.signUpForm.enabled).toBe(true); // Ensure form is re-enabled after error
  });
});
