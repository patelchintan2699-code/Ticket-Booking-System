import { useState } from "react";
import { Event } from "./EventCard";
import { Booking } from "../App";
import { Button } from "./Button";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface EventManagementProps {
  events: Event[];
  bookings: Booking[];
  onAddEvent: (event: Omit<Event, "id">) => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
}

type ModalMode = "add" | "edit" | null;

export function EventManagement({ 
  events, 
  bookings,
  onAddEvent, 
  onEditEvent, 
  onDeleteEvent 
}: EventManagementProps) {
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "concert" as Event["category"],
    image: "",
    date: "",
    time: "",
    venue: "",
    price: 0,
    availableSeats: 0,
  });

  const handleOpenAdd = () => {
    setFormData({
      title: "",
      category: "concert",
      image: "",
      date: "",
      time: "",
      venue: "",
      price: 0,
      availableSeats: 0,
    });
    setModalMode("add");
  };

  const handleOpenEdit = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      category: event.category,
      image: event.image,
      date: event.date,
      time: event.time,
      venue: event.venue,
      price: event.price,
      availableSeats: event.availableSeats,
    });
    setModalMode("edit");
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedEvent(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modalMode === "add") {
      onAddEvent(formData);
    } else if (modalMode === "edit" && selectedEvent) {
      onEditEvent({ ...selectedEvent, ...formData });
    }
    
    handleCloseModal();
  };

  const handleDelete = (eventId: string) => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      onDeleteEvent(eventId);
    }
  };

  const getEventBookingStats = (eventId: string) => {
    debugger;
    const eventBookings = bookings.filter(b => b.event._id === eventId);
    const ticketsSold = eventBookings.reduce((sum, b) => sum + b.seats.length, 0);
    const revenue = eventBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    return { bookings: eventBookings.length, ticketsSold, revenue };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1>Event Management</h1>
        <Button onClick={handleOpenAdd}>
          <Plus className="size-5 mr-2" />
          Add New Event
        </Button>
      </div>

      <div className="space-y-4">
        {events.map((event) => {
          const stats = getEventBookingStats(event.id);
          
          return (
            <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex gap-4">
                <div className="w-32 aspect-[4/3] overflow-hidden rounded-lg flex-shrink-0">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="mb-1">{event.title}</h3>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full capitalize">
                        {event.category}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpenEdit(event)}>
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(event.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-600">Date: </span>
                      <span>{event.date}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Time: </span>
                      <span>{event.time}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Venue: </span>
                      <span>{event.venue}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Price: </span>
                      <span>₹{event.price}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Available Seats: </span>
                      <span>{event.availableSeats}</span>
                    </div>
                  </div>

                  <div className="flex gap-6 pt-3 border-t text-sm">
                    <div>
                      <span className="text-gray-600">Bookings: </span>
                      <span className="text-blue-600">{stats.bookings}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tickets Sold: </span>
                      <span className="text-purple-600">{stats.ticketsSold}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Revenue: </span>
                      <span className="text-green-600">₹{stats.revenue}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {events.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">No events created yet</p>
            <Button onClick={handleOpenAdd}>
              <Plus className="size-5 mr-2" />
              Create Your First Event
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2>{modalMode === "add" ? "Add New Event" : "Edit Event"}</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="size-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700">Event Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Summer Music Festival"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-700">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Event["category"] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="concert">Concert</option>
                  <option value="movie">Movie</option>
                  <option value="sports">Sports</option>
                  <option value="theater">Theater</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-700">Image URL *</label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-700">Date *</label>
                  <input
                    type="text"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="June 15, 2025"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700">Time *</label>
                  <input
                    type="text"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="7:00 PM"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-700">Venue *</label>
                <input
                  type="text"
                  required
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Madison Square Garden, New York"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-700">Base Price ($) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700">Available Seats *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.availableSeats}
                    onChange={(e) => setFormData({ ...formData, availableSeats: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {modalMode === "add" ? "Add Event" : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
