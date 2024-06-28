import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Component, EventEmitter, Output } from '@angular/core';
import { SignUpComponent } from './components/sign-up/sign-up.component';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  template: '<div></div>'
})
class MockSignUpComponent {
  @Output() fullNameChange = new EventEmitter<string>();
}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>
  beforeEach(async () => {
    TestBed.overrideComponent(AppComponent, {
      add: {
        imports: [MockSignUpComponent],
      },
      remove: {
        imports: [SignUpComponent],
      },
    });
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
  });

  it('should create the app', () => {

    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'signup' title`, () => {
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Signup');
  });

  describe('should render full name', () => {
    it('not on startup', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.full-name')).toBeNull();

    })
    it('after name has been entered', () => {
      const mockSignUpComponent = fixture.debugElement.query(
        (de) => de.componentInstance instanceof MockSignUpComponent
      ).componentInstance as MockSignUpComponent;

      const fullName = 'John Doe';
      mockSignUpComponent.fullNameChange.emit(fullName);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.full-name span')?.textContent).toContain(`Soon signing up: ${fullName}`);
    });
  });

});
