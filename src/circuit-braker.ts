
export enum CircuitBreakerStatus {
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
  CLOSE = 'CLOSE',
}

export class CircuitBreaker {
  private readonly requester: any;
  readonly failureThreshold: number;
  private readonly resetTimeout: number;
  numberOfCalls: number = 0;
  private nextRequestIn: number;

  constructor({
    requester,
    failureThreshold,
    resetTimeoutInMs,
  }: {
    requester: any;
    failureThreshold: number;
    resetTimeoutInMs: number;
  }) {
    this.requester = requester;
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeoutInMs;
    this.nextRequestIn = Date.now();
  }

  public async fire(...args: any[]): Promise<any> {
    if (this.status === CircuitBreakerStatus.OPEN) {
      return Promise.resolve({ status: 'OK CACHE' });
    }
    try {
      const result = await this.requester(args);
      this.numberOfCalls = 0;
      return result;
    } catch (error) {
      this.numberOfCalls++;
      this.nextRequestIn = Date.now() + this.resetTimeout;
    }
  }

  get status(): CircuitBreakerStatus {
    if (this.numberOfCalls >= this.failureThreshold) {
      if (this.nextRequestIn < Date.now())
        return CircuitBreakerStatus.HALF_OPEN;
      return CircuitBreakerStatus.OPEN;
    }
    return CircuitBreakerStatus.CLOSE;
  }
}
