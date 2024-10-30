import express from 'express';
import http from 'http';
import { constituentRoutes } from './src/routes/constituents';
import cors from 'cors';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

console.log(process.env.SESSION_SECRET, "SESSION_SECRET");

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is required');
}

interface User {
  id: number;
  username: string;
  password: string;
}

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      password: string;
    }
  }
}

const users: User[] = [];

const app = express();
const port = 3001;

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  async (username: string, password: string, done) => {
    try {
      const user = users.find(u => u.username === username);
      if (!user) {
        return done(null, false, { message: 'Incorrect username' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: 'Incorrect password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user: User, done) => {
  done(null, user.id);
});

passport.deserializeUser((id: number, done) => {
  const user = users.find(u => u.id === id);
  if (!user) {
    done(new Error('User not found'));
    return;
  }
  done(null, user);
});

const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser: User = {
    id: users.length + 1,
    username,
    password: hashedPassword
  };

  users.push(newUser);
  
  req.login(newUser, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging in after registration' });
    }
    res.status(201).json({ message: 'User registered and logged in successfully' });
  });
});

app.post('/api/login', (req, res, next) => {
  passport.authenticate('local', (err: any, user: Express.User, info: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json(info);
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json({ message: 'Logged in successfully', user: { id: user.id, username: user.username } });
    });
  })(req, res, next);
});

app.get('/api/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/api/check-auth', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ 
      isAuthenticated: true, 
      user: { id: req.user.id, username: req.user.username } 
    });
  } else {
    res.json({ isAuthenticated: false });
  }
});

app.get('/api/profile', isAuthenticated, (req, res) => {
  res.json(req.user);
});

app.use('/api/constituents', constituentRoutes);

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});