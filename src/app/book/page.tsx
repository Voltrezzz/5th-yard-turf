import type { Metadata } from "next";

import { BookingWizard } from "@/components/booking/BookingWizard";

export const metadata: Metadata = {
  title: "Book Your Slot",
  description:
    "Choose a date and time for football or cricket at 5TH YARD TURF.",
};

export default function BookPage() {
  return <BookingWizard />;
}
