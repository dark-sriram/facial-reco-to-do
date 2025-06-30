import ratelimit from "../config/upstash.js"

const rateLimiter = async (req, res, next) => {
    try {
        // Skip rate limiting if upstash is not configured
        if (!ratelimit) {
            return next();
        }

        const identifier = req.ip || req.connection.remoteAddress || 'anonymous';
        const { success, limit, remaining, reset } = await ratelimit.limit(identifier);

        // Add rate limit headers
        res.set({
            'X-RateLimit-Limit': limit,
            'X-RateLimit-Remaining': remaining,
            'X-RateLimit-Reset': new Date(reset)
        });

        if (!success) {
            return res.status(429).json({
                message: "Too many requests. Please try again later.",
                error: "Rate limit exceeded",
                retryAfter: Math.round((reset - Date.now()) / 1000)
            });
        }

        next();
    } catch (error) {
        console.error("Rate limiter error:", error);
        // Don't block requests if rate limiter fails
        next();
    }
}

export default rateLimiter;