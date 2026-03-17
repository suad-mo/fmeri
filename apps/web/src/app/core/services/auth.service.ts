import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  role: string[];
  token: string;
  expiresIn: number;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/api/auth';

  // Signal-based state
  private _currentUser = signal<AuthResponse | null>(this.loadFromStorage());

  currentUser = this._currentUser.asReadonly();
  isLoggedIn = computed(() => !!this._currentUser());
  userRoles = computed(() => this._currentUser()?.role ?? []);

  private http = inject(HttpClient);
  private router = inject(Router);

  // constructor(private http: HttpClient, private router: Router) {}

  register(data: {
    name: string;
    email: string;
    password: string;
  }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, data)
      .pipe(tap((response) => this.setSession(response)));
  }

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, data)
      .pipe(tap((response) => this.setSession(response)));
  }

  refresh(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(tap((response) => this.setSession(response)));
  }

  logout(): void {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      this.http.post(`${this.apiUrl}/logout`, { refreshToken }).subscribe();
    }
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setSession(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    this._currentUser.set(response);
  }

  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this._currentUser.set(null);
  }

  private loadFromStorage(): AuthResponse | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      // Decode JWT payload bez verifikacije — samo za UI state
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        this.clearSession();
        return null;
      }
      return JSON.parse(localStorage.getItem('currentUser') ?? 'null');
    } catch {
      return null;
    }
  }
}
