import { useState, useEffect } from "react";
import { EventCard, Event } from "./components/EventCard";
import { SeatSelector, Seat } from "./components/SeatSelector";
import { BookingForm, BookingData } from "./components/BookingForm";
import { BookingConfirmation } from "./components/BookingConfirmation";
import { BookingList } from "./components/BookingList";
import { AdminLogin } from "./components/AdminLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { Button } from "./components/Button";
import { Ticket, Search } from "lucide-react";
import { Landing } from "./components/Landing";
import { UserLogin } from "./components/UserLogin";

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

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

type BookingStep = "home" | "browse" | "select-seats" | "booking-form" | "confirmation" | "my-bookings" | "login" | "admin-login" | "admin-dashboard";

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentStep, setCurrentStep] = useState<BookingStep>("home");
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [latestBooking, setLatestBooking] = useState<Booking | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [bookedSeatsForEvent, setBookedSeatsForEvent] = useState<string[]>([]);

  // Fetch events on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching events...');
        const eventsResponse = await fetch('http://localhost:5000/api/events');
        const eventsData = await eventsResponse.json();
        console.log('Fetched events:', eventsData);
        setEvents(eventsData);
      } catch (error) {
       console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Sync with URL path for /admin route
  useEffect(() => {
    const syncRoute = () => {
      const path = window.location.pathname;
      if (path === '/admin') {
        if (user?.role === 'admin') {
          setCurrentStep('admin-dashboard');
        } else {
          setCurrentStep('admin-login');
        }
      }
    };
    syncRoute();
    const onPop = () => syncRoute();
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [user]);

  // Fetch bookings for the logged-in user
  const fetchMyBookings = async (token?: string) => {
    try {
      const t = token || localStorage.getItem('token');
      if (!t) {
        setMyBookings([]);
        setBookings([]);
        return;
      }

      // determine whether the current user is an admin
      const isAdminUser = user?.role === 'admin' || (() => {
        try {
          const raw = localStorage.getItem('user');
          const parsed = raw ? JSON.parse(raw) : null;
          return parsed?.role === 'admin';
        } catch (e) {
          return false;
        }
      })();

      const url = isAdminUser ? 'http://localhost:5000/api/bookings' : 'http://localhost:5000/api/bookings?mine=true';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!res.ok) {
        console.error('Failed to fetch user bookings', res.status);
        setMyBookings([]);
        setBookings([]);
        return;
      }

      const data = await res.json();
      // For admins, the API returns all bookings; keep both states in sync
      setMyBookings(isAdminUser ? data : data);
      setBookings(data);
    } catch (err) {
      console.error('Error fetching my bookings:', err);
      setMyBookings([]);
      setBookings([]);
    }
  };

  useEffect(() => {
    if (user) fetchMyBookings();
    else {
      setMyBookings([]);
      setBookings([]);
    }
  }, [user]);

  // Fetch booked seats for selected event from API
  useEffect(() => {
    const fetchBookedSeats = async () => {
      const eventId = selectedEvent?.id;
      if (!eventId) {
        setBookedSeatsForEvent([]);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/events/${eventId}/bookings`);
        if (!res.ok) {
          console.error('Failed to fetch booked seats', res.status);
          setBookedSeatsForEvent([]);
          return;
        }

        const eventBookings: Booking[] = await res.json();
        // Extract and dedupe all seat IDs from the bookings
        const ids = eventBookings.flatMap((booking) => booking.seats.map((seat: any) => seat.id));
        const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
        setBookedSeatsForEvent(uniqueIds);
      } catch (err) {
        console.error('Error fetching booked seats:', err);
        setBookedSeatsForEvent([]);
      }
    };

    fetchBookedSeats();
  }, [selectedEvent?.id]);

  // Admin functions
  const handleAdminLogin = (res?: { user: any; token: string }) => {
    // If called with credentials (from AdminLogin) use them
    if (res) {
      const { user, token } = res;
      if (user?.role === 'admin') {
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        window.history.pushState({}, '', '/admin');
        setIsAdmin(true);
        setCurrentStep('admin-dashboard');
        return;
      } else {
        // Not an admin — fall back to admin login view
        setIsAdmin(false);
        setCurrentStep('admin-login');
        return;
      }
    }

    // Fallback: open admin dashboard if already flagged as admin
    if (isAdmin) {
      window.history.pushState({}, '', '/admin');
      setCurrentStep('admin-dashboard');
    } else {
      setCurrentStep('admin-login');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setCurrentStep('browse');
    window.history.pushState({}, '', '/');
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
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

  const handleBookingSubmit = async (bookingData: BookingData) => {
    if (!selectedEvent) return;

    const payload = {
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

    try {
      const token = localStorage.getItem('token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Server responded ${response.status}`);

      const saved = await response.json();
      // Server returns the saved booking with `id` property
      const bookingFromServer: Booking = {
        id: saved.id || (saved._id ? String(saved._id) : `BK${Date.now().toString().slice(-8)}`),
        event: saved.event,
        seats: saved.seats,
        customerName: saved.customerName,
        customerEmail: saved.customerEmail,
        customerPhone: saved.customerPhone,
        totalAmount: saved.totalAmount,
        bookingDate: saved.bookingDate,
      };

      // If this booking belongs to the logged-in user, refresh their bookings
      if (user) {
        await fetchMyBookings();
      } else {
        setBookings((prev) => [...prev, bookingFromServer]);
      }

      // Refresh booked seats for the selected event to show newly booked seats
      if (selectedEvent?.id) {
        try {
          const res = await fetch(`http://localhost:5000/api/events/${selectedEvent.id}/bookings`);
          if (res.ok) {
            const eventBookings: Booking[] = await res.json();
            const ids = eventBookings.flatMap((booking) => booking.seats.map((seat: any) => seat.id));
            const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
            setBookedSeatsForEvent(uniqueIds);
          }
        } catch (err) {
          console.error('Error refreshing booked seats:', err);
        }
      }

      setLatestBooking(bookingFromServer);
      setCurrentStep("confirmation");
    } catch (error) {
      console.error('Error creating booking on server, falling back to local:', error);
      // Fallback: create locally so UX is preserved
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

      setBookings((prev) => [...prev, booking]);
      setLatestBooking(booking);
      setCurrentStep("confirmation");
    }
  };

  const handleBackToBrowse = () => {
    setCurrentStep("browse");
    setSelectedEvent(null);
    setSelectedSeats([]);
    setLatestBooking(null);
  };

  const handleViewBookings = async () => {
    if (user) await fetchMyBookings();
    setCurrentStep("my-bookings");
  };

  const handleOpenAdminLogin = () => {
    window.history.pushState({}, '', '/admin');
    setCurrentStep('admin-login');
  };

  const handleSignOut = () => {
    setUser(null);
    setIsAdmin(false);
    setMyBookings([]);
    setBookings([]);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentStep('home');
    window.history.pushState({}, '', '/');
  }; 

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Bookings for the logged-in user
  // `myBookings` is now managed in state (`myBookings` state) and fetched from the server when user logs in.

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentStep('home')}>
              <Ticket className="size-8 text-blue-600" />
              <h1>TicketBook</h1>
            </div>
            <div className="flex items-center gap-3">
              {user && user.role !== 'admin' && (
                  <Button
                    variant={currentStep === "my-bookings" ? "primary" : "outline"}
                    onClick={handleViewBookings}
                    size="sm"
                  >
                    My Bookings ({myBookings.length})
                  </Button>
              )}

              {/* User login */}
              {!user ? (
                <Button variant="ghost" onClick={() => setCurrentStep('login')} size="sm">Sign in</Button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm">Hi, {user.name}</span>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    Sign out
                  </Button>
                </div>
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

        {currentStep === 'login' && (
          <UserLogin
            onLogin={(res) => { setUser(res.user); localStorage.setItem('user', JSON.stringify(res.user)); localStorage.setItem('token', res.token); setIsAdmin(res.user?.role === 'admin'); setCurrentStep('browse'); }}
            onBack={() => setCurrentStep('home')}
          />
        )}

        {currentStep === 'admin-dashboard' && (user?.role === 'admin' || isAdmin) && (
          <AdminDashboard
            events={events}
            bookings={bookings}
            onLogout={handleAdminLogout}
            onAddEvent={handleAddEvent}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        )}

        {currentStep === "home" && (
          <div>
            <Landing events={events} onExplore={() => setCurrentStep('browse')} />
          </div>
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
                totalSeats={selectedEvent.availableSeats}
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
              initialData={{ name: user?.name || '', email: user?.email || '', phone: (user as any)?.phone || '' }}
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
          <BookingList bookings={user ? myBookings : bookings} onBack={handleBackToBrowse} />
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