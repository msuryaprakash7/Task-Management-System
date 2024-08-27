import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngAfterViewInit(): void {
    // Ensure the script is fully loaded before initializing Google Sign-In
    this.loadGoogleSignInScript().then(() => {
      this.initializeGoogleSignIn();
    });
  }

  onSubmit(): void {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      console.log('Login Successful!', this.loginForm.value);
    } else {
      console.log('Login Form is not valid');
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
