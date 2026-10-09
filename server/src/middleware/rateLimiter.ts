import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 login/register attempts per 15 min
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const agentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 40, // 40 AI queries per 5 min
  message: {
    success: false,
    message: 'AI Agent rate limit reached. Please wait a moment before sending more requests.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
