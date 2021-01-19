import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AbstractAppConfig } from '../../../../app.config';
import { TaskSearchParameter, TaskSearchParameters } from '../../../domain';
import { HttpErrorService, HttpService } from '../../../services';

export const MULTIPLE_TASKS_FOUND = 'More than one task found!';

@Injectable()
export class WorkAllocationService {

  constructor(
    private readonly http: HttpService,
    private readonly appConfig: AbstractAppConfig,
    private readonly errorService: HttpErrorService
  ) {
  }

  /**
   * Call the API to get tasks matching the search criteria.
   * @param searchRequest The search parameters that specify which tasks to match.
   */
  public searchTasks(searchRequest: TaskSearchParameters): Observable<object> {
    console.log('Find tasks that match this:', searchRequest);
    const url = `${this.appConfig.getWorkAllocationApiUrl()}/task`;
    return this.http
      .post(url, { searchRequest })
      .pipe(
        map(response => response.json()),
        catchError(error => {
          console.log('caught error for getting work allocation tasks', error);
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
        map(response => response.json()),
        catchError(error => {
          console.log(`caught error for completing work allocation task ${taskId}`, error);
          this.errorService.setError(error);
          return throwError(error);
        })
      );
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
      state: [ 'Open' ] // Need to know which are the "completeable" statuses.
    }];
    return this.searchTasks({ parameters })
      .pipe(
        map((tasks: any[]) => {
          if (tasks && tasks.length > 0) {
            if (tasks.length === 1) {
              // Attempt to mark this task as complete.
              console.log('returning the result of attempting to complete task', tasks[0].id);
              return this.completeTask(tasks[0].id);
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
