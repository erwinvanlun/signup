import { TestBed } from '@angular/core/testing';
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
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'signup' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Signup');
  });

  it('should render full name', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, signup');
  });
});
