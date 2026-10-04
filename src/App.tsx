import { BrowserRouter, Routes, Route} from "react-router-dom";
import LeadsList from "./views/LeadsList";

function App() {
   return (
      <BrowserRouter>
          <Routes>
              <Route path="/leads" element={<LeadsList />} />
          </Routes>
      </BrowserRouter>
   )

   
}

export default App;
