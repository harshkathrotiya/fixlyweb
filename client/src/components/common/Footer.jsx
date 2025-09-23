import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Footer() {
  const serviceCategories = [
    { name: "Painting" },
    { name: "Cleaning" },
    { name: "Plumbing" },
    { name: "Carpentry" },
    { name: "Electrical" },
  ];

  return (
    <footer className="bg-[#0b0e11] text-[#727373]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold text-white">Fixly</h3>
            <p className="text-[#727373] leading-relaxed">
              Your trusted platform for professional home services. Connecting homeowners with verified service providers.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-[#939492] hover:text-white transition-colors duration-300">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-[#939492] hover:text-white transition-colors duration-300">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-[#939492] hover:text-white transition-colors duration-300">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-[#939492] hover:text-white transition-colors duration-300">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold text-white mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-[#727373] hover:text-white transition-colors duration-300 flex items-center">
                  <i className="fas fa-chevron-right text-xs mr-2 text-[#45573a]"></i> Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-[#727373] hover:text-white transition-colors duration-300 flex items-center">
                  <i className="fas fa-chevron-right text-xs mr-2 text-[#45573a]"></i> Services
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-[#727373] hover:text-white transition-colors duration-300 flex items-center">
                  <i className="fas fa-chevron-right text-xs mr-2 text-[#45573a]"></i> About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[#727373] hover:text-white transition-colors duration-300 flex items-center">
                  <i className="fas fa-chevron-right text-xs mr-2 text-[#45573a]"></i> Contact
                </Link>
              </li>
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold text-white mb-6">Services</h4>
            <ul className="space-y-4">
              {serviceCategories.map((service, index) => (
                <li key={index}>
                  <Link 
                    to={`/services?category=${service.name.toLowerCase()}`} 
                    className="text-[#727373] hover:text-white transition-colors duration-300 flex items-center"
                  >
                    <i className="fas fa-chevron-right text-xs mr-2 text-[#45573a]"></i> {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold text-white mb-6">For Providers</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/tasker" className="text-[#727373] hover:text-white transition-colors duration-300 flex items-center">
                  <i className="fas fa-chevron-right text-xs mr-2 text-[#45573a]"></i> Become a Provider
                </Link>
              </li>
              <li>
                <Link to="/provider/dashboard" className="text-[#727373] hover:text-white transition-colors duration-300 flex items-center">
                  <i className="fas fa-chevron-right text-xs mr-2 text-[#45573a]"></i> Provider Dashboard
                </Link>
              </li>
              <li>
                <Link to="/provider/signup" className="text-[#727373] hover:text-white transition-colors duration-300 flex items-center">
                  <i className="fas fa-chevron-right text-xs mr-2 text-[#45573a]"></i> Provider Signup
                </Link>
              </li>
            </ul>
          </motion.div>
        </div>
        
        <motion.div 
          className="border-t border-[#babfbc] mt-12 pt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-[#939492]">&copy; {new Date().getFullYear()} Fixly. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
}

export default Footer;