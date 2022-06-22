import {Injectable} from "@angular/core";
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {LoaderService} from "./loader.service";
import {finalize, Observable} from "rxjs";

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {

  private totalRequests = 0;

  constructor(private loaderService: LoaderService) {
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.totalRequests++;
    this.loaderService.loading = true;

    return next.handle(req).pipe(
      finalize(() => {
        this.totalRequests--;
        if(this.totalRequests == 0) {
          this.loaderService.loading = false;
        }
      })
    )
  }
}
