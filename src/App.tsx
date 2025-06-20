import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FormsLibrary from './pages/FormsLibrary';
import FormView from './pages/FormView';
import FormFill from './pages/FormFill';
import FormCreator from './pages/FormCreator'; 
import Settings from './pages/Settings';
import Messages from './pages/Messages';
import { FormProvider } from './context/FormContext';
import { MessageProvider } from './context/MessageContext';

function App() {
  // Log environment variables for debugging
  useEffect(() => {
    console.log('Base URL:', import.meta.env.BASE_URL);
  }, []);
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <FormProvider>
        <MessageProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/library" element={<FormsLibrary />} />
              <Route path="/form/:id" element={<FormView />} />
              <Route path="/form/:id/fill" element={<FormFill />} />
              <Route path="/forms/new" element={<FormCreator />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/messages" element={<Messages />} />
            </Routes>
          </Layout>
        </MessageProvider>
      </FormProvider>
    </Router>
  );
}

export default App;