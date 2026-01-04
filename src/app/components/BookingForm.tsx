import { useState } from "react";
import { Button } from "./Button";
import { Seat } from "./SeatSelector";
import { Event } from "./EventCard";

interface BookingFormProps {
  event: Event;
  selectedSeats: Seat[];
  onSubmit: (bookingData: BookingData) => void;
  onBack: () => void;
  initialData?: { name?: string; email?: string; phone?: string };
}

export interface BookingData {
  name: string;
  email: string;
  phone: string;
}

export function BookingForm({ event, selectedSeats, onSubmit, onBack, initialData }: BookingFormProps) {
  const [formData, setFormData] = useState<BookingData>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
  });

  const [errors, setErrors] = useState<Partial<BookingData>>({});

  const validate = () => {
    const newErrors: Partial<BookingData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[-()\s]/g, ""))) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const totalAmount = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="mb-4">Booking Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Event:</span>
            <span>{event.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date & Time:</span>
            <span>{event.date} at {event.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Venue:</span>
            <span>{event.venue}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Seats:</span>
            <span>{selectedSeats.map((s) => s.id).join(", ")}</span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span>Total Amount:</span>
            <span className="text-blue-600">${totalAmount}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <h2 className="mb-4">Contact Information</h2>

        <div>
          <label htmlFor="name" className="block text-sm mb-1 text-gray-700">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
          />
          {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm mb-1 text-gray-700">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="john@example.com"
          />
          {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm mb-1 text-gray-700">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1234567890"
          />
          {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button type="submit" className="flex-1">
            Confirm Booking
          </Button>
        </div>
      </form>
    </div>
  );
}
