import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReviewCard from "../../components/common/review";
// Removed duplicate Footer import as it's handled by Layout
import { motion } from "framer-motion";

// Animated headline with multiple modern effects
const AnimatedHeadline = () => {
  const [currentAnimation, setCurrentAnimation] = useState(0);
  
  // Different headline options with animations
  const headlines = [
    {
      text: "FIXLY",
      subtext: "Your Home Services Expert",
      animation: "split"
    },
    {
      text: "PROFESSIONAL",
      subtext: "Trusted Service Providers",
      animation: "fade"
    },
    {
      text: "RELIABLE",
      subtext: "Dependable Home Solutions",
      animation: "slide"
    },
    {
      text: "AFFORDABLE",
      subtext: "Quality Services Within Budget",
      animation: "scale"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnimation((prev) => (prev + 1) % headlines.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const renderHeadline = () => {
    const headline = headlines[currentAnimation];
    
    switch (headline.animation) {
      case "split":
        return (
          <div className="font-black text-4xl md:text-5xl lg:text-6xl leading-tight text-[#0b0e11] mb-6">
            {headline.text.split("").map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.03,
                }}
                className="inline-block"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </div>
        );
      
      case "fade":
        return (
          <motion.div
            className="font-black text-4xl md:text-5xl lg:text-6xl leading-tight text-[#0b0e11] mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {headline.text}
          </motion.div>
        );
      
      case "slide":
        return (
          <motion.div
            className="font-black text-4xl md:text-5xl lg:text-6xl leading-tight text-[#0b0e11] mb-6"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {headline.text}
          </motion.div>
        );
      
      case "scale":
        return (
          <motion.div
            className="font-black text-4xl md:text-5xl lg:text-6xl leading-tight text-[#0b0e11] mb-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {headline.text}
          </motion.div>
        );
      
      default:
        return (
          <div className="font-black text-4xl md:text-5xl lg:text-6xl leading-tight text-[#0b0e11] mb-6">
            {headline.text}
          </div>
        );
    }
  };

  return (
    <div className="text-center relative py-12 flex flex-col justify-center items-center">
      {renderHeadline()}
      <motion.div 
        className="text-lg md:text-xl text-[#727373] font-medium max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        key={currentAnimation}
      >
        {headlines[currentAnimation].subtext}
      </motion.div>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Popular service categories with Font Awesome icons
  const serviceCategories = [
    { name: "Painting", icon: "fa-paint-roller", description: "Professional painting for your home" },
    { name: "Cleaning", icon: "fa-broom", description: "Deep cleaning by certified experts" },
    { name: "Plumbing", icon: "fa-faucet", description: "Fix leaks and plumbing issues" },
    { name: "Carpentry", icon: "fa-hammer", description: "Custom furniture and repairs" },
    { name: "Electrical", icon: "fa-bolt", description: "Safe and reliable electrical work" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/services?search=${searchTerm}`);
    }
  };

  const navigateToService = (serviceName) => {
    navigate(`/services?category=${serviceName.toLowerCase()}`);
  };

  return (
    <div className="w-full bg-[#ebf2f3] text-[#0b0e11] overflow-x-hidden font-sans">

      {/* Hero Section */}
      <div className="w-full min-h-screen text-center overflow-hidden relative bg-[#ebf2f3]">
        <style>
          {`
            @keyframes blob {
              0% {
                transform: translate(0px, 0px) scale(1);
              }
              33% {
                transform: translate(30px, -50px) scale(1.1);
              }
              66% {
                transform: translate(-20px, 20px) scale(0.9);
              }
              100% {
                transform: translate(0px, 0px) scale(1);
              }
            }
            .animate-blob {
              animation: blob 7s infinite;
            }
            .animation-delay-2000 {
              animation-delay: 2s;
            }
            .animation-delay-4000 {
              animation-delay: 4s;
            }
          `}
        </style>
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#45573a] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#0b0e11] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-[#babfbc] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Hero content */}
        <div className="absolute inset-0 flex flex-col justify-center items-center z-10 px-4 py-12 max-w-6xl mx-auto">
          <div className="w-full">
            <AnimatedHeadline />
          </div>
          
          <motion.div
            className="mt-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <p className="text-xl text-[#727373] mb-10">
              Find trusted professionals for all your home maintenance needs
            </p>
            
            <Link
              to="/services"
              className="inline-block bg-[#45573a] hover:bg-[#0b0e11] text-white font-semibold py-4 px-8 rounded-full text-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
            >
              Explore Services
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Services Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-[#0b0e11] mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Our Professional Services
            </motion.h2>
            <motion.p 
              className="text-xl text-[#727373] max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Find the perfect service for your home needs
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceCategories.map((service, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-8 text-center shadow-lg cursor-pointer border border-[#babfbc] transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
                onClick={() => navigateToService(service.name)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-[#ebf2f3] rounded-full text-[#45573a]">
                  <i className={`fas ${service.icon} text-2xl`} />
                </div>
                <h3 className="text-xl font-semibold text-[#0b0e11] mb-3">{service.name}</h3>
                <p className="text-[#727373] mb-6">{service.description}</p>
                <button className="text-[#45573a] font-semibold hover:text-[#0b0e11] transition-colors">
                  View Services →
                </button>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Link
              to="/services"
              className="inline-block bg-[#45573a] hover:bg-[#0b0e11] text-white font-semibold py-3 px-8 rounded-full shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              View All Services
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-[#ebf2f3]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-[#0b0e11] mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              How It Works
            </motion.h2>
            <motion.p 
              className="text-xl text-[#727373] max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Easy steps to get your service done
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "fa-search", step: 1, title: "Choose a Service", desc: "Browse through our wide range of professional services" },
              { icon: "fa-calendar-check", step: 2, title: "Book an Appointment", desc: "Select your preferred date and time for the service" },
              { icon: "fa-tools", step: 3, title: "Get it Done", desc: "Our verified professional will arrive and complete the task" },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="bg-white rounded-2xl p-8 text-center shadow-md border border-[#babfbc]"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-[#babfbc] text-[#45573a] rounded-full">
                  <i className={`fas ${item.icon} text-2xl`} />
                </div>
                <div className="w-10 h-10 bg-[#45573a] text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-[#0b0e11] mb-3">{item.title}</h3>
                <p className="text-[#727373]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-[#0b0e11] mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              What Our Happy Customers Say
            </motion.h2>
            <motion.p 
              className="text-xl text-[#727373] max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Trusted by thousands of satisfied customers
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <ReviewCard />
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Home;