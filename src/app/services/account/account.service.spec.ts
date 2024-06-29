import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AccountService } from './account.service';
import { SignUpFormValue } from '../../components/sign-up/sign-up-form.type';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AccountService', () => {
  let service: AccountService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [AccountService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(AccountService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifies that there are no outstanding HTTP requests after each test
  });

  it('should successfully sign up a user', () => {
    const mockFormValue: SignUpFormValue = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'ValidPassword123',
    };

    // Mock the response for the first HTTP GET request
    const mockGetResponse = {thumbnailUrl: 'https://example.com/thumbnail.jpg'};
    service.signup(mockFormValue).then(() => {
      // wait for the promise to resolve, after the rest of the test code below is executed and interceptors are defined
    });

    const getReq = httpMock.expectOne(`https://jsonplaceholder.typicode.com/photos/${mockFormValue.lastName.length}`);
    expect(getReq.request.method).toBe('GET');
    getReq.flush(mockGetResponse);

    // Mock the response for the second HTTP POST request
    const postReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    expect(postReq.request.method).toBe('POST');
    postReq.flush({}, {status: 201, statusText: 'Created'}); // Simulate successful POST response
  });

  it('should handle invalid response structure from GET request', () => {
    const mockFormValue: SignUpFormValue = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: 'ValidPassword123',

    };

    // Mock an invalid response structure for the first HTTP GET request
    const mockInvalidGetResponse = {invalidField: 'invalidValue'};
    service.signup(mockFormValue).catch(error => {
      expect(error.message).toBe('Invalid response structure');
    });

    const getReq = httpMock.expectOne(`https://jsonplaceholder.typicode.com/photos/${mockFormValue.lastName.length}`);
    expect(getReq.request.method).toBe('GET');
    getReq.flush(mockInvalidGetResponse); // Simulate the invalid response from the GET request
  });

  it('should handle error response from POST request', () => {
    const mockFormValue: SignUpFormValue = {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
      password: 'ValidPassword123',
    };

    // Mock the response for the first HTTP GET request
    const mockGetResponse = {thumbnailUrl: 'https://example.com/thumbnail.jpg'};
    // Call signup and chain .then() and .catch()
    service.signup(mockFormValue)
      .then(() => {
        // If signup succeeds unexpectedly, fail the test
        expect(true).toBe(false); // This line should not be reached
      })
      .catch(error => {
        // Expecting an error here, since signup should fail due to POST error
        expect(error.message).toBe('Unable to create user');
      })
      .finally(() => {
      });

    // After handling then/catch, verify HTTP requests
    const getReq = httpMock.expectOne(`https://jsonplaceholder.typicode.com/photos/${mockFormValue.lastName.length}`);
    expect(getReq.request.method).toBe('GET');
    getReq.flush(mockGetResponse); // Simulate the response from the GET request

    // Mock an error response for the second HTTP POST request
    const postReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    expect(postReq.request.method).toBe('POST');
    postReq.flush({}, {status: 500, statusText: 'Internal Server Error'}); // Simulate error response

  });

});

