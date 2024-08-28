import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from './auth.service'; // Import AuthService
import { environment } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${this.getBaseUrl()}/api/v1/task`; // Base URL will be dynamic

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private authService: AuthService // Inject AuthService
  ) { }

  // Method to get the base URL from environment variables
  private getBaseUrl(): string {
    return environment?.API_URL || 'http://localhost:3000'; // Fallback URL
  }

  // Create headers including x-auth-token
  private createHeaders(): HttpHeaders {
    const sessionToken = this.cookieService.get('sessionToken') || '';
    return new HttpHeaders({
      'x-auth-token': sessionToken
    });
  }

  // Options object with headers
  private getOptions(): { headers: HttpHeaders } {
    return {
      headers: this.createHeaders()
    };
  }

  // Method to check token and refresh if needed
  private checkAndRefreshToken(): Observable<boolean> {
    return this.authService.checkAndRefreshToken(); // Use AuthService to handle token
  }

  // Get all tasks for the user
  getTasks(): Observable<any> {
    return this.checkAndRefreshToken().pipe(
      switchMap(() => this.http.get<any>(`${this.apiUrl}`, this.getOptions())),
      catchError(this.handleError)
    );
  }

  // Add a new task
  addTask(task: any): Observable<any> {
    return this.checkAndRefreshToken().pipe(
      switchMap(() => this.http.post<any>(`${this.apiUrl}/`, task, this.getOptions())),
      catchError(this.handleError)
    );
  }

  // Update an existing task
  updateTask(task: any): Observable<any> {
    return this.checkAndRefreshToken().pipe(
      switchMap(() => this.http.put<any>(`${this.apiUrl}/${task._id}`, task, this.getOptions())),
      catchError(this.handleError)
    );
  }

  // Delete a task
  deleteTask(taskId: string): Observable<any> {
    return this.checkAndRefreshToken().pipe(
      switchMap(() => this.http.delete<any>(`${this.apiUrl}/${taskId}`, this.getOptions())),
      catchError(this.handleError)
    );
  }

  // Error handling method
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error.message);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }
}
