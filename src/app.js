import 'express-async-errors';
import express, { json, urlencoded } from 'express';
import cors from 'cors';
import { errorHandler, notFound } from './middleware/error.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import farmerRoutes from './routes/farmerRoutes.js';
import consumerRoutes from './routes/consumerRoutes.js';
import distributorRoutes from './routes/distributorRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import mapsRoutes from './routes/mapsRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import prebookingRoutes from './routes/prebookingRoutes.js';
import negotiationRoutes from './routes/negotiationRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(json({ limit: '50mb' }));
app.use(urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'KrishiSetu API is running...' });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/consumer', consumerRoutes);
app.use('/api/distributor', distributorRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/prebooking', prebookingRoutes);
app.use('/api/negotiation', negotiationRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
