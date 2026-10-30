import { whatsappReady, whatsappUrl } from "@/lib/whatsapp";
import styles from "./WhatsAppFloat.module.css";

// The round "Chat" button in the corner of every page.
export default function WhatsAppFloat() {
  if (!whatsappReady) return null;
  return (
    <a
      className={styles.float}
      href={whatsappUrl("Hi! I have a question about AURA.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.700 6.700 0 0 1-3.300-2.900c-.2-.4.2-.4.700-1.300.1-.2 0-.3 0-.5l-.8-1.800c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.200 5.200 5.200 0 0 0 1.100 2.800 11.900 11.900 0 0 0 4.600 4c1.700.7 2.400.8 3.300.7.500-.1 1.600-.7 1.800-1.300.2-.6.2-1.200.2-1.300l-.5-.3Z" />
      </svg>
      <span>Chat</span>
    </a>
  );
}
