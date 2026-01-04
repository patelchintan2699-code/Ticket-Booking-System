import { Calendar, MapPin, Clock, Ticket } from "lucide-react";
import { Button } from "./Button";

export interface Event {
  id: string;
  title: string;
  category: "concert" | "movie" | "sports" | "theater";
  image: string;
  date: string;
  time: string;
  venue: string;
  price: number;
  availableSeats: number;
}

interface EventCardProps {
  event: Event;
  onBookNow: (event: Event) => void;
}

export function EventCard({ event, onBookNow }: EventCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[16/9] overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="flex-1 mr-2">{event.title}</h3>
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full capitalize">
            {event.category}
          </span>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="size-4" />
            <span className="text-sm">{event.date}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="size-4" />
            <span className="text-sm">{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="size-4" />
            <span className="text-sm">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Ticket className="size-4" />
            <span className="text-sm">{event.availableSeats} seats available</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500">Starting from</span>
            <p className="text-blue-600">₹{event.price}</p>
          </div>
          <Button onClick={() => onBookNow(event)}>
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}
