import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomValidators } from './custom-validator';
import { GoogleSignInService } from 'src/app/services/google-sign-in.service';
import { LoginService } from 'src/app/services/login.service'; // Ensure LoginService is imported
import { CookieService } from 'ngx-cookie-service'; // Import ngx-cookie-service
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit, AfterViewInit {
  signupForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private googleSignInService: GoogleSignInService,
    private loginService: LoginService, // Inject LoginService
    private cookieService: CookieService, // Inject CookieService
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    localStorage.clear();
    this.cookieService.deleteAll();
    this.signupForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]], // Default email validator
        password: [
          '',
          [Validators.required, CustomValidators.passwordComplexity()],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: CustomValidators.matchPassword(
          'password',
          'confirmPassword'
        ),
      }
    );
  }

  ngAfterViewInit(): void {
    this.googleSignInService
      .loadGoogleSignInScript()
      .then(() => {
        this.googleSignInService.initializeGoogleSignIn(
          this.googleSignInService.handleCredentialResponse.bind(this) // Bind the handleGoogleSignIn method
        );
      })
      .catch((error) => {
        console.error('Error loading Google Sign-In script:', error);
      });
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.loginService.signup(this.signupForm.value).subscribe(
        (response: any) => {
          if (response.code === 201) {
            this.handleAuthResponse(response);
            this.snackBar.open('Signup successful!', 'Close', {
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
          console.error('Signup failed:', error);
          if (error?.error?.code === 400) {
            this.snackBar.open(error?.error?.message || 'User with this email already exists.', 'Close', {
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

  // Handle Google Sign-In response
  private handleGoogleSignIn(response: any): void {
    console.log('Google Sign-In response:', response);
    // Assuming you have a method to handle Google Sign-In response
    this.loginService
      .signup({
        firstName: response.profileObj.givenName,
        lastName: response.profileObj.familyName,
        email: response.profileObj.email,
        password: '', // Set a default password or handle as needed
      })
      .subscribe(
        (signupResponse) => {
          console.log('Google Sign-In successful:', signupResponse);
          this.handleAuthResponse(signupResponse);
        },
        (error) => {
          console.error('Google Sign-In failed:', error);
        }
      );
  }

  private handleAuthResponse(response: any): void {
    if (response.code === 201) {
      // Save tokens in cookies using ngx-cookie-service
      this.cookieService.set('refreshToken', response.data.refreshToken);
      this.cookieService.set('sessionToken', response.data.sessionToken);

      // Store user info in local storage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // Set isLoggedIn key to true
      localStorage.setItem('isLoggedIn', 'true');
      // Redirect to a different page after successful signup
      this.router.navigate(['/dashboard']);
    }
  }
}
