import { Catch, RpcExceptionFilter, ArgumentsHost, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcExceptionFilterCustom implements RpcExceptionFilter<RpcException> {
  private readonly logger = new Logger(RpcExceptionFilterCustom.name);

  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    const error = exception.getError();

    this.logger.error(`RPC Exception: ${JSON.stringify(error)}`);

    return throwError(() => exception.getError());
  }
}
