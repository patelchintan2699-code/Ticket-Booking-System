import { Ticket, Calendar, MapPin, Clock, Users } from "lucide-react";
import { Booking } from "../App";
import { Button } from "./Button";

interface BookingListProps {
  bookings: Booking[];
  onBack: () => void;
}

export function BookingList({ bookings, onBack }: BookingListProps) {
  if (bookings.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1>My Bookings</h1>
          <Button onClick={onBack}>Browse Events</Button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Ticket className="size-16 text-gray-300 mx-auto mb-4" />
          <h3 className="mb-2">No Bookings Yet</h3>
          <p className="text-gray-600 mb-6">
            You haven't made any bookings. Start exploring events!
          </p>
          <Button onClick={onBack}>Browse Events</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1>My Bookings</h1>
        <Button onClick={onBack}>Browse Events</Button>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:w-48 aspect-[4/3] overflow-hidden rounded-lg flex-shrink-0">
                <img
                  src={booking.event.image}
                  alt={booking.event.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="mb-1">{booking.event.title}</h3>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full capitalize">
                      {booking.event.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Booking ID</p>
                    <p className="text-sm font-mono">{booking.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="size-4" />
                    <span>{booking.event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="size-4" />
                    <span>{booking.event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="size-4" />
                    <span>{booking.event.venue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="size-4" />
                    <span>{booking.seats.length} seat(s)</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-sm text-gray-600">Seats:</span>
                  {booking.seats.map((seat) => (
                    <span
                      key={seat.id}
                      className="px-2 py-1 bg-gray-100 rounded text-sm"
                    >
                      {seat.id}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-sm text-gray-600">
                    Booked on {booking.bookingDate}
                  </span>
                  <div className="text-right">
                    <span className="text-sm text-gray-600">Total Amount</span>
                    <p className="text-green-600">${booking.totalAmount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
