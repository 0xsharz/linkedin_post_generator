import { useState } from "react";
import { ThemeProvider } from "next-themes";
import "@/App.css";
import PostGenerator from "./components/PostGenerator";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="App">
        <Toaster position="top-right" />
        <PostGenerator />
      </div>
    </ThemeProvider>
  );
}

export default App;