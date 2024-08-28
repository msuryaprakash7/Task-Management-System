import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.API_URL}/api/v1/auth/refresh-session`; // API endpoint for refreshing the session

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  // Method to check if the token is expired and refresh it if necessary
  public checkAndRefreshToken(): Observable<boolean> {
    const expiresIn = parseInt(this.cookieService.get('expiresIn'), 10);
    const currentTime = Math.floor(Date.now() / 1000);

    if (expiresIn <= currentTime) {
      // Token is expired, refresh it
      return this.refreshToken();
    }

    // Token is still valid
    return of(true);
  }

  // Method to refresh the token
  private refreshToken(): Observable<boolean> {
    const refreshToken = this.cookieService.get('refreshToken');

    if (!refreshToken) {
      return throwError('No refresh token available');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${refreshToken}`);
    return this.http.get<any>(this.apiUrl, { headers }).pipe(
      tap(response => {
        if (response.code === 200 || response.code === 201) {
          // Save new tokens and expiry time
          this.cookieService.set('refreshToken', response.data.refreshToken);
          this.cookieService.set('sessionToken', response.data.sessionToken);
          this.cookieService.set('expiresIn', response.data.expiresIn);
        }
      }),
      switchMap(() => of(true)), // Return true indicating token refresh was successful
      catchError(error => {
        console.error('Error refreshing token:', error);
        return throwError('Token refresh failed');
      })
    );
  }
}
