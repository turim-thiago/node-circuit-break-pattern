import CircuitBreaker from 'opossum';
import { setTimeout } from 'timers/promises';

describe('CircuitBreaker - Opossum', () => {
  let name: string;
  let requester: jest.Mock<any>;
  let timeout: number;
  let errorThresholdPercentage: number;
  let resetTimeout!: number;
  let sut: CircuitBreaker;

  beforeAll(() => {
    name = 'test-case';
    requester = jest.fn();
    requester.mockResolvedValue({
      any_property: 'any_value',
    });
    timeout = 5000;
    errorThresholdPercentage = 50;
    resetTimeout = 3000;
  });

  beforeEach(() => {
    sut = new CircuitBreaker(requester, {
      name,
      timeout,
      errorThresholdPercentage,
      resetTimeout,
    });
  });

  it('should call requester', async () => {
    await sut.fire();
    expect(requester).toHaveBeenCalled();
    expect(sut.name).toEqual(name);
  });

  it('should close status when threshold less than 50%', async () => {
    const result = await sut.fire();
    expect(requester).toHaveBeenCalled();
    expect(result).toBeTruthy();
    expect(sut.opened).toEqual(false);
    expect(sut.closed).toEqual(true);
    expect(sut.halfOpen).toEqual(false);
  });

  it('should open status when threshold is 50%', async () => {
    requester
      .mockRejectedValueOnce(new Error('any_error_1'))
      .mockRejectedValueOnce(new Error('any_error_2'));
    const promise1 = sut.fire();
    await expect(promise1).rejects.toThrow();
    expect(requester).toHaveBeenCalled();
    const promise2 = sut.fire();
    await expect(promise2).rejects.toThrow();
    expect(requester).toHaveBeenCalledTimes(1);
    expect(sut.opened).toEqual(true);
    expect(sut.closed).toEqual(false);
    expect(sut.halfOpen).toEqual(false);
  });

  it('should half open status when threshold more than 50% and after reset time', async () => {
    requester
      .mockRejectedValueOnce(new Error('any_error_1'));
    const promise =  sut.fire();
    expect(requester).toHaveBeenCalled();
    await expect(promise).rejects.toThrow();
    await setTimeout(resetTimeout);
    expect(sut.opened).toEqual(false);
    expect(sut.closed).toEqual(false);
    expect(sut.halfOpen).toEqual(true);
  }, resetTimeout + 10);

  it('should open status when threshold more than 50% and before reset time', async () => {
    requester
      .mockRejectedValueOnce(new Error('any_error_1'));
    const promise =  sut.fire();
    expect(requester).toHaveBeenCalled();
    await expect(promise).rejects.toThrow();
    await setTimeout(resetTimeout - 1000);
    expect(sut.opened).toEqual(true);
    expect(sut.closed).toEqual(false);
    expect(sut.halfOpen).toEqual(false);
  }, resetTimeout + 10);
});
