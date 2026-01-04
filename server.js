import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ticket-booking')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Schemas
const eventSchema = new mongoose.Schema({
  title: String,
  category: String,
  image: String,
  date: String,
  time: String,
  venue: String,
  price: Number,
  availableSeats: Number,
});

const bookingSchema = new mongoose.Schema({
  event: eventSchema,
  seats: [{ id: String, row: String, number: Number, price: Number }],
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  totalAmount: Number,
  bookingDate: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  role: { type: String, default: 'user' },
});

// Models
const Event = mongoose.model('Event', eventSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Routes
app.get('/api/events', async (req, res) => {
  try {
     const events = await Event.find();
     const eventsWithId = events.map(event => ({ ...event.toObject(), id: event._id.toString() }));
    // const eventsWithId = [
    //   {
    //     id: "1",
    //     title: "Summer Music Festival 2025",
    //     category: "concert",
    //     image: "https://images.unsplash.com/photo-1566735355837-2269c24e644e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwc3RhZ2UlMjBwZXJmb3JtYW5jZXxlbnwxfHx8fDE3NjU5NDgzMzB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    //     date: "June 15, 2025",
    //     time: "7:00 PM",
    //     venue: "Madison Square Garden, New York",
    //     price: 50,
    //     availableSeats: 120,
    //   },
    //   {
    //     id: "2",
    //     title: "The Grand Cinema Experience",
    //     category: "movie",
    //     image: "https://images.unsplash.com/photo-1739433437912-cca661ba902f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHRoZWF0ZXIlMjBjaW5lbWF8ZW58MXx8fHwxNzY1OTM0NjI0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    //     date: "December 20, 2025",
    //     time: "3:00 PM",
    //     venue: "AMC Empire 25, Times Square",
    //     price: 15,
    //     availableSeats: 80,
    //   }
    // ];
    res.json(eventsWithId);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.json({ ...event.toObject(), id: event._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET bookings
// If query param mine=true is provided, require Authorization: Bearer <token> and return only the requesting user's bookings
app.get('/api/bookings', async (req, res) => {
  try {
    if (req.query.mine === 'true') {
      const auth = req.headers.authorization || '';
      if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
      const token = auth.slice(7);
      const secret = process.env.JWT_SECRET || 'change_this_secret';
      let payload;
      try {
        payload = jwt.verify(token, secret);
      } catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      const userId = payload.id;
      const bookings = await Booking.find({ user: userId });
      const bookingsWithId = bookings.map(booking => ({ ...booking.toObject(), id: booking._id.toString() }));
      return res.json(bookingsWithId);
    }

    const bookings = await Booking.find();
    const bookingsWithId = bookings.map(booking => ({ ...booking.toObject(), id: booking._id.toString() }));
    res.json(bookingsWithId);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create booking (if Authorization header with JWT present, attach booking to user)
app.post('/api/bookings', async (req, res) => {
  try {
    const data = { ...req.body };

    // If token provided, attach user id and ensure customerEmail matches user's email
    const auth = req.headers.authorization || '';
    if (auth.startsWith('Bearer ')) {
      try {
        const token = auth.slice(7);
        const secret = process.env.JWT_SECRET || 'change_this_secret';
        const payload = jwt.verify(token, secret);
        const user = await User.findById(payload.id);
        if (user) {
          data.user = user._id;
          data.customerEmail = user.email;
          data.customerName = data.customerName || user.name;
          data.customerPhone = data.customerPhone || user.phone;
        }
      } catch (e) {
        // ignore token errors - proceed without user
      }
    }

    const booking = new Booking(data);
    await booking.save();
    res.json({ ...booking.toObject(), id: booking._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ...event.toObject(), id: event._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ...booking.toObject(), id: booking._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/bookings/:id', async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Newsletter and Contacts
const newsletterSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  subscribedAt: { type: Date, default: Date.now },
});

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const Newsletter = mongoose.models.Newsletter || mongoose.model('Newsletter', newsletterSchema);
const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post('/api/newsletter', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !emailRegex.test(email)) return res.status(400).json({ error: 'Invalid email' });

    const exists = await Newsletter.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Already subscribed' });

    const n = new Newsletter({ email });
    await n.save();
    res.json({ id: n._id, email: n.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !message || !email || !emailRegex.test(email)) return res.status(400).json({ error: 'Invalid contact data' });
    const cleanedPhone = phone ? phone.replace(/[^\d]/g, '') : '';
    if (!cleanedPhone || cleanedPhone.length !== 10) return res.status(400).json({ error: 'Invalid phone' });

    const c = new Contact({ name, email, phone, message });
    await c.save();
    res.json({ id: c._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User login (returns JWT)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const secret = process.env.JWT_SECRET || 'change_this_secret';
    const token = jwt.sign({ id: user._id.toString(), role: user.role }, secret, { expiresIn: '7d' });

    const safeUser = { id: user._id.toString(), name: user.name, email: user.email, phone: user.phone, role: user.role };
    res.json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user profile
app.get('/api/me', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
    const token = auth.slice(7);
    const secret = process.env.JWT_SECRET || 'change_this_secret';
    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user._id.toString(), name: user.name, email: user.email, phone: user.phone, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});