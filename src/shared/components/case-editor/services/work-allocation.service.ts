import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AbstractAppConfig } from '../../../../app.config';
import { HttpError, TaskSearchParameter, TaskSearchParameters } from '../../../domain';
import { AlertService, HttpErrorService, HttpService } from '../../../services';

export const MULTIPLE_TASKS_FOUND = 'More than one task found!';

interface UserInfo {
  id: string,
  forename: string,
  surname: string,
  email: string,
  active: boolean,
  roles: string []
}

interface UserDetails {
  sessionTimeout: {
    idleModalDisplayTime: number,
    totalIdleTime: number,
  };
  canShareCases: boolean;
  userInfo: UserInfo
}

@Injectable()
export class WorkAllocationService {

  constructor(
    private readonly http: HttpService,
    private readonly appConfig: AbstractAppConfig,
    private readonly errorService: HttpErrorService,
    private readonly alertService: AlertService
  ) {
  }

  public static IACCaseworkerRoles = ['caseworker-ia-caseofficer', 'caseworker-ia-admofficer'];
  // public userRoles = this.getUserRoles();

  public roleIsCaseworker(role) {
    return WorkAllocationService.IACCaseworkerRoles.includes(role);
  }

  /**
   * Call the API to get tasks matching the search criteria.
   * @param searchRequest The search parameters that specify which tasks to match.
   */
  public searchTasks(searchRequest: TaskSearchParameters): Observable<object> {
    const url = `${this.appConfig.getWorkAllocationApiUrl()}/task`;
    return this.http
      .post(url, { searchRequest })
      .pipe(
        map(response => response.json()),
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        })
      );
  }

  /**
   * Call the API to complete a task.
   * @param taskId specifies which task should be completed.
   */
  public completeTask(taskId: string): Observable<any> {
    const url = `${this.appConfig.getWorkAllocationApiUrl()}/task/${taskId}/complete`;
    return this.http
      .post(url, {})
      .pipe(
        catchError(error => {
          this.errorService.setError(error);
          this.alertService.clear();

          this.http.get(this.appConfig.getWorkAllocationApiUrl()).subscribe((response) => {
            this.handleTaskCompletionError(response);
          });

          return throwError(error);
        })
      );
  }

  public handleTaskCompletionError(response: any): void {
    const userDetails = response.json() as UserDetails;
    if(this.userIsCaseworker(userDetails.userInfo.roles)) {
      this.alertService.warning('A task could not be completed successfully. Please complete the task associated with the case manually.');
    }
  }

public userIsCaseworker(roles: string []): boolean {
  return roles.includes('caseworker-ia-caseofficer') || roles.includes('caseworker-ia-admofficer');
}

  /**
   * Look for open tasks for a case and event combination. There are 5 possible scenarios:
   *   1. No tasks found                              => Success.
   *   2. One task found => Mark as done              => Success.
   *   3. One task found => Mark as done throws error => Failure.
   *   4. More than one task found                    => Failure.
   *   5. Search call throws an error                 => Failure.
   * @param ccdId The ID of the case to find tasks for.
   * @param eventId The ID of the event to find tasks for.
   */
  public completeAppropriateTask(ccdId: string, eventId: string): Observable<any> {
    const parameters: TaskSearchParameter[] = [{
      ccdId,
      eventId,
      state: ['Open'] // Need to know which are the "completeable" statuses.
    }];
    return this.searchTasks({ parameters })
      .pipe(
        map((response: any) => {
          const tasks: any[] = response.tasks;
          if (tasks && tasks.length > 0) {
            if (tasks.length === 1) {
              this.completeTask(tasks[0].id).subscribe();
            } else {
              // This is a problem. Throw an appropriate error.
              throw new Error(MULTIPLE_TASKS_FOUND);
            }
          }
          return true; // All good. Nothing to see here.
        }),
        catchError(error => {
          // Simply rethrow it.
          return throwError(error);
        })
      );
  }
}
