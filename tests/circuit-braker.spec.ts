import { CircuitBreaker, CircuitBreakerStatus } from '../src/circuit-braker';
import { setTimeout } from 'timers/promises';
import { mock, MockProxy } from 'jest-mock-extended';

describe('CircuitBreaker', () => {
  let url: string;
  let requester: jest.Mock<any>;
  let failureThreshold: number;
  let resetTimeoutInMs: number;
  let sut: CircuitBreaker;

  beforeAll(() => {
    url = 'http://any_host/any_resource';
    failureThreshold = 2;
    resetTimeoutInMs = 3000;
    requester = jest.fn();
    requester.mockResolvedValue({
      any_property: 'any_value'
    })
  });

  beforeEach(()=>{
    sut = new CircuitBreaker({
      requester,
      failureThreshold,
      resetTimeoutInMs,
    });
  })

  it('should status HALF_OPEN when failure Threshold is max and reset time is valid', async () => {
    requester
      .mockRejectedValueOnce(new Error('Erro trying first time'))
      .mockRejectedValueOnce(new Error('Erro trying twice'));
    await sut.fire();
    await sut.fire();
    await setTimeout(3001);
    expect(sut.status).toEqual(CircuitBreakerStatus.HALF_OPEN);
  });

  it('should status OPEN when failure Threshold is max and reset time is invalid', async () => {
    requester
      .mockRejectedValueOnce(new Error('Erro trying first time'))
      .mockRejectedValueOnce(new Error('Erro trying twice'));
    await sut.fire();
    await sut.fire();
    await setTimeout(2999);
    expect(sut.status).toEqual(CircuitBreakerStatus.OPEN);
  });

  it('should status OPEN when failure Threshold is max and request when HALF_OPEN gets error', async () => {
    requester
      .mockRejectedValueOnce(new Error('Erro trying first time'))
      .mockRejectedValueOnce(new Error('Erro trying twice'))
      .mockRejectedValueOnce(new Error('Erro three times'));
    await sut.fire();
    await sut.fire();
    expect(sut.status).toEqual(CircuitBreakerStatus.OPEN);
    await setTimeout(3001);
    expect(sut.status).toEqual(CircuitBreakerStatus.HALF_OPEN);
    await sut.fire();
    expect(sut.status).toEqual(CircuitBreakerStatus.OPEN);
  });

  it('should status CLOSE when failure Threshold is max and HANF_OPEN valid next request', async () => {
    requester
      .mockRejectedValueOnce(new Error('Erro trying first time'))
      .mockRejectedValueOnce(new Error('Erro trying twice'))
    await sut.fire();
    await sut.fire();
    await setTimeout(3001);
    await sut.fire();
    expect(sut.status).toEqual(CircuitBreakerStatus.CLOSE);
  });

  it('should status CLOSE when failure Threshold not max', async () => {
    requester
      .mockRejectedValueOnce(new Error('Erro trying first time'));
    await sut.fire();
    await sut.fire();
    expect(sut.status).toEqual(CircuitBreakerStatus.CLOSE);
  });

});
