import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = '/auth';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  login(credentials: { email: string; username: string; password: string }): Observable<any> {
    return this.http.post(this.baseUrl + '/signin', credentials, { headers: this.getHeaders() });
  }

  signup(data: { email: string; username: string; password: string }): Observable<any> {
    return this.http.post(this.baseUrl + '/signup/direct', data, { headers: this.getHeaders() });
  }

  requestSignupOtp(data: { email: string; username: string; password?: string }): Observable<any> {
    return this.http.post(this.baseUrl + '/signup/request', data, { headers: this.getHeaders() });
  }

  verifySignup(data: { email: string; otp: string }): Observable<any> {
    return this.http.post(this.baseUrl + '/signup/verify', data, { headers: this.getHeaders() });
  }
}
