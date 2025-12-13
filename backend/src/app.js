import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// Enable CORS 
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

// Parse JSON data with size limit
app.use(express.json({ limit: "16kb" }));

// Parse URL-encoded data with extended allow extended obj and size limit
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Serve static files
app.use('/public', express.static('public'));

// Parse cookies for enabling cookie handling and crup operations
app.use(cookieParser());

app.get('/api/healthcheck', (req, res) => {
    return res.json({ status: "success", message: 'Server is Working Fine' });
});


import authRoute from './routes/auth.route.js';
import userRoute from './routes/user.route.js';

app.use('/api/auth',authRoute);
app.use('/api/users',userRoute);

export default app;