import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { setupIonicReact } from '@ionic/react'
import '@ionic/react/css/core.css'
import '@ionic/react/css/normalize.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

import './App.css'
import { MainBoard } from './components/MainBoard'
import { History } from './components/history/History'

setupIonicReact()

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectedRoute>
              <MainBoard />
            </ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute>
              <History />
            </ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
