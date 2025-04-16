import Chatbot from "./components/Chatbot";
import Chatbotpage from "./components/chatbotpage";

function App() {
  return (
    <div className="flex justify-center items-center h-screen">
      <Chatbot />
    </div>
  );
}
function App1() {
  return (
    <div className="flex justify-center items-center h-screen">
      <Chatbotpage />
    </div>
  );
}
export { App, App1 };