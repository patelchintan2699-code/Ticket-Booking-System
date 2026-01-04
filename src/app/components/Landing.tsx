import React, { useState } from "react";
import { Event } from "./EventCard";
import { Button } from "./Button";

interface LandingProps {
  events: Event[];
  onExplore: () => void;
}

export function Landing({ events, onExplore }: LandingProps) {
  // Newsletter
  const [email, setEmail] = useState("");
  const [newsletterMsg, setNewsletterMsg] = useState<null | { type: "success" | "error"; text: string }>(null);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  // Contact
  const [contact, setContact] = useState({ name: "", email: "", phone: "", message: "" });
  const [contactErrors, setContactErrors] = useState<any>({});
  const [contactMsg, setContactMsg] = useState<null | { type: "success" | "error"; text: string }>(null);
  const [contactLoading, setContactLoading] = useState(false);

  const featured = events.slice(0, 3);

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubscribe = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setNewsletterMsg(null);
    if (!validateEmail(email)) {
      setNewsletterMsg({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    try {
      setNewsletterLoading(true);
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.status === 409) {
        setNewsletterMsg({ type: "error", text: "This email is already subscribed." });
        return;
      }

      if (!res.ok) throw new Error("Network error");
      setNewsletterMsg({ type: "success", text: "Thanks! You have been subscribed." });
      setEmail("");
    } catch (err) {
      setNewsletterMsg({ type: "error", text: "Failed to subscribe. Please try again later." });
    } finally {
      setNewsletterLoading(false);
    }
  };

  const validateContact = () => {
    const errs: any = {};
    if (!contact.name.trim()) errs.name = "Name is required";
    if (!validateEmail(contact.email)) errs.email = "Valid email is required";
    if (!contact.phone.trim() || !/^\d{10}$/.test(contact.phone.replace(/[-()\s]/g, ""))) errs.phone = "Valid 10-digit phone is required";
    if (!contact.message.trim() || contact.message.trim().length < 10) errs.message = "Message must be at least 10 characters";
    setContactErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactMsg(null);
    if (!validateContact()) return;

    try {
      setContactLoading(true);
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact),
      });

      if (!res.ok) throw new Error("Network error");
      setContactMsg({ type: "success", text: "Message sent. We'll be in touch." });
      setContact({ name: "", email: "", phone: "", message: "" });
      setContactErrors({});
    } catch (err) {
      setContactMsg({ type: "error", text: "Failed to send message. Please try later." });
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <section className="bg-white rounded-lg shadow-md p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">Discover & Book Tickets Easily</h1>
          <p className="text-gray-600 mb-6">Find concerts, movies, sports and theater events near you. Choose your seats and book in seconds.</p>
          <div className="flex gap-3">
            <Button onClick={onExplore}>Explore Events</Button>
            <Button variant="outline" onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}>Contact Us</Button>
          </div>
        </div>
        <div className="w-full md:w-96">
          <form onSubmit={handleSubscribe} className="bg-gray-50 p-4 rounded">
            <label className="text-sm mb-2 block">Join our newsletter</label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 border rounded"
                aria-label="email"
              />
              <Button type="submit" disabled={newsletterLoading}>{newsletterLoading ? 'Saving...' : 'Subscribe'}</Button>
            </div>
            {newsletterMsg && (
              <p className={`mt-2 text-sm ${newsletterMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{newsletterMsg.text}</p>
            )}
          </form>
        </div>
      </section>

      <section>
        <h2 className="mb-4">Featured Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map((e) => (
            <div key={e.id} className="bg-white rounded-lg shadow p-4">
              <div className="w-full h-40 overflow-hidden rounded mb-3">
                <img src={e.image} alt={e.title} className="w-full h-full object-cover" />
              </div>
              <h3 className="mb-1">{e.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{e.date} · {e.time}</p>
              <div className="flex items-center justify-between">
                <span className="text-blue-600 font-medium">${e.price}</span>
                <Button onClick={onExplore} variant="outline">View</Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="mb-4">Contact Us</h2>
        <form onSubmit={handleContactSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Full Name</label>
            <input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} className="w-full px-3 py-2 border rounded" />
            {contactErrors.name && <p className="text-red-600 text-sm mt-1">{contactErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className="w-full px-3 py-2 border rounded" />
            {contactErrors.email && <p className="text-red-600 text-sm mt-1">{contactErrors.email}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">Phone</label>
            <input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className="w-full px-3 py-2 border rounded" />
            {contactErrors.phone && <p className="text-red-600 text-sm mt-1">{contactErrors.phone}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Message</label>
            <textarea value={contact.message} onChange={(e) => setContact({ ...contact, message: e.target.value })} className="w-full px-3 py-2 border rounded h-28" />
            {contactErrors.message && <p className="text-red-600 text-sm mt-1">{contactErrors.message}</p>}
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <Button type="submit" disabled={contactLoading}>{contactLoading ? 'Sending...' : 'Send Message'}</Button>
            {contactMsg && (
              <p className={`text-sm ${contactMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{contactMsg.text}</p>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
