import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { firstValueFrom, map, switchMap } from 'rxjs';
import { SignUpFormValue } from '../../components/sign-up/sign-up-form.type';

@Injectable({
  providedIn: 'root',
})
export class AccountService {

  constructor(private http: HttpClient) {}

  signup(formValue: SignUpFormValue): Promise<void> {
    return firstValueFrom(
      this.http.get<unknown>(`https://jsonplaceholder.typicode.com/photos/${formValue.lastName.length}`)
        .pipe(
          map(response => {
            if (isPhotosResponse(response)) {
              return {
                ...formValue,
                thumbnailUrl: response.thumbnailUrl
              };
            }
            throw new Error('Invalid response structure');
          }),
          switchMap(postData =>
            this.http.post<void>('https://jsonplaceholder.typicode.com/users', postData, { observe: 'response' })
              .pipe(
                map((response: HttpResponse<void>) => {
                  if (response.status !== 201) {
                    throw new Error('Unable to create user');
                  }
                })
              )
          )
        )
    );
  }
}

// type guarding the response from https://jsonplaceholder.typicode.com
function isPhotosResponse(response: unknown): response is { thumbnailUrl: string } {
  if (typeof response === 'object' && response) {
    if ('thumbnailUrl' in response && typeof (response.thumbnailUrl === 'string'))
      return true;
  }
  return false;
}



