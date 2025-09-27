// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";

// export default function JobListing() {
//   const token = localStorage.getItem("token");
//   console.log("Token:", token);

//   const [jobdata, setJobdata] = useState([]);
//   const [cities, setCities] = useState([]);

//   // Fixed categories
//   const categories = ["Plumbing", "Painting", "Cleaning", "Carpentry", "Gardening", "Washing"];

//   const [data, setData] = useState({
//     category: "",
//     city: "",
//   });

//   useEffect(() => {
//     axios
//       .get("https://doorstepservice.onrender.com/cities")
//       .then((response) => setCities(response.data))
//       .catch((error) => console.error("Error fetching cities:", error));
//   }, []);

//   const inputChange = (event) => {
//     const { name, value } = event.target;
//     setData({ ...data, [name]: value });
//   };

//   const submit = (e) => {
//     e.preventDefault();
//     console.log("Submit data:", data);

//     axios
//       .post("https://doorstepservice.onrender.com/jobs", data)
//       .then((response) => {
//         console.log("Response:", response);
//         setJobdata(response.data.data);
//       })
//       .catch((error) => console.error("Error fetching job listings:", error));
//   };

//   return (
//     <>
//       {/* Navbar */}
//       <nav
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           padding: "1rem",
//           background: "#333",
//           color: "#fff",
//         }}
//       >
//         <h2>Fixly</h2>
//         <div>
//           <Link to="/" style={{ marginRight: "15px", color: "white" }}>
//             Home
//           </Link>
//           <Link to="/services" style={{ marginRight: "15px", color: "white" }}>
//             Services
//           </Link>
//           <Link to="/appointments" style={{ marginRight: "15px", color: "white" }}>
//             Appointments
//           </Link>
//           <button
//             onClick={() => localStorage.removeItem("token")}
//             style={{
//               background: "red",
//               color: "white",
//               border: "none",
//               padding: "5px 10px",
//               cursor: "pointer",
//             }}
//           >
//             Logout
//           </button>
//         </div>
//       </nav>

//       {/* Search Form */}
//       <div style={{ padding: "20px", textAlign: "center" }}>
//         <form onSubmit={submit}>
//           <select name="city" value={data.city} onChange={inputChange} required>
//             <option value="">Select City</option>
//             {cities.map((city, index) => (
//               <option key={index} value={city}>
//                 {city}
//               </option>
//             ))}
//           </select>

//           <select name="category" value={data.category} onChange={inputChange} required>
//             <option value="">Select Category</option>
//             {categories.map((category, index) => (
//               <option key={index} value={category}>
//                 {category}
//               </option>
//             ))}
//           </select>

//           <button type="submit">Search</button>
//         </form>
//       </div>

//       {/* Display Job Listings in Box Structure */}
//       <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", padding: "20px", justifyContent: "center" }}>
//         {jobdata.length > 0 ? (
//           jobdata.map((job, index) => (
//             <div
//               key={index}
//               style={{
//                 border: "1px solid #ddd",
//                 padding: "15px",
//                 width: "300px",
//                 borderRadius: "10px",
//                 boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
//               }}
//             >
//               <h3>{job.jobtitle}</h3>
//               <p>
//                 <strong>Person Name:</strong> {job.person_name}
//               </p>
//               <p>
//                 <strong>Budget:</strong> ${job.budget}
//               </p>
//               <p>
//                 <strong>Description:</strong> {job.description}
//               </p>
//               <p>
//                 <strong>Location:</strong> {job.city}
//               </p>
//             </div>
//           ))
//         ) : (
//           <p>No jobs found</p>
//         )}
//       </div>
//     </>
//   );
// }

import React, { useEffect, useState } from "react";
import api from "../../config/api";
import { Link, useNavigate } from "react-router-dom";

export default function JobListing() {
  const navigate = useNavigate();
  const [jobdata, setJobdata] = useState([]);
  const [cities, setCities] = useState([]);
  const [data, setData] = useState({ category: "", city: "" });

  const categories = ["Plumbing", "Painting", "Cleaning", "Carpentry", "Gardening", "Washing"];

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch("https://indian-cities-api-nocbegfhqg.now.sh/cities?state=Gujarat");
        
        if (!response.ok) {
          throw new Error("Failed to fetch cities");
        }

        const cityData = await response.json();
        setCities(cityData.map(city => city.city)); // Extract city names
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };

    fetchCities();
  }, []);

  const inputChange = (event) => {
    const { name, value } = event.target;
    setData({ ...data, [name]: value });
  };

  const submit = (e) => {
    e.preventDefault();
    api.post("/api/jobs", data)
      .then((response) => setJobdata(response.data.data))
      .catch((error) => console.error("Error fetching job listings:", error));
  };

  const openBookingForm = (job) => {
    navigate("/BookingForm", { state: { job } }); // Navigate to Booking Page
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={submit} className="flex flex-col md:flex-row gap-4 justify-center items-end">
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select 
                name="city" 
                value={data.city} 
                onChange={inputChange} 
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select City</option>
                {cities.map((city, index) => (
                  <option key={index} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                name="category" 
                value={data.category} 
                onChange={inputChange} 
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Search
            </button>
          </form>
        </div>

        <div className="flex flex-wrap gap-6 justify-center">
          {jobdata.length > 0 ? (
            jobdata.map((job, index) => (
              <div 
                key={index} 
                className="bg-white border border-gray-200 rounded-xl shadow-md p-6 w-80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{job.jobtitle}</h3>
                <p className="mb-2"><span className="font-medium">Person Name:</span> {job.person_name}</p>
                <p className="mb-2"><span className="font-medium">Budget:</span> ₹{job.budget}</p>
                <p className="mb-2"><span className="font-medium">Description:</span> {job.description}</p>
                <p className="mb-4"><span className="font-medium">Location:</span> {job.city}</p>
                <button 
                  onClick={() => openBookingForm(job)} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors font-medium"
                >
                  Book
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-lg">No Data found</p>
          )}
        </div>
      </div>
    </div>
  );
}
