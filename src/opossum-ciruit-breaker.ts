export class OpossumCircuitBreaker{

	private readonly timeout: number;
	private readonly errorThresholdPercentage: number;
	private readonly resetTimeout: number;
	private readonly requester: any;

	constructor({
		requester,
		timeout,
		errorThresholdPercentage,
		resetTimeout
	}:{
		requester: any;
		timeout: number;
		errorThresholdPercentage: number;
		resetTimeout: number;
	}){
		this.errorThresholdPercentage = errorThresholdPercentage;
		this.resetTimeout = resetTimeout;
		this.timeout = timeout;
		this.requester = requester;
	}	

}