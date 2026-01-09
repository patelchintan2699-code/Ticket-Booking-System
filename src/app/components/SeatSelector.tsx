import { useState, useEffect } from "react";
import { cn } from "../lib/utils";

export interface Seat {
  id: string;
  row: string;
  number: number;
  status: "available" | "booked" | "selected";
  price: number;
}

interface SeatSelectorProps {
  totalSeats: number;
  basePrice: number;
  bookedSeats?: string[];
  onSeatSelect: (seats: Seat[]) => void;
}

export function SeatSelector({ 
  totalSeats, 
  basePrice,
  bookedSeats = [],
  onSeatSelect 
}: SeatSelectorProps) {
  //
  // Calculate rows and seatsPerRow dynamically based on totalSeats
  const seatsPerRow = Math.ceil(Math.sqrt(totalSeats));
  const rows = Math.ceil(totalSeats / seatsPerRow);

  const [seats, setSeats] = useState<Seat[]>(() => {
    const allSeats: Seat[] = [];
    const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let seatCount = 0;
    for (let r = 0; r < rows && seatCount < totalSeats; r++) {
      for (let s = 1; s <= seatsPerRow && seatCount < totalSeats; s++) {
        const seatId = `${rowLabels[r]}${s}`;
        const price = r < 3 ? basePrice + 20 : r < 6 ? basePrice + 10 : basePrice;
        allSeats.push({
          id: seatId,
          row: rowLabels[r],
          number: s,
          status: bookedSeats.includes(seatId) ? "booked" : "available",
          price,
        });
        seatCount++;
      }
    }
    return allSeats;
  });

  const handleSeatClick = (seatId: string) => {
    setSeats((prevSeats) => {
      const newSeats = prevSeats.map((seat) => {
        if (seat.id === seatId && seat.status !== "booked") {
          return {
            ...seat,
            status: seat.status === "selected" ? "available" : "selected",
          } as Seat;
        }
        return seat;
      });
      
      const selectedSeats = newSeats.filter((s) => s.status === "selected");
      onSeatSelect(selectedSeats);
      
      return newSeats;
    });
  };

  const selectedSeats = seats.filter((s) => s.status === "selected");

  // Update seat statuses when bookedSeats prop changes
  useEffect(() => {
    setSeats((prevSeats) =>
      prevSeats.map((seat) => ({
        ...seat,
        status: bookedSeats.includes(seat.id)
          ? "booked"
          : seat.status === "selected"
          ? "selected"
          : "available",
      }))
    );
  }, [bookedSeats]);

  return (
    <div className="space-y-6">
      {/* Screen */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="w-full max-w-3xl h-2 bg-gradient-to-b from-gray-800 to-gray-400 rounded-t-full"></div>
        <p className="text-sm text-gray-500">Screen</p>
      </div>

      {/* Seat Grid */}
      <div className="flex flex-col items-center gap-2 overflow-x-auto pb-4">
        {Array.from({ length: rows }, (_, rowIndex) => {
          const rowLabel = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[rowIndex];
          const rowSeats = seats.filter((s) => s.row === rowLabel);
          
          return (
            <div key={rowLabel} className="flex items-center gap-2">
              <span className="w-8 text-center text-sm text-gray-600">{rowLabel}</span>
              <div className="flex gap-1">
                {rowSeats.map((seat) => (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat.id)}
                    disabled={seat.status === "booked"}
                    className={cn(
                      "w-8 h-8 rounded-t-lg text-xs font-bold transition-all border-2",
                      {
                        "bg-green-500 hover:bg-green-600 cursor-pointer border-green-700 text-white shadow-md": seat.status === "available",
                        "bg-red-600 cursor-not-allowed border-red-800 text-white opacity-100 shadow-md relative": seat.status === "booked",
                        "bg-blue-600 hover:bg-blue-700 cursor-pointer border-blue-800 text-white shadow-lg": seat.status === "selected",
                      }
                    )}
                    title={`${seat.id} - $${seat.price}${seat.status === "booked" ? " (Booked)" : ""}`}
                  >
                    {seat.status === "booked" ? "✕" : seat.number}
                  </button>
                ))}
              </div>
              <span className="w-8 text-center text-sm text-gray-600">{rowLabel}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded-t-lg border-2 border-green-700 shadow-md"></div>
          <span className="text-sm">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-t-lg border-2 border-blue-800 shadow-lg"></div>
          <span className="text-sm">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-600 rounded-t-lg border-2 border-red-800 text-white flex items-center justify-center text-xs shadow-md">✕</div>
          <span className="text-sm">Booked</span>
        </div>
      </div>

      {/* Selected Seats Summary */}
      {selectedSeats.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span>Selected Seats:</span>
            <span>{selectedSeats.map((s) => s.id).join(", ")}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Total Amount:</span>
            <span className="text-blue-600">
              ${selectedSeats.reduce((sum, s) => sum + s.price, 0)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
