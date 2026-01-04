import { useState } from "react";
import { Event } from "./EventCard";
import { Booking } from "../App";
import { Button } from "./Button";
import { 
  LayoutDashboard, 
  Calendar, 
  Ticket, 
  DollarSign, 
  Users,
  LogOut,
  TrendingUp
} from "lucide-react";
import { AdminBookings } from "./AdminBookings";
import { EventManagement } from "./EventManagement";

interface AdminDashboardProps {
  events: Event[];
  bookings: Booking[];
  onLogout: () => void;
  onAddEvent: (event: Omit<Event, "id">) => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
}

type AdminView = "dashboard" | "events" | "bookings";

export function AdminDashboard({ 
  events, 
  bookings, 
  onLogout,
  onAddEvent,
  onEditEvent,
  onDeleteEvent
}: AdminDashboardProps) {
  const [activeView, setActiveView] = useState<AdminView>("dashboard");
  // Calculate statistics
  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
  const totalTickets = bookings.reduce((sum, booking) => sum + (booking.seats?.length || 0), 0);
  const recentBookings = bookings.slice(-5).reverse();

  // Aggregate stats by category with per-event details
  const categoryStats = events.reduce((acc, event) => {
    const eventBookings = bookings.filter(b => {
      const eventRef = (b.event as any);
      const eventId = eventRef?._id ?? eventRef ?? null;
      return String(eventId) === String(event.id);
    });

    const revenue = eventBookings.reduce((s, b) => s + (b.totalAmount || 0), 0);
    const tickets = eventBookings.reduce((s, b) => s + (b.seats?.length || 0), 0);
    const bookingsCount = eventBookings.length;

    if (!acc[event.category]) {
      acc[event.category] = { revenue: 0, tickets: 0, bookings: 0, events: [] };
    }

    acc[event.category].revenue += revenue;
    acc[event.category].tickets += tickets;
    acc[event.category].bookings += bookingsCount;
    acc[event.category].events.push({ ...event, revenue, tickets });

    return acc;
  }, {} as Record<string, { revenue: number; tickets: number; bookings: number; events: Array<Event & { revenue: number; tickets: number }> }>);

  return (
    <div className="flex min-h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r">
        <div className="p-4 border-b">
          <h3>Admin Panel</h3>
        </div>
        
        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveView("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              activeView === "dashboard"
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <LayoutDashboard className="size-5" />
            <span>Dashboard</span>
          </button>
          
          <button
            onClick={() => setActiveView("events")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              activeView === "events"
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Calendar className="size-5" />
            <span>Event Management</span>
          </button>
          
          <button
            onClick={() => setActiveView("bookings")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              activeView === "bookings"
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Ticket className="size-5" />
            <span>All Bookings</span>
          </button>
        </nav>

        {/* <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="outline"
            onClick={onLogout}
            className="w-full justify-start"
          >
            <LogOut className="size-5 mr-2" />
            Logout
          </Button>
        </div> */}
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-8 overflow-auto">
        {activeView === "dashboard" && (
          <div>
            <h1 className="mb-6">Dashboard Overview</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <DollarSign className="size-5 text-green-600" />
                </div>
                <p className="text-green-600">₹{totalRevenue.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Bookings</span>
                  <Ticket className="size-5 text-blue-600" />
                </div>
                <p className="text-blue-600">{bookings.length}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Tickets Sold</span>
                  <Users className="size-5 text-purple-600" />
                </div>
                <p className="text-purple-600">{totalTickets}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Active Events</span>
                  <Calendar className="size-5 text-orange-600" />
                </div>
                <p className="text-orange-600">{events.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue by Category */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="size-5 text-blue-600" />
                  <h3>Revenue by Category</h3>
                </div>
                <div className="space-y-4">
                  {Object.entries(categoryStats).length > 0 ? (
                    Object.entries(categoryStats).map(([category, stat]) => (
                      <div key={category}>
                        <div className="flex justify-between mb-1 text-sm">
                          <span className="capitalize">{category}</span>
                          <span className="text-blue-600">₹{stat.revenue.toFixed(2)}</span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${totalRevenue ? (stat.revenue / totalRevenue) * 100 : 0}%` }}
                          />
                        </div>

                        <div className="text-xs text-gray-600 mb-2">
                          <span className="mr-3">{stat.bookings} booking(s)</span>
                          <span>{stat.tickets} ticket(s)</span>
                        </div>

                        <div className="space-y-1">
                          {stat.events.map((ev) => (
                            <div key={ev.id} className="text-xs text-gray-700 flex justify-between">
                              <span className="truncate">{ev.title}</span>
                              <span className="text-gray-500">₹{ev.revenue.toFixed(2)} · {ev.tickets}t</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No revenue data yet</p>
                  )}
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="mb-4">Recent Bookings</h3>
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm">{booking.event.title}</p>
                        <p className="text-xs text-gray-600">{booking.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-600">₹{booking.totalAmount}</p>
                        <p className="text-xs text-gray-500">{booking.seats.length} seat(s)</p>
                      </div>
                    </div>
                  ))}
                  {recentBookings.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No bookings yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === "events" && (
          <EventManagement
            events={events}
            bookings={bookings}
            onAddEvent={onAddEvent}
            onEditEvent={onEditEvent}
            onDeleteEvent={onDeleteEvent}
          />
        )}

        {activeView === "bookings" && (
          <AdminBookings bookings={bookings} events={events} />
        )}
      </main>
    </div>
  );
}
