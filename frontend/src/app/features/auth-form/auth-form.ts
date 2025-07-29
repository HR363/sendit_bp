import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [NgIf, NgClass, ReactiveFormsModule, FormsModule],
  templateUrl: './auth-form.html',
  styleUrls: ['./auth-form.css']
})
export class AuthFormComponent implements OnInit {
  rightPanelActive = false;
  mode: 'signin' | 'signup' | 'verify' = 'signin';
  verificationEmail = '';
  verificationCode = '';
  // Form state
  loading = signal(false);
  error = signal<string | null>(null);

  // Reactive forms
  signupForm: FormGroup;
  signinForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private fb: FormBuilder,
    private toast: ToastService
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const mode = params.get('mode');
      this.rightPanelActive = mode === 'signup';
      if (this.mode !== 'verify') {
        this.mode = mode === 'signup' ? 'signup' : 'signin';
      }
    });
  }

  setPanel(signUp: boolean): void {
    this.rightPanelActive = signUp;
    this.mode = signUp ? 'signup' : 'signin';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { mode: signUp ? 'signup' : 'signin' },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  onSignup(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.signupForm.value;
    // Split name into firstName and lastName
    const nameParts = (formValue.name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    this.auth.signup({
      firstName,
      lastName,
      email: formValue.email,
      password: formValue.password,
      phone: formValue.phone
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.verificationEmail = formValue.email;
        this.mode = 'verify';
        // Optionally, auto-send code
        this.auth.sendVerificationCode(formValue.email).subscribe();
        this.toast.show('Account created! Please verify your email.', 'success');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Signup failed');
      }
    });
  }

  onSignin(): void {
    if (this.signinForm.invalid) {
      this.signinForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    const formValue = this.signinForm.value;

    this.auth.login({ email: formValue.email, password: formValue.password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.show('Signed in successfully!', 'success');
        // Redirect based on user role
        const role = res.user?.role;
        if (role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else if (role === 'COURIER_AGENT') {
          this.router.navigate(['/courier/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Login failed');
      }
    });
  }

  onVerify(): void {
    this.loading.set(true);
    this.error.set(null);
    this.auth.verifyEmail(this.verificationEmail, this.verificationCode).subscribe({
      next: () => {
        this.loading.set(false);
        this.setPanel(false); // Go to login
        this.mode = 'signin';
        this.toast.show('Email verified! You can now log in.', 'success');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Verification failed');
      }
    });
  }
}
