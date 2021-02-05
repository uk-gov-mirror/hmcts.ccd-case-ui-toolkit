import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Headers, Http, RequestOptionsArgs, Response } from '@angular/http';
import { HttpErrorService } from './http-error.service';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { HttpObserve } from '@angular/common/http/src/client';

@Injectable()
export class HttpService {

  private static readonly HEADER_ACCEPT = 'Accept';
  private static readonly HEADER_CONTENT_TYPE = 'Content-Type';

  constructor(
    private http: Http,
    private httpclient: HttpClient,
    private httpErrorService: HttpErrorService
  ) {}

  /**
   *
   * @param url Url resolved using UrlResolverService
   * @param options
   * @returns {Observable<Response>}
   * @see UrlResolverService
   */

  public get(url: string, options?: OptionsType, redirectIfNotAuthorised = true): Observable<any> {
    return this.httpclient
      .get(url, this.setDefaultValue(options))
      .pipe(
        catchError(res => {
          return this.httpErrorService.handle(res, redirectIfNotAuthorised);
        })
      );
  }

  private setDefaultValue(options?: OptionsType): OptionsType {
    options = options || {observe: 'events'};
    options.withCredentials = true; 
    if (!options.headers) {
      options.headers = new HttpHeaders()
        .set(HttpService.HEADER_ACCEPT, 'application/json')
        .set(HttpService.HEADER_CONTENT_TYPE, 'application/json');
    }

    /*if (!options.headers) {
      options.headers = new HttpHeaders();
    } else if (!(options.headers instanceof HttpHeaders)) {
      options.headers = new HttpHeaders(options.headers);
    }
    if (!options.headers.has(HttpService.HEADER_ACCEPT)) {
      options.headers.set(HttpService.HEADER_ACCEPT, 'application/json');
    }
    if (!options.headers.has(HttpService.HEADER_CONTENT_TYPE)) {
      options.headers.set(HttpService.HEADER_CONTENT_TYPE, 'application/json');
    }*/
    /*if (null === options.headers.get(HttpService.HEADER_CONTENT_TYPE)) {
      console.log('test4');
      options.headers.delete(HttpService.HEADER_CONTENT_TYPE);
    }*/
    // console.log('setDefaultValue', JSON.stringify(options.headers));

    return options;
  }

  /**
   *
   * @param url Url resolved using UrlResolverService
   * @param body
   * @param options
   * @returns {Observable<Response>}
   * @see UrlResolverService
   */
  public post(url: string, body: any, options?: RequestOptionsArgs, redirectIfNotAuthorised = true): Observable<Response> {
    return this.http
      .post(url, body, this.sanitiseOptions(options))
      .pipe(
        catchError(res => {
          return this.httpErrorService.handle(res, redirectIfNotAuthorised);
        })
      );
  }

  /**
   *
   * @param url Url resolved using UrlResolverService
   * @param body
   * @param options
   * @returns {Observable<Response>}
   * @see UrlResolverService
   */
  public put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.http
      .put(url, body, this.sanitiseOptions(options))
      .pipe(
        catchError(res => {
          return this.httpErrorService.handle(res);
        })
      );
  }

  /**
   *
   * @param url Url resolved using UrlResolverService
   * @param options
   * @returns {Observable<Response>}
   * @see UrlResolverService
   */
  public delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.http
      .delete(url, this.sanitiseOptions(options))
      .pipe(
        catchError(res => {
          return this.httpErrorService.handle(res);
        })
      );
  }

  private sanitiseOptions(options?: RequestOptionsArgs): RequestOptionsArgs {
    options = options || {};
    options.withCredentials = true;

    this.sanitiseHeaders(options);

    return options;
  }

  private sanitiseHeaders(options?: RequestOptionsArgs) {
    if (!options.headers) {
      options.headers = new Headers();
    }

    if (!options.headers.has(HttpService.HEADER_ACCEPT)) {
      options.headers.set(HttpService.HEADER_ACCEPT, 'application/json');
    }
    if (!options.headers.has(HttpService.HEADER_CONTENT_TYPE)) {
      options.headers.set(HttpService.HEADER_CONTENT_TYPE, 'application/json');
    }

    if (null === options.headers.get(HttpService.HEADER_CONTENT_TYPE)) {
      options.headers.delete(HttpService.HEADER_CONTENT_TYPE);
    }
  }
}

export interface OptionsType {
  headers?: HttpHeaders | { [header: string]: string | string[]; };
  observe: 'events';
  params?: HttpParams | { [param: string]: string | string[]; };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}
