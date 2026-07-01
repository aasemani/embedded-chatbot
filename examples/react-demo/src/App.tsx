import { CcaisChatbot } from "@ccais/embedded-chatbot-react";

export default function App() {
  return (
    <main style={{ padding: 40, fontFamily: "system-ui, sans-serif" }}>
      <h1>CCAIS React Demo</h1>
      <p>The chatbot is rendered through the React wrapper.</p>
      <CcaisChatbot chatbotId="support" apiBaseUrl="http://localhost:4000" />
    </main>
  );
}
