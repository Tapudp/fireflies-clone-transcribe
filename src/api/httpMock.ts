// Helper for HTTP responses
const httpMock = {
    success: <T>(data: T, delay = 0): Promise<T> =>
        new Promise<T>(resolve =>
            setTimeout(() => resolve(data), delay)
        ),
    error: (message: string, status = 400): Promise<never> =>
        Promise.reject({ status, message })
};

export default httpMock;