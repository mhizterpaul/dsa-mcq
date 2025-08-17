import { metricsService } from '../../analytics/services/metricsService';

const originalFetch = global.fetch;

export const instrumentedFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const startTime = performance.now();
    let response: Response;

    try {
        response = await originalFetch(input, init);
        const endTime = performance.now();
        const latency = endTime - startTime;

        const contentLength = response.headers.get('content-length');
        let throughput = 0;
        if (contentLength) {
            const bytes = parseInt(contentLength, 10);
            const durationInSeconds = latency / 1000;
            throughput = (bytes / 1024) / durationInSeconds; // kbps
        }

        // Assuming no packet loss for successful requests for now
        metricsService.logNetworkRequest(latency, throughput, 0);

        // Also log hydration latency if it's a hydration-related endpoint
        const url = typeof input === 'string' ? input : input.url;
        if (url.includes('hydrate')) { // A simple convention
            metricsService.logHydrationLatency(url, latency, 'completed');
        }

        return response;

    } catch (error) {
        const endTime = performance.now();
        const latency = endTime - startTime;
        // Log failed network request
        metricsService.logNetworkRequest(latency, 0, 100); // Assume 100% packet loss on failure

        // Log handled error
        if (error instanceof Error) {
            metricsService.logHandledError('NETWORK_ERROR', error.message, 'high');
        }

        throw error;
    }
};

export const applyFetchWrapper = () => {
    global.fetch = instrumentedFetch;
};
