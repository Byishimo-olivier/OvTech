import React, { useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import LiveChat from "./components/LiveChat.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Services from "./pages/Services.jsx";
import Products from "./pages/Products.jsx";
import Portfolio from "./pages/Portfolio.jsx";
import Industries from "./pages/Industries.jsx";
import Technologies from "./pages/Technologies.jsx";
import ProcessPage from "./pages/ProcessPage.jsx";
import Pricing from "./pages/Pricing.jsx";
import Blog from "./pages/Blog.jsx";
import Careers from "./pages/Careers.jsx";
import Contact from "./pages/Contact.jsx";

function App() {
  const [page, setPage] = useState("Home");
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState("EN");
  const [chatOpen, setChatOpen] = useState(false);

  const navigate = (item) => {
    setPage(item);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pages = {
    Home: <Home navigate={navigate} language={language} />,
    About: <About />,
    Services: <Services language={language} />,
    Products: <Products language={language} />,
    Portfolio: <Portfolio />,
    Industries: <Industries />,
    Technologies: <Technologies />,
    Process: <ProcessPage />,
    Pricing: <Pricing />,
    Blog: <Blog />,
    Careers: <Careers />,
    Contact: <Contact language={language} />,
  };

  return (
    <div className={dark ? "app dark" : "app"}>
      <Navbar
        page={page}
        dark={dark}
        language={language}
        menuOpen={menuOpen}
        setDark={setDark}
        setLanguage={setLanguage}
        setMenuOpen={setMenuOpen}
        navigate={navigate}
      />
      <main>{pages[page]}</main>
      <LiveChat open={chatOpen} setOpen={setChatOpen} language={language} />
      <Footer navigate={navigate} language={language} />
    </div>
  );
}

export default App;
