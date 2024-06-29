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

jest.mock('../../services/account/account.service');

const mockAccountService = {
  signup: jest.fn().mockImplementation(() => Promise.resolve()),
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
    })
      .overrideProvider(AccountService, { useValue: mockAccountService })
      .compileComponents();

    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    describe('should invalidate the form if required fields are missing', () => {
      const validFormData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@gmail.com',
        password: 'MyPassword123'
      }
      beforeEach(() => {
        component.signUpForm.setValue({...validFormData});
      });

      it('should not accept empty first name', () => {
        expect(component.signUpForm.valid).toBe(true); // just checking
        component.signUpForm.setValue({...validFormData, firstName: ''});
        expect(component.signUpForm.valid).toBe(false);
      });

      it('should not accept empty last name', () => {
        component.signUpForm.setValue({...validFormData, lastName: ''});
        expect(component.signUpForm.valid).toBe(false);
      });

      it('should not accept empty email', () => {
        component.signUpForm.setValue({...validFormData, email: ''});
        expect(component.signUpForm.valid).toBe(false);
      });

      it('should not accept empty password', () => {
        component.signUpForm.setValue({...validFormData, password: ''});
        expect(component.signUpForm.valid).toBe(false);
      });
    });

    it('should validate the email format', () => {
      component.signUpForm.get('email')?.setValue('invalid-email');
      expect(component.signUpForm.get('email')?.valid).toBe(false);

      component.signUpForm.get('email')?.setValue('aa@bb'); //we will not allow
      expect(component.signUpForm.get('email')?.valid).toBe(false);

      component.signUpForm.get('email')?.setValue('aa@bb@');
      expect(component.signUpForm.get('email')?.valid).toBe(false);

      component.signUpForm.get('email')?.setValue('aa@bb..');
      expect(component.signUpForm.get('email')?.valid).toBe(false);

      component.signUpForm.get('email')?.setValue('aa@.aa.com');
      expect(component.signUpForm.get('email')?.valid).toBe(false);

      component.signUpForm.get('email')?.setValue('almost@country.b');
      expect(component.signUpForm.get('email')?.valid).toBe(false);

      component.signUpForm.get('email')?.setValue('valid.email@example.com');
      expect(component.signUpForm.get('email')?.valid).toBe(true);

      component.signUpForm.get('email')?.setValue('valid.email@example.accountants');
      expect(component.signUpForm.get('email')?.valid).toBe(true);
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
      fixture.detectChanges(); // Trigger validation
      expect(component.signUpForm.get('password')?.errors?.['nameIncluded']).toBeTruthy();

      component.signUpForm.setValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'doe12345'
      });  fixture.detectChanges(); // Trigger validation

      expect(component.signUpForm.get('password')?.errors?.['nameIncluded']).toBeTruthy();

      component.signUpForm.setValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'ValidPassword123'
      });
      fixture.detectChanges(); // Trigger validation
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

    const button = fixture.debugElement.query(By.css('[data-test-id="signup-button"]')).nativeElement;
    expect(button.disabled).toBe(false);
  });

  it('should handle successfully signup', async () => {

    component.signUpForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'ValidPassword123'
    });
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('[data-test-id="signup-button"]')).nativeElement;

    const consoleLogSpy = jest.spyOn(console, 'log');
    button.click();
    await fixture.whenStable();

    expect(mockAccountService.signup).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'ValidPassword123'
    });

    expect(component.signUpForm.enabled).toBe(true);
    expect(consoleLogSpy).toHaveBeenCalledWith('Successfully signed up');
    consoleLogSpy.mockRestore();
  });

  it('should handle signup error', async () => {
    component.signUpForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'ValidPassword123'
    });
    fixture.detectChanges();
    mockAccountService.signup =   jest.fn().mockImplementation(() => Promise.reject('error text'));

    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    const consoleErrorSpy = jest.spyOn(console, 'error');

    button.click();

    await fixture.whenStable();

    expect(component.signUpForm.enabled).toBe(true);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error signing up, please try again', 'error text');
    consoleErrorSpy.mockRestore();
  });
});
