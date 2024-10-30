import { Request, Response, NextFunction } from 'express';

const createErrorResponse = (status: number, message: string) => ({
  status,
  message,
  timestamp: new Date().toISOString()
});
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized - Please login to access this resource' });
};

export const validateAuthRequest = (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;
  
  const validationErrors = [];
  
  if (!username) validationErrors.push('Username is required');
  else if (username.length < 3) validationErrors.push('Username must be at least 3 characters long');
  
  if (!password) validationErrors.push('Password is required');
  else if (password.length < 6) validationErrors.push('Password must be at least 6 characters long');
  
  if (validationErrors.length > 0) {
    return res.status(400).json(createErrorResponse(400, validationErrors.join(', ')));
  }
  
  next();
};