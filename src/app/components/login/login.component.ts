import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { GoogleSignInService } from 'src/app/services/google-sign-in.service';
import { LoginService } from 'src/app/services/login.service';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, AfterViewInit {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private googleSignInService: GoogleSignInService,
    private loginService: LoginService,
    private cookieService: CookieService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    localStorage.clear();
    this.cookieService.deleteAll();
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngAfterViewInit(): void {
   // Ensure the script is fully loaded before initializing Google Sign-In
   this.googleSignInService.loadGoogleSignInScript()
   .then(() => {
     this.googleSignInService.initializeGoogleSignIn(this.googleSignInService.handleCredentialResponse.bind(this));
   })
   .catch(error => {
     console.error('Error loading Google Sign-In script:', error);
   });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.loginService.login(email, password).subscribe(
        (response: any) => {
          if (response.code === 200) {
            this.loginService.handleAuthResponse(response);
            this.snackBar.open('Login successful!', 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
          } else if (response.code === 400) {
            this.snackBar.open(response.message, 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }
        },
        (error) => {
          console.error('Login failed:', error);
          if (error?.error?.code === 400) {
            this.snackBar.open(error?.error?.message || 'Invalid credentials.', 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          } else {
            this.snackBar.open('An unexpected error occurred. Please try again.', 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }
        }
      );
    }
  }

  private handleAuthResponse(response: any): void {
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
  loadGoogleSignInScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if the Google script is already loaded
      if ((window as any)['google']?.accounts) {
        resolve();
        return;
      }
      // Create a script element to load Google Sign-In
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Sign-In script'));
      document.body.appendChild(script);
    });
  }

  initializeGoogleSignIn(): void {
    if ((window as any)['google']?.accounts) {
      (window as any).google.accounts.id.initialize({
        client_id: '552809791402-0hu4vc0t4lfrgdm1clefapm3jimnhm82.apps.googleusercontent.com',
        use_fedcm_for_prompt: true,
        callback: this.handleCredentialResponse.bind(this)
      });

      (window as any).google.accounts.id.renderButton(
        document.getElementById('buttonDiv'),
        { theme: 'outline', size: 'large' }  // Customization attributes
      );

      (window as any).google.accounts.id.prompt(); // Also display the One Tap dialog
    } else {
      console.error('Google Sign-In API is not available');
    }
  }

  handleCredentialResponse(response: any): void {
    console.log('Encoded JWT ID token: ' + response.credential);

    // Send the token to your backend for verification and login
    this.http.post('your-backend-api/login', { token: response.credential }).subscribe({
      next: (response) => {
        console.log('Login Successful', response);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login failed', error);
      }
    });
  }
}
