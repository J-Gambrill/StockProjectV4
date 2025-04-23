import React, { useState, useEffect } from 'react';
import StockForm from './components/StockForm';
import Login from './components/Login';
import Register from './components/Register';
import UserAlertsTable from './components/UserAlertsTable';
import HistoryPage from './components/HistoryPage';
import NavBar from './components/NavBar';
import Footer from './components/Footer'; 
import './App.css';
import { getProtectedData } from './Auth';

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const storedPage = localStorage.getItem('currentPage')
  const [currentPage, setCurrentPage] = useState(storedPage || 'main');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    checkIfUserIsLoggedIn();
  }, []);

  const checkIfUserIsLoggedIn = async () => {
    try {
      const response = await getProtectedData(); 

      if (response && response.ok) {
        setAuthenticated(true);
      } 
      else if (response && response.status === 401) {
        setAuthenticated(false);
      } 
      else {
        setAuthenticated(false);
      }

    } catch (error) {
      console.error('Error checking user session:', error);
      setAuthenticated(false);
    }
  };

  const handleSwitchToLogin = () => {
    setShowLogin(true);
  };

  const handleSwitchToRegister = () => {
    setShowLogin(false);
  };

  const navigateToHistory = () => {
    setCurrentPage('history')
    localStorage.setItem('currentPage', 'history')
  };

  const navigateToMain = () => {
    setCurrentPage('main');
    localStorage.setItem('currentPage', 'main')
  };

  const toggleHelp = () => {
    setShowHelp(prev => !prev);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        setAuthenticated(false);
        setShowLogin(true);
        setCurrentPage('main');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="app-container">
      <NavBar
        authenticated={authenticated}
        currentPage={currentPage}
        handleLogout={handleLogout}
        navigateToMain={navigateToMain}
        navigateToHistory={navigateToHistory}
        toggleHelp={toggleHelp}
      />

      {showHelp && authenticated && (
        <div className="help-overlay">
          <div className="help-content">
            <h3>How to Use This Site</h3>
            <p>
              1. Enter a stock symbol and set a high or low alert price.<br/>
              2. You will receive an email when this price is reached.<br/>
              3. You can view your active alerts below.<br/>
              4. You can edit by clicking on them or delete them as needed.<br/>
              5. To view past triggered alerts, use the "History" button.<br/>
              6. You can delete or sort your history as required.<br/>
            </p>
            <button onClick={toggleHelp} className="close-button">Close</button>
          </div>
        </div>
      )}

      <main>
        {!authenticated ? (
          <div className={`container mt-5 ${showHelp ? 'blur' : ''}`}>
            {showLogin ? (
              <>
                <Login setAuthenticated={setAuthenticated} />
                <div className="text-center mt-3">
                  <p className="acc-txt">
                    Don’t have an account?{' '}
                    <button
                      className="btn btn-link"
                      onClick={handleSwitchToRegister}
                    >
                      Register now
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <>
                <Register />
                <div className="text-center mt-3">
                  <p className="acc-txt">
                    Already have an account?{' '}
                    <button
                      className="btn btn-link"
                      onClick={handleSwitchToLogin}
                    >
                      Login here
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {currentPage === 'main' ? (
              <div className="container mt-5">
                <StockForm />
                <p className="warning">
                  Please be aware that this service only offers access to the American
                  stock exchanges.
                </p>
                <UserAlertsTable />
              </div>
            ) : (
              <HistoryPage navigateToMain={navigateToMain} />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
