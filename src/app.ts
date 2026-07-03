import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes';

const app = express();

const allowedOrigins = (
  process.env.CORS_ORIGIN ?? 'http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(routes);

export default app;
