import Contact from "./pages/Contact";

function App() {
  return (
    <Routes>
      {/* existing routes */}
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
}
