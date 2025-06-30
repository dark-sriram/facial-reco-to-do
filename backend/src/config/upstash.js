import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

let ratelimit = null;

try {
    // Only create rate limiter if Redis environment variables are available
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        const redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });

        ratelimit = new Ratelimit({
            redis: redis,
            limiter: Ratelimit.slidingWindow(10, "20 s"),
            analytics: true,
        });

        console.log('✅ Rate limiting enabled with Upstash Redis');
    } else {
        console.log('⚠️  Rate limiting disabled - Redis environment variables not found');
        console.log('💡 Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to enable rate limiting');
    }
} catch (error) {
    console.error('❌ Failed to initialize rate limiter:', error.message);
    console.log('⚠️  Rate limiting disabled due to configuration error');
    ratelimit = null;
}

export default ratelimit;
