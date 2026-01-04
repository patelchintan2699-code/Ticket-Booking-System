import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const events = [
  {
    title: "Summer Music Festival 2025",
    category: "concert",
    image: "https://images.unsplash.com/photo-1566735355837-2269c24e644e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwc3RhZ2UlMjBwZXJmb3JtYW5jZXxlbnwxfHx8fDE3NjU5NDgzMzB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    date: "June 15, 2025",
    time: "7:00 PM",
    venue: "Madison Square Garden, New York",
    price: 50,
    availableSeats: 120,
  },
  {
    title: "The Grand Cinema Experience",
    category: "movie",
    image: "https://images.unsplash.com/photo-1739433437912-cca661ba902f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHRoZWF0ZXIlMjBjaW5lbWF8ZW58MXx8fHwxNzY1OTM0NjI0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    date: "December 20, 2025",
    time: "3:00 PM",
    venue: "AMC Empire 25, Times Square",
    price: 15,
    availableSeats: 80,
  },
  {
    title: "Championship Finals 2025",
    category: "sports",
    image: "https://images.unsplash.com/photo-1565483276060-e6730c0cc6a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBzdGFkaXVtfGVufDF8fHx8MTc2NTkxODYwM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    date: "July 4, 2025",
    time: "6:30 PM",
    venue: "MetLife Stadium, New Jersey",
    price: 80,
    availableSeats: 200,
  },
  {
    title: "Broadway: The Musical",
    category: "theater",
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwcGVyZm9ybWFuY2V8ZW58MXx8fHwxNzY1OTU4MDkyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    date: "August 10, 2025",
    time: "8:00 PM",
    venue: "Gershwin Theatre, Broadway",
    price: 120,
    availableSeats: 60,
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ticket-booking');
    console.log('MongoDB connected');

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

    const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

    await Event.deleteMany({});
    const insertedEvents = await Event.insertMany(events);
    console.log('Events seeded successfully');

    const bookingSchema = new mongoose.Schema({
      event: eventSchema,
      seats: [{ id: String, row: String, number: Number }],
      customerName: String,
      customerEmail: String,
      customerPhone: String,
      totalAmount: Number,
      bookingDate: String,
    });

    const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

    await Booking.deleteMany({});

    // Create one sample booking per event
    const bookings = insertedEvents.map((e, idx) => {
      const seatsCount = Math.min(4, Math.max(1, Math.floor(Math.random() * 3) + 1)); // 1-3 seats
      const seats = Array.from({ length: seatsCount }).map((_, sIdx) => {
        const row = String.fromCharCode(65 + (idx % 6)); // A-F
        const number = sIdx + 1;
        return { id: `${row}${number}`, row, number, price: e.price };
      });

      return {
        event: e.toObject(),
        seats,
        customerName: `Customer ${idx + 1}`,
        customerEmail: `customer${idx + 1}@example.com`,
        customerPhone: `+1555000${idx + 1}`,
        totalAmount: e.price * seats.length,
        bookingDate: new Date().toISOString(),
      };
    });

    await Booking.insertMany(bookings);
    console.log('Bookings seeded successfully');

    // --- Users seeding ---
    const hashPassword = (pwd) => bcrypt.hashSync(pwd, 10);

    const users = [
      { name: 'Alice Johnson', email: 'alice@example.com', phone: '+15550001', password: hashPassword('password123'), role: 'user' },
      { name: 'Bob Smith', email: 'bob@example.com', phone: '+15550002', password: hashPassword('password123'), role: 'user' },
      { name: 'Admin User', email: 'admin@example.com', phone: '+15550003', password: hashPassword('adminpass'), role: 'admin' },
    ];

    const userSchema = new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      phone: String,
      password: String,
      role: { type: String, default: 'user' },
    });

    const User = mongoose.models.User || mongoose.model('User', userSchema);

    await User.deleteMany({});
    await User.insertMany(users);
    console.log('Users seeded successfully');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();