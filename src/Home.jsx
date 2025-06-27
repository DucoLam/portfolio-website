import React from 'react';
import './Home.css';

export default function Home() {
  const scrollToPlace = (region) => {
    if (region === 'About Me') {
        const scrollSection = document.getElementById('about');
        scrollSection.scrollIntoView({ behavior: 'smooth' });
    }
    else if (region === 'Projects') {
        const scrollSection = document.getElementById('projects');
        scrollSection.scrollIntoView({ behavior: 'smooth' });
    }
    else {
        const scrollSection = document.getElementById('home');
        scrollSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-outer-container">
        <nav className="navbar">
          <div className="navbar-inner">
            <div className="site-name">Duco Lam</div>
            <div className="nav-items">
              <a className="nav-link" onClick={e => scrollToPlace(e.target.textContent)}>Home</a>
              <a className="nav-link" onClick={e => scrollToPlace(e.target.textContent)}>Projects</a>
              <a className="nav-link" onClick={e => scrollToPlace(e.target.textContent)}>About Me</a>
              <a href="https://github.com/ducolam" target="_blank" rel="noopener noreferrer">
                <button className="nav-btn">GitHub</button>
              </a>
            </div>
          </div>
        </nav>
      <div className="home-container">
        {/* Navigation Bar */}

        {/* Hero Section */}
        <section className="hero" id="home">
          <h1 className="hero-title">Home Page</h1>
          <div className="hero-subheading">
              Driven Computer Science student at Delft University of Technology, with technical skills in both Front-End and Back-End development, proficient in languages such as Java, Python, and C#. Having strong communication skills and the ability to quickly grasp new concepts. Passionate about helping others, whether through collaboration or providing support, and enjoys connecting with new people. Enthusiastic about problem-solving and always eager to expand knowledge and skills.        </div>
          <button className="hero-btn" onClick={e => scrollToPlace(e.target.textContent)}>About Me</button>
        </section>

        {/* Projects Section */}
        <section className="section" id="projects">
          <div className="section-heading">Projects</div>
          <div className="cards-row">
            <div className="card">
              <img className="card-image" src="https://imgur.com/SjPxHYZ.png" alt="Project 1" />
              <div className="card-title">Event driven monitoring of Cloud AI workloads using Bills of Materials</div>
              <div className="card-body">Created a tool for event-driven dependency graph creation of software components inside of the internal infrastructure of TNO.</div>
            </div>
            <div className="card">
              <img className="card-image" src="https://via.placeholder.com/405x240" alt="Project 2" />
              <div className="card-title">Project Two</div>
              <div className="card-body">Body text for whatever you’d like to expand on the main point.</div>
            </div>
            <div className="card">
              <img className="card-image" src="https://via.placeholder.com/405x240" alt="Project 3" />
              <div className="card-title">Project Three</div>
              <div className="card-body">Body text for whatever you’d like to share more.</div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="section" id="about">
          <div className="section-heading">About Me</div>
          <div className="cards-row">
            <div className="card">
              <img className="card-image" src="https://via.placeholder.com/405x240" alt="About" />
              <div className="card-title">Who am I?</div>
              <div className="card-body">Body text for whatever you’d like to expand on the main point.</div>
            </div>
          </div>
        </section>

        {/* Footer */}
      </div>
        <footer className="footer">
          <div className="footer-section">
            <div className="footer-title">DucoLam.com</div>
            <div className="social-icons">
              <a href="#" className="social-icon" aria-label="Facebook">F</a>
              <a href="#" className="social-icon" aria-label="LinkedIn">L</a>
              <a href="#" className="social-icon" aria-label="YouTube">Y</a>
              <a href="#" className="social-icon" aria-label="Instagram">I</a>
            </div>
          </div>
          <div className="footer-section">
            <div className="footer-title">Links</div>
            <a href="#home" className="footer-link">Home</a>
            <a href="#projects" className="footer-link">Projects</a>
            <a href="#about" className="footer-link">About Me</a>
          </div>
          <div className="footer-section">
            <div className="footer-title">Contact</div>
            <a href="mailto:your@email.com" className="footer-link">duco.floris@gmail.com</a>
          </div>
        </footer>
    </div>
  );
}
