import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleFocus = (field) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    // Simulate form submission
    setTimeout(() => {
      alert('Thank you for contacting us! We will get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
      setFormSubmitted(false);
    }, 500);
  };

  return (
    <>
      <main className="min-h-screen bg-[#ebf2f3]">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-[#45573a] text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMDAwIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiMxZDI4NGMiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')] opacity-10"></div>
          <div className="max-w-7xl mx-auto px-4 py-24 relative z-10">
            <div className="text-center">
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Get In Touch
              </motion.h1>
              <motion.p 
                className="text-xl md:text-2xl text-[#ebf2f3] max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Have questions or feedback? We'd love to hear from you.
              </motion.p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Contact Information */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-[#0b0e11] mb-8">Contact Information</h2>
              
              <Card className="p-6 transition-all duration-300 hover:shadow-xl bg-white">
                <div className="flex items-start">
                  <div className="w-14 h-14 rounded-full bg-[#ebf2f3] flex items-center justify-center mr-5 flex-shrink-0">
                    <i className="fas fa-map-marker-alt text-[#45573a] text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#0b0e11] mb-2">Our Location</h3>
                    <p className="text-[#727373] text-lg">DAU, Gandhinagar</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 transition-all duration-300 hover:shadow-xl bg-white">
                <div className="flex items-start">
                  <div className="w-14 h-14 rounded-full bg-[#ebf2f3] flex items-center justify-center mr-5 flex-shrink-0">
                    <i className="fas fa-envelope text-[#45573a] text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#0b0e11] mb-2">Email Us</h3>
                    <p className="text-[#727373] text-lg">support@fixly.com</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 transition-all duration-300 hover:shadow-xl bg-white">
                <div className="flex items-start">
                  <div className="w-14 h-14 rounded-full bg-[#ebf2f3] flex items-center justify-center mr-5 flex-shrink-0">
                    <i className="fas fa-phone text-[#45573a] text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#0b0e11] mb-2">Call Us</h3>
                    <p className="text-[#727373] text-lg">+91 9726988872</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-8"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-3xl font-bold text-[#0b0e11] mb-8">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input
                    label="Name"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => handleFocus('name')}
                    onBlur={handleBlur}
                    required
                    containerClassName={`transition-all duration-300 ${
                      focusedField === 'name' ? 'transform -translate-y-1' : ''
                    }`}
                    className="bg-[#ebf2f3]"
                  />
                </div>

                <div>
                  <Input
                    label="Email"
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={handleBlur}
                    required
                    containerClassName={`transition-all duration-300 ${
                      focusedField === 'email' ? 'transform -translate-y-1' : ''
                    }`}
                    className="bg-[#ebf2f3]"
                  />
                </div>

                <div>
                  <label 
                    htmlFor="message" 
                    className={`block text-sm font-medium mb-2 transition-all duration-300 ${
                      focusedField === 'message' ? 'text-[#45573a] transform -translate-y-1' : 'text-[#0b0e11]'
                    }`}
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => handleFocus('message')}
                    onBlur={handleBlur}
                    required
                    rows="5"
                    className="w-full px-4 py-3 border border-[#939492] rounded-xl focus:ring-2 focus:ring-[#45573a] focus:border-[#45573a] transition-all duration-300 resize-none bg-[#ebf2f3]"
                  ></textarea>
                </div>

                <Button
                  type="submit"
                  disabled={formSubmitted}
                  className="w-full flex items-center justify-center py-3 text-lg font-semibold bg-[#45573a] hover:bg-[#0b0e11] text-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {formSubmitted ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i> Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane mr-2"></i> Send Message
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>

          {/* CTA Section */}
          <motion.div
            className="bg-[#45573a] rounded-2xl p-10 text-center text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-[#ebf2f3] mb-8 text-xl max-w-2xl mx-auto">
              Join thousands of satisfied customers today!
            </p>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/signup')}
              className="bg-white text-[#45573a] hover:bg-[#ebf2f3] font-semibold py-3 px-8 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Sign Up Now
            </Button>
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default Contact;