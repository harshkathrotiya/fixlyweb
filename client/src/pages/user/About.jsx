import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';

function About() {
  // Team members in the specified order
  const teamMembers = [
    { name: "Katharotiya Harsh", role: "Founder & CEO", photo: null },
    { name: "Shekhda Miraj", role: "CTO", photo: null },
    { name: "Asodariya Gaurav", role: "Head of Operations", photo: null },
    { name: "Krishn Navadiya", role: "Customer Success", photo: null },
    { name: "Kachhadiya Princy", role: "Marketing Director", photo: null },
    { name: "Lakkad Vishva", role: "Product Manager", photo: null },
    { name: "Limbachiya Parth", role: "Lead Developer", photo: null },
    { name: "Kachhadiya Smit", role: "UI/UX Designer", photo: null }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-[#45573a] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Fixly</h1>
          <p className="text-xl max-w-3xl mx-auto text-[#ebf2f3]">
            Connecting skilled professionals with customers looking for quality home services
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0b0e11] mb-4">Our Mission</h2>
            <p className="text-lg text-[#727373] max-w-3xl mx-auto">
              To simplify home maintenance by connecting trusted professionals with customers who need quality services.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-md transition-shadow duration-300 bg-white">
              <div className="w-12 h-12 bg-[#ebf2f3] rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-user-check text-[#45573a] text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-[#0b0e11] mb-2">Trusted Professionals</h3>
              <p className="text-[#727373]">
                We verify all our service providers to ensure quality and reliability.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow duration-300 bg-white">
              <div className="w-12 h-12 bg-[#babfbc] rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-shield-alt text-[#0b0e11] text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-[#0b0e11] mb-2">Quality Guarantee</h3>
              <p className="text-[#727373]">
                We stand behind our service providers with a satisfaction guarantee.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow duration-300 bg-white">
              <div className="w-12 h-12 bg-[#45573a] rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-headset text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-[#0b0e11] mb-2">24/7 Support</h3>
              <p className="text-[#727373]">
                Our customer support team is always ready to assist you.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-[#ebf2f3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-[#0b0e11] mb-6">Our Story</h2>
              <p className="text-[#0b0e11] mb-4">
                Founded in 2023, Fixly was born out of a simple idea: making home services easier and more reliable for everyone.
              </p>
              <p className="text-[#0b0e11] mb-4">
                We noticed that finding trustworthy home service professionals was often a frustrating experience. 
                People spent hours searching, comparing, and worrying about quality and reliability.
              </p>
              <p className="text-[#0b0e11]">
                That's why we created Fixly - to connect skilled professionals with customers who need quality services, 
                all in one reliable platform.
              </p>
            </div>
            <div className="md:w-1/2">
              <div className="bg-[#babfbc] border-2 border-dashed rounded-xl w-full h-96 flex items-center justify-center">
                <span className="text-[#0b0e11]">Our Story Image</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0b0e11] mb-4">Meet Our Team</h2>
            <p className="text-lg text-[#727373] max-w-3xl mx-auto">
              Dedicated professionals working together to make home services better for everyone.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-4 bg-[#babfbc] border-2 border-dashed rounded-full w-32 h-32 flex items-center justify-center">
                  <span className="text-[#0b0e11]">Photo</span>
                </div>
                <h3 className="text-xl font-semibold text-[#0b0e11]">{member.name}</h3>
                <p className="text-[#45573a]">{member.role}</p>
                <div className="flex justify-center space-x-3 mt-3">
                  <a href="#" className="text-[#939492] hover:text-[#45573a]">
                    <i className="fab fa-linkedin"></i>
                  </a>
                  <a href="#" className="text-[#939492] hover:text-[#45573a]">
                    <i className="fab fa-twitter"></i>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default About;