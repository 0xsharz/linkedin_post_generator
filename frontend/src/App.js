import "@/App.css";
import PostGenerator from "./components/PostGenerator";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      <PostGenerator />
    </div>
  );
}

export default App;