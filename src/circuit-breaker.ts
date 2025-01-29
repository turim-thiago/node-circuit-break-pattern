export enum CircuitBreakerStatus {
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
  CLOSE = 'CLOSE',
}

export class CircuitBreaker {
  private readonly requester: any;
  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private numberOfCalls: number = 0;
  private nextRequestIn: number;
  private readonly fallback?: any;

  constructor({
    requester,
    failureThreshold,
    resetTimeoutInMs,
    fallback,
  }: {
    requester: any;
    failureThreshold: number;
    resetTimeoutInMs: number;
    fallback?: any;
  }) {
    this.requester = requester;
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeoutInMs;
    this.nextRequestIn = Date.now();
    this.fallback = fallback;
  }

  public async fire(...args: any[]): Promise<any> {
    if (this.status === CircuitBreakerStatus.OPEN) {
      if (this.fallback) {
        return this.fallback();
      }
      return;
    }
    try {
      const result = await this.requester(args);
      this.numberOfCalls = 0;
      return result;
    } catch (error) {
      this.numberOfCalls++;
      this.nextRequestIn = Date.now() + this.resetTimeout;
      if (this.fallback) {
        return this.fallback();
      }
    }
  }

  get status(): CircuitBreakerStatus {
    console.log(this.numberOfCalls, this.failureThreshold)
    if (this.numberOfCalls >= this.failureThreshold) {
      if (this.nextRequestIn < Date.now())
        return CircuitBreakerStatus.HALF_OPEN;
      return CircuitBreakerStatus.OPEN;
    }
    return CircuitBreakerStatus.CLOSE;
  }
}
