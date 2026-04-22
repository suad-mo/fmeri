import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  role: string[];
  token: string;
  expiresIn: number;
  zaposlenik?: {
    _id: string;
    ime: string;
    prezime: string;
  } | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private _currentUser = signal<AuthResponse | null>(this.loadFromStorage());
  currentUser = this._currentUser.asReadonly();
  isLoggedIn = computed(() => !!this._currentUser());
  userRoles = computed(() => this._currentUser()?.role ?? []);

  private http = inject(HttpClient);
  private router = inject(Router);

  register(data: { name: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, data, {
        withCredentials: true, // ← šalje i prima cookies
      })
      .pipe(tap((response) => this.setSession(response)));
  }

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, data, {
        withCredentials: true,
      })
      .pipe(tap((response) => this.setSession(response)));
  }

  refresh(): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/refresh`, {}, {
        withCredentials: true, // Cookie se automatski šalje
      })
      .pipe(tap((response) => this.setSession(response)));
  }

  logout(): void {
    this.http
      .post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe();
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    // Token je u HttpOnly cookie — ne možemo ga čitati iz JS-a
    // Interceptor više ne treba ručno dodavati token
    return null;
  }

  private setSession(response: AuthResponse): void {
    // Tokeni su u HttpOnly cookie — čuvamo samo user podatke
    localStorage.setItem('currentUser', JSON.stringify(response));
    this._currentUser.set(response);
  }

  private clearSession(): void {
    localStorage.removeItem('currentUser');
    this._currentUser.set(null);
  }

  private loadFromStorage(): AuthResponse | null {
    try {
      return JSON.parse(localStorage.getItem('currentUser') ?? 'null');
    } catch {
      return null;
    }
  }
}
