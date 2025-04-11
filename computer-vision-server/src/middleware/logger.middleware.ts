import { Request, Response, NextFunction } from 'express';

export const requestLogger = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	const start = Date.now();

	// Log request details
	console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

	// Log response time when response finishes
	res.on('finish', () => {
		const duration = Date.now() - start;
		console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
	});

	next();
};
