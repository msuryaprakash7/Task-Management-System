import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environments';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiUrl = `${this.getBaseUrl()}/api/v1`; // Base URL will be dynamic

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private authService: AuthService,
    private router: Router
  ) {}

  // Method to get the base URL from environment variables
  private getBaseUrl(): string {
    return environment.API_URL || 'http://localhost:3000'; // Fallback URL
  }
   // Method to handle Google login
  googleLogin(token: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/google`, { token });
  }
  handleAuthResponse(response: any): void {
    if (response.code === 201 || response.code === 200) {
      // Save tokens in cookies using ngx-cookie-service
      this.cookieService.set('refreshToken', response.data.refreshToken);
      this.cookieService.set('sessionToken', response.data.sessionToken);
      this.cookieService.set('expiresIn', response.data.expiresIn);

      // Store user info in local storage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // Set isLoggedIn key to true
      localStorage.setItem('isLoggedIn', 'true');
      // Redirect to a different page after successful signup or login
      this.router.navigate(['/dashboard']);
    }
  }
  // Method to sign up
  signup(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.authService
      .checkAndRefreshToken()
      .pipe(
        switchMap(() => this.http.post<any>(`${this.apiUrl}/auth/signup`, data))
      );
  }

  // Method to log in
  login(email: string, password: string): Observable<any> {
    // Create HttpParams with email and password
    const params = new HttpParams()
      .set('email', email)
      .set('password', password);

    // Check token expiration before making API call
    return this.authService
      .checkAndRefreshToken()
      .pipe(
        switchMap(() =>
          this.http.get<any>(`${this.apiUrl}/auth/login`, { params })
        )
      );
  }
  logOut() {
    console.log('Logging out...');

    // Clear local storage
    localStorage.clear();
    console.log('Local storage cleared.');

    // Clear all cookies
    this.cookieService.deleteAll('/');
    console.log('Cookies cleared.');

    // Navigate to the login page
    this.router.navigate(['/login']);
  }
  // Method to set cookie
  setCookie(name: string, value: string, expires?: Date): void {
    this.cookieService.set(name, value, expires);
  }

  // Method to get cookie
  getCookie(name: string): string {
    return this.cookieService.get(name);
  }

  // Method to delete cookie
  deleteCookie(name: string): void {
    this.cookieService.delete(name);
  }
}
