import React, { useEffect, useState } from "react";
import api from "../../config/api";
import { Link, useNavigate } from "react-router-dom";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/"); // Redirect to home page
  };

  useEffect(() => {
    api
      .get("/api/bookings")
      .then((response) => {
        setAppointments(response.data.data || []);
      })
      .catch((error) => console.error("Error fetching appointments:", error));
  }, []);

  const cancelAppointment = (id) => {
    api
      .delete(`/api/bookings/${id}`)
      .then(() => {
        alert("Appointment canceled successfully!");
        setAppointments(appointments.filter((appointment) => appointment._id !== id));
      })
      .catch((error) => console.error("Error canceling appointment:", error));
  };

  const markAsDone = (appointment) => {
    navigate("/reviewform", { state: { appointment } }); // Pass appointment data to Review Page
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Your Appointments</h2>
        <div className="flex flex-wrap gap-6 justify-center">
          {appointments.length > 0 ? (
            appointments.map((appointment) => (
              <div
                key={appointment._id}
                className="bg-white border border-gray-200 rounded-xl shadow-md p-6 w-80 transition-all duration-300 hover:shadow-lg"
              >
                <p className="mb-2"><span className="font-semibold">Date:</span> {new Date(appointment.serviceDateTime).toLocaleDateString()}</p>
                <p className="mb-2"><span className="font-semibold">Person Name:</span> {appointment.customerId?.firstName} {appointment.customerId?.lastName}</p>
                <p className="mb-2"><span className="font-semibold">Budget:</span> ₹{appointment.totalAmount}</p>
                <p className="mb-4"><span className="font-semibold">Description:</span> {appointment.serviceListingId?.serviceTitle}</p>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => cancelAppointment(appointment._id)} 
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  
                  <button 
                    onClick={() => markAsDone(appointment)} 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors font-medium"
                  >
                    Done
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-lg">No appointments found</p>
          )}
        </div>
      </div>
    </div>
  );
}