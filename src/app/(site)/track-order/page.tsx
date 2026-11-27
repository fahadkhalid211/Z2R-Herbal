import { permanentRedirect } from "next/navigation";

export default function TrackOrderPage() {
  permanentRedirect("/account");
}
