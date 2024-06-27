import { Inject, inject, Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { firstValueFrom, map, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountService {

  constructor(private http: HttpClient) {
  }

  signup(formValue: any): Promise<any> {
    return firstValueFrom(this.http.get(`https://jsonplaceholder.typicode.com/photos/${formValue.lastName.length}`)
      .pipe(map((response: any) => ({
          ...formValue,
          thumbnailUrl: response.thumbnailUrl
        })),
        switchMap((postData) => this.http.post('https://jsonplaceholder.typicode.com/users', postData))
      ))
  }
}




