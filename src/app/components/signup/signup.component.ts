import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomValidators } from './custom-validator';
// import { AuthService } from '../services/auth.service'; // Assuming you have an AuthService for handling Google Auth

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;

  constructor(private fb: FormBuilder,
    // private authService: AuthService, 
    private router: Router) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]], // Default email validator
      password: ['', [Validators.required, CustomValidators.passwordComplexity()]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: CustomValidators.matchPassword('password', 'confirmPassword')
    });
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      // Handle signup logic here
      console.log(this.signupForm.value);
    }
  }

  // signInWithGoogle(): void {
  //   this.authService.signInWithGoogle().then((result) => {
  //     // Handle Google Auth result here
  //     this.router.navigate(['/dashboard']); // Redirect to dashboard or any other page after successful login
  //   }).catch((error) => {
  //     console.error('Google Sign-In Error: ', error);
  //   });
  // }
}
