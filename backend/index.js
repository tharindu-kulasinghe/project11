const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');
const path = require('path');
const userRoutes = require('./src/routes/userRoutes');
const vehicleRoutes = require('./src/routes/vehicleRoutes');
const bookingRouter = require('./src/routes/bookingRoutes');
const trackingDeviceRouter = require('./src/routes/trackingDeviceRoutes');
const locationRouter = require('./src/routes/locationRoutes');
const systemRouter = require('./src/routes/systemRoutes');
const wishlistRoutes = require('./src/routes/wishlistRoutes');
const reviewRouter = require('./src/routes/reviewRouter');
const contactRouter = require('./src/routes/contactRouter');
const vehicleTypeRouter = require('./src/routes/vehicleRouterType');

const app = express();
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors('*'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve uploaded images (multer stores in src/uploads/images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads', 'images')));

app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRouter);
app.use('/api/tracking-devices', trackingDeviceRouter);
app.use('/api/locations', locationRouter);
app.use('/api/system', systemRouter);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRouter);
app.use('/api/contacts', contactRouter);
app.use('/api/vehicle-types', vehicleTypeRouter);

mongoose.connect(MONGO_URI).then(() => {

  console.log('MongoDB connected');

  app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
  });

}).catch((err) => {
  console.error('Mongo connection error:', err);
  process.exit(1);
});