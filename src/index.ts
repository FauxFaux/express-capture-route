import { IRouter, RequestHandler, Request } from 'express';

type Operation = 'use' | 'get' | 'post' | 'put' | 'delete';

interface CapturedInfo {
  operation: Operation;
  path: string;
  parent: IRouter;
}

export interface Recovered {
  path: string[];
}

export class CaptiveRouter<T extends IRouter> {
  private readonly inner: T;

  constructor(inner: T) {
    this.inner = inner;
  }

  public raw(): T {
    return this.inner;
  }

  public use<U extends IRouter>(
    path: string,
    captive: CaptiveRouter<U>,
  ): CaptiveRouter<T> {
    const fn = captive.raw();
    this.inner.use(path, fn);
    this.capture('use', path, fn);
    return this;
  }

  public get(path: string, fn: RequestHandler): CaptiveRouter<T> {
    this.inner.get(path, fn);
    this.capture('get', path, fn);
    return this;
  }

  public post(path: string, fn: RequestHandler): CaptiveRouter<T> {
    this.inner.post(path, fn);
    this.capture('post', path, fn);
    return this;
  }

  public put(path: string, fn: RequestHandler): CaptiveRouter<T> {
    this.inner.put(path, fn);
    this.capture('put', path, fn);
    return this;
  }

  public delete(path: string, fn: RequestHandler): CaptiveRouter<T> {
    this.inner.delete(path, fn);
    this.capture('delete', path, fn);
    return this;
  }

  private capture(operation: string, path: string, fn: any) {
    fn.capturedInfo = {
      operation,
      path,
      parent: this.inner,
    } as CapturedInfo;
  }
}

export function capture<T extends IRouter>(inner: T): CaptiveRouter<T> {
  return new CaptiveRouter(inner);
}

export function recoverFromRequest(req: Request): Recovered {
  const obj = req as any;
  if (!obj.route || !obj.route.stack) {
    return { path: [] };
  }

  // this appears to be correct, no idea what else is in the stack, though!
  for (const item of obj.route.stack) {
    if (item.handle && item.handle.capturedInfo) {
      return recoverFromHandler(item.handle);
    }
  }

  return { path: [] };
}

export function recoverFromHandler(handler: any): Recovered {
  const path: string[] = [];

  for (let _tries = 0; _tries < 256; ++_tries) {
    const cap: CapturedInfo | undefined = handler.capturedInfo;
    if (!cap) {
      break;
    }

    path.push(cap.path);
    handler = cap.parent;
  }

  path.reverse();

  return { path };
}
