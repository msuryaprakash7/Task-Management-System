// google-sign-in.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class GoogleSignInService {
  private clientId = '552809791402-0hu4vc0t4lfrgdm1clefapm3jimnhm82.apps.googleusercontent.com';

  constructor(private http: HttpClient,
    private router: Router,
    private loginService: LoginService,
  ) { }

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

  initializeGoogleSignIn(callback: (response: any) => void): void {
    if ((window as any)['google']?.accounts) {
      (window as any).google.accounts.id.initialize({
        client_id: this.clientId,
        use_fedcm_for_prompt: true,
        callback: callback
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
    // Call the googleLogin method from LoginService
    this.loginService.googleLogin(response.credential).subscribe({
      next: (response) => {
        console.log('Login Successful', response);
        this.loginService.handleAuthResponse(response); // Handle authentication response
      },
      error: (error) => {
        console.error('Login failed', error);
      }
    });
  }
}
