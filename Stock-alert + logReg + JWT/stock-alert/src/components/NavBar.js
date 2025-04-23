// NavBar.js

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const NavBar = ({
  authenticated,
  currentPage,
  handleLogout,
  navigateToMain,
  navigateToHistory,
  toggleHelp
}) => {
  // Toggle between "View History" and "Set Alerts"
  const historyOrMainButton =
    currentPage === 'history' ? (
      <button className="btn btn-secondary" onClick={navigateToMain}>
        Set Alerts
      </button>
    ) : (
      <button className="btn btn-secondary" onClick={navigateToHistory}>
        View History
      </button>
    );

  // If you have a logo, replace or uncomment the <img> below:
  // const brandElement = (
  //   <img
  //     src="/images/navbar-logo.png"
  //     alt="Logo"
  //     style={{ cursor: 'pointer', maxHeight: '40px' }}
  //     onClick={navigateToMain}
  //   />
  // );

  const brandElement = (
    <span
      style={{ cursor: 'pointer', fontWeight: 'bold', color: '#fff' }}
      onClick={navigateToMain}
    >
      Stock Price Alert
    </span>
  );

  return (
    <nav
      className="navbar navbar-dark bg-dark"
      style={{ position: 'relative', height: '60px' }}
    >
      {/* Left items: Logout */}
      {authenticated && (
        <div
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        >
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}

      {/* Center brand */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        {brandElement}
      </div>

      {/* Right items: history vs. main + help */}
      {authenticated && (
        <div
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        >
          {historyOrMainButton}{' '}
          <button className="btn btn-info" onClick={toggleHelp}>
            ?
          </button>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
