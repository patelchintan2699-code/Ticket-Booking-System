import { useState, useEffect } from "react";
import { EventCard, Event } from "./components/EventCard";
import { SeatSelector, Seat } from "./components/SeatSelector";
import { BookingForm, BookingData } from "./components/BookingForm";
import { BookingConfirmation } from "./components/BookingConfirmation";
import { BookingList } from "./components/BookingList";
import { AdminLogin } from "./components/AdminLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { Button } from "./components/Button";
import { Ticket, Search, Shield } from "lucide-react";

export interface Booking {
  id: string;
  event: Event;
  seats: Seat[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  bookingDate: string;
}

type BookingStep = "browse" | "select-seats" | "booking-form" | "confirmation" | "my-bookings" | "admin-login" | "admin-dashboard";

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentStep, setCurrentStep] = useState<BookingStep>("browse");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [latestBooking, setLatestBooking] = useState<Booking | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch events and bookings on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        debugger;
        console.log('Fetching events...');
        const eventsResponse = await fetch('http://localhost:5000/api/events');
        const eventsData = await eventsResponse.json();
        console.log('Fetched events:', eventsData);
        setEvents(eventsData);

        console.log('Fetching bookings...');
        const bookingsResponse = await fetch('http://localhost:5000/api/bookings');
        const bookingsData = await bookingsResponse.json();
        console.log('Fetched bookings:', bookingsData);
        setBookings(bookingsData);
      } catch (error) {
       console.error('Error Fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Admin functions
  const handleAdminLogin = () => {
    setIsAdmin(true);
    setCurrentStep("admin-dashboard");
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setCurrentStep("browse");
  };

  const handleAddEvent = async (eventData: Omit<Event, "id">) => {
    try {
      console.log('Adding event:', eventData);
      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      const newEvent = await response.json();
      console.log('Added event response:', newEvent);
      setEvents([...events, newEvent]);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleEditEvent = async (updatedEvent: Event) => {
    try {
      const response = await fetch(`http://localhost:5000/api/events/${updatedEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      });
      const savedEvent = await response.json();
      setEvents(events.map(e => e.id === updatedEvent.id ? savedEvent : e));
    } catch (error) {
      console.error('Error editing event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await fetch(`http://localhost:5000/api/events/${eventId}`, {
        method: 'DELETE',
      });
      setEvents(events.filter(e => e.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleBookNow = (event: Event) => {
    setSelectedEvent(event);
    setSelectedSeats([]);
    setCurrentStep("select-seats");
  };

  const handleSeatSelect = (seats: Seat[]) => {
    setSelectedSeats(seats);
  };

  const handleContinueToForm = () => {
    if (selectedSeats.length > 0) {
      setCurrentStep("booking-form");
    }
  };

  const handleBookingSubmit = (bookingData: BookingData) => {
    if (!selectedEvent) return;

    const booking: Booking = {
      id: `BK${Date.now().toString().slice(-8)}`,
      event: selectedEvent,
      seats: selectedSeats,
      customerName: bookingData.name,
      customerEmail: bookingData.email,
      customerPhone: bookingData.phone,
      totalAmount: selectedSeats.reduce((sum, seat) => sum + seat.price, 0),
      bookingDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    setBookings([...bookings, booking]);
    setLatestBooking(booking);
    setCurrentStep("confirmation");
  };

  const handleBackToBrowse = () => {
    setCurrentStep("browse");
    setSelectedEvent(null);
    setSelectedSeats([]);
    setLatestBooking(null);
  };

  const handleViewBookings = () => {
    setCurrentStep("my-bookings");
  };

  const handleOpenAdminLogin = () => {
    setCurrentStep("admin-login");
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get booked seats for the selected event
  const bookedSeatsForEvent = selectedEvent
    ? bookings
        .filter((b) => b.event.id === selectedEvent.id)
        .flatMap((b) => b.seats.map((s) => s.id))
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleBackToBrowse}>
              <Ticket className="size-8 text-blue-600" />
              <h1>TicketBook</h1>
            </div>
            <div className="flex items-center gap-3">
              {!isAdmin && (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleOpenAdminLogin}
                    size="sm"
                  >
                    <Shield className="size-4 mr-2" />
                    Admin
                  </Button>
                  <Button
                    variant={currentStep === "my-bookings" ? "primary" : "outline"}
                    onClick={handleViewBookings}
                    size="sm"
                  >
                    My Bookings ({bookings.length})
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentStep === "admin-login" && (
          <AdminLogin onLogin={handleAdminLogin} onBack={handleBackToBrowse} />
        )}

        {currentStep === "admin-dashboard" && (
          <AdminDashboard
            events={events}
            bookings={bookings}
            onLogout={handleAdminLogout}
            onAddEvent={handleAddEvent}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        )}

        {currentStep === "browse" && (
          <div>
            <div className="mb-8">
              <h2 className="mb-4">Discover Events</h2>
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events or venues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  {["all", "concert", "movie", "sports", "theater"].map((category) => (
                    <button
                      key={category}
                      onClick={() => setCategoryFilter(category)}
                      className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                        categoryFilter === category
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} onBookNow={handleBookNow} />
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">No events found matching your criteria</p>
              </div>
            )}
          </div>
        )}

        {currentStep === "select-seats" && selectedEvent && (
          <div>
            <div className="mb-6">
              <Button variant="ghost" onClick={handleBackToBrowse} size="sm">
                ← Back to Events
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-32 aspect-[4/3] overflow-hidden rounded-lg flex-shrink-0">
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="mb-2">{selectedEvent.title}</h2>
                  <p className="text-sm text-gray-600">
                    {selectedEvent.date} at {selectedEvent.time}
                  </p>
                  <p className="text-sm text-gray-600">{selectedEvent.venue}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="mb-6">Select Your Seats</h3>
              <SeatSelector
                rows={8}
                seatsPerRow={10}
                basePrice={selectedEvent.price}
                bookedSeats={bookedSeatsForEvent}
                onSeatSelect={handleSeatSelect}
              />

              <div className="flex justify-end mt-6">
                <Button
                  onClick={handleContinueToForm}
                  disabled={selectedSeats.length === 0}
                  size="lg"
                >
                  Continue to Booking ({selectedSeats.length} seat
                  {selectedSeats.length !== 1 ? "s" : ""})
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentStep === "booking-form" && selectedEvent && (
          <div>
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep("select-seats")}
                size="sm"
              >
                ← Back to Seat Selection
              </Button>
            </div>

            <BookingForm
              event={selectedEvent}
              selectedSeats={selectedSeats}
              onSubmit={handleBookingSubmit}
              onBack={() => setCurrentStep("select-seats")}
            />
          </div>
        )}

        {currentStep === "confirmation" && latestBooking && (
          <BookingConfirmation
            booking={latestBooking}
            onClose={handleBackToBrowse}
            onViewBookings={handleViewBookings}
          />
        )}

        {currentStep === "my-bookings" && (
          <BookingList bookings={bookings} onBack={handleBackToBrowse} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>&copy; 2025 TicketBook. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;