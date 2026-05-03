import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // EMPTY base URL - proxy.conf.json handles routing to localhost:8080
  baseUrl = '';

  constructor(private http: HttpClient) {}

  getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    if (token) {
      headers = headers.set('Authorization', 'Bearer ' + token);
    }
    const restaurantId = sessionStorage.getItem('restaurantId');
    if (restaurantId) {
      headers = headers.set('X-Restaurant-Id', restaurantId);
    }
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      headers = headers.set('X-User-Id', userId);
    }
    const role = sessionStorage.getItem('role');
    if (role) {
      headers = headers.set('X-User-Role', role);
    }
    return headers;
  }

  get(endpoint: string) {
    return this.http.get(this.baseUrl + endpoint, { headers: this.getHeaders() });
  }

  post(endpoint: string, body: any) {
    return this.http.post(this.baseUrl + endpoint, body, { headers: this.getHeaders() });
  }

  put(endpoint: string, body: any) {
    return this.http.put(this.baseUrl + endpoint, body, { headers: this.getHeaders() });
  }

  delete(endpoint: string) {
    return this.http.delete(this.baseUrl + endpoint, { headers: this.getHeaders() });
  }
}

