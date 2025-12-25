import { useState } from "react";
import { Booking } from "../App";
import { Seat } from "./SeatSelector";
import { Search, Calendar, MapPin, Users, Mail, Phone } from "lucide-react";

interface AdminBookingsProps {
  bookings: Booking[];
}

export function AdminBookings({ bookings }: AdminBookingsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const filteredBookings = bookings.filter((booking: Booking) => {
    const query = searchQuery.toLowerCase();
    return (
      booking.id.toLowerCase().includes(query) ||
      booking.event.title.toLowerCase().includes(query) ||
      booking.customerName.toLowerCase().includes(query) ||
      booking.customerEmail.toLowerCase().includes(query)
    );
  }).reverse(); // Show most recent first

  return (
    <div>
      <div className="mb-6">
        <h1 className="mb-4">All Bookings</h1>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by booking ID, event, customer name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {filteredBookings.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600">
            {searchQuery ? "No bookings found matching your search" : "No bookings yet"}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredBookings.map((booking: Booking) => (
          <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex gap-4">
              <div className="w-32 aspect-[4/3] overflow-hidden rounded-lg flex-shrink-0">
                <img
                  src={booking.event.image}
                  alt={booking.event.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="mb-1">{booking.event.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full capitalize">
                        {booking.event.category}
                      </span>
                      <span className="text-sm text-gray-600">Booking ID: {booking.id}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-600">Total Amount</span>
                    <p className="text-green-600">${booking.totalAmount}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="size-4" />
                    <span>{booking.event.date} at {booking.event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="size-4" />
                    <span>{booking.event.venue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="size-4" />
                    <span>{booking.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="size-4" />
                    <span>{booking.customerEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="size-4" />
                    <span>{booking.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="size-4" />
                    <span>Booked on {booking.bookingDate}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t">
                  <span className="text-sm text-gray-600">Seats:</span>
                  {booking.seats.map((seat: Seat) => (
                    <span
                      key={seat.id}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                    >
                      {seat.id} (${seat.price})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      {filteredBookings.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="mb-4">Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-blue-600">{filteredBookings.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Tickets</p>
              <p className="text-purple-600">
                {filteredBookings.reduce((sum: number, b: Booking) => sum + b.seats.length, 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-green-600">
                ${filteredBookings.reduce((sum: number, b: Booking) => sum + b.totalAmount, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
