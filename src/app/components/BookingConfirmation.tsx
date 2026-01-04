import { CheckCircle } from "lucide-react";
import { Button } from "./Button";
import { Booking } from "../App";

interface BookingConfirmationProps {
  booking: Booking;
  onClose: () => void;
  onViewBookings: () => void;
}

export function BookingConfirmation({ booking, onClose, onViewBookings }: BookingConfirmationProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="size-16 text-green-500" />
        </div>
        
        <h2 className="mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-6">
          Your tickets have been booked successfully
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
          <div className="mb-4 pb-4 border-b">
            <p className="text-sm text-gray-600 mb-1">Booking ID</p>
            <p className="font-mono">{booking.id}</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Event:</span>
              <span>{booking.event.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date & Time:</span>
              <span>{booking.event.date} at {booking.event.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Venue:</span>
              <span>{booking.event.venue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Seats:</span>
              <span>{booking.seats.map((s) => s.id).join(", ")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span>{booking.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span>{booking.customerEmail}</span>
            </div>
            <div className="flex justify-between pt-3 border-t">
              <span>Total Paid:</span>
              <span className="text-green-600">₹{booking.totalAmount}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          A confirmation email has been sent to {booking.customerEmail}
        </p>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Book Another Event
          </Button>
          <Button onClick={onViewBookings} className="flex-1">
            View My Bookings
          </Button>
        </div>
      </div>
    </div>
  );
}
