import mongoose from 'mongoose';
import dotenv from 'dotenv';

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

    const Event = mongoose.model('Event', new mongoose.Schema({
      title: String,
      category: String,
      image: String,
      date: String,
      time: String,
      venue: String,
      price: Number,
      availableSeats: Number,
    }));

    await Event.deleteMany({});
    await Event.insertMany(events);
    console.log('Events seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();