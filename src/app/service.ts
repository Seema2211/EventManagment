import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { EventModel } from './model';
@Injectable({
  providedIn: 'root',
})
export class RestApiService {
  // Define API
  apiURL = 'https://localhost:44389/api';
  constructor(private http: HttpClient) {}
  /*========================================
    CRUD Methods for consuming RESTful API
  =========================================*/
  // Http Options
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  // HttpClient API get() method => Fetch event list
  getEvent(): Observable<EventModel[]> {
    return this.http
      .get<EventModel[]>(this.apiURL + '/GetEvents')
      .pipe(retry(1), catchError(this.handleError));
  }

  // HttpClient API post() method => Create or Update Event
  createEvent(event: any): Observable<boolean> {
    return this.http
      .post<boolean>(
        this.apiURL + '/PostSaveOrUpdate',
        JSON.stringify(event),
        this.httpOptions
      )
      .pipe(retry(1), catchError(this.handleError));
  }

  // HttpClient API delete() method => Delete event
  deleteEvent(eventId: any) {
    return this.http
      .delete<boolean>(this.apiURL + '/DeleteEvent/' + eventId, this.httpOptions)
      .pipe(retry(1), catchError(this.handleError));
  }
  // Error handling
  handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(() => {
      return errorMessage;
    });
  }
}
