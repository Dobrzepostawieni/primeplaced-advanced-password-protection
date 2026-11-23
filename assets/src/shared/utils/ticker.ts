import { useEffect, useState } from '@wordpress/element';

class TickerManager {
	private static instance: TickerManager;
	private timeoutIdentifier: ReturnType<typeof setTimeout> | null = null;
	private intervalIdentifier: ReturnType<typeof setInterval> | null = null;
	private activeSubscribers = new Set<(currentTick: number) => void>();
	private totalElapsedTicks = 0;

	// eslint-disable-next-line no-useless-constructor,
	private constructor() {
		// Intentionally empty to prevent external instantiation.
	}

	static getInstance() {
		if (!TickerManager.instance) {
			TickerManager.instance = new TickerManager();
		}
		return TickerManager.instance;
	}

	subscribe(subscriberCallback: (currentTick: number) => void) {
		this.activeSubscribers.add(subscriberCallback);
		this.startTrackingTimeIfRequired();
	}

	unsubscribe(subscriberCallback: (currentTick: number) => void) {
		this.activeSubscribers.delete(subscriberCallback);
		this.stopTrackingTimeIfNoSubscribers();
	}

	private startTrackingTimeIfRequired() {
		if (
			!this.timeoutIdentifier &&
			!this.intervalIdentifier &&
			this.activeSubscribers.size > 0
		) {
			const currentTimestampInMilliseconds = Date.now();

			const millisecondsUntilNextFullMinute =
				60000 - (currentTimestampInMilliseconds % 60000) + 100;

			this.timeoutIdentifier = setTimeout(() => {
				this.timeoutIdentifier = null;
				this.notifyAllSubscribers();

				this.intervalIdentifier = setInterval(() => {
					this.notifyAllSubscribers();
				}, 60000);
			}, millisecondsUntilNextFullMinute);
		}
	}

	private notifyAllSubscribers() {
		this.totalElapsedTicks++;
		this.activeSubscribers.forEach((subscriberCallback) =>
			subscriberCallback(this.totalElapsedTicks)
		);
	}

	private stopTrackingTimeIfNoSubscribers() {
		if (this.activeSubscribers.size === 0) {
			if (this.timeoutIdentifier) {
				clearTimeout(this.timeoutIdentifier);
				this.timeoutIdentifier = null;
			}
			if (this.intervalIdentifier) {
				clearInterval(this.intervalIdentifier);
				this.intervalIdentifier = null;
			}
		}
	}
}

export const useSmartTicker = (isTimeTrackingRequired: boolean) => {
	const [elapsedTicks, setElapsedTicks] = useState(0);

	useEffect(() => {
		if (!isTimeTrackingRequired) {
			return;
		}

		const tickerManagerInstance = TickerManager.getInstance();
		const handleTickUpdate = (updatedTickCount: number) =>
			setElapsedTicks(updatedTickCount);

		tickerManagerInstance.subscribe(handleTickUpdate);

		return () => {
			tickerManagerInstance.unsubscribe(handleTickUpdate);
		};
	}, [isTimeTrackingRequired]);

	return elapsedTicks;
};
