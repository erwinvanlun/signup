import { Inject, inject, Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { firstValueFrom, map, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountService {

  constructor(private http: HttpClient) {
  }

  signup(formValue: any): Promise<any> {
    return firstValueFrom(this.http.get<{thumbnailUrl: string}>(`https://jsonplaceholder.typicode.com/photos/${formValue.lastName.length}`)
      .pipe(
        tap((response: any) => {
          if (!response.thumbnailUrl || typeof response.thumbnailUrl !== 'string') {
            throw new Error('Invalid thumbnailUrl');
          }
        }),
        map((response: {thumbnailUrl: string}) => ({
          ...formValue,
          thumbnailUrl: response.thumbnailUrl
        })),
        switchMap((postData) => this.http.post('https://jsonplaceholder.typicode.com/users', postData))
      ))
  }
}




