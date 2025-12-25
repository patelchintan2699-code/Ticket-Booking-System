import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/')
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
  seats: [{ id: String, row: String, number: Number }],
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  totalAmount: Number,
  bookingDate: String,
});

// Models
const Event = mongoose.model('Event', eventSchema);
const Booking = mongoose.model('Booking', bookingSchema);

// Routes
app.get('/api/events', async (req, res) => {
  try {
    debugger;
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

app.get('/api/bookings', async (req, res) => {
  try {
    // const bookings = await Booking.find();
    // const bookingsWithId = bookings.map(booking => ({ ...booking.toObject(), id: booking._id.toString() }));
    const bookingsWithId = [];
    res.json(bookingsWithId);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const booking = new Booking(req.body);
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});