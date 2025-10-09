import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function AuthChoice() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#ebf2f3]">
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#45573a] px-6 py-10 text-center">
              <h2 className="text-4xl font-bold text-white mb-2">Fixly</h2>
              <p className="text-[#ebf2f3] text-xl">Your Home Services Expert</p>
            </div>
            
            <div className="px-6 py-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-[#0b0e11] mb-2">Welcome!</h3>
                <p className="text-[#727373]">Choose an option to continue</p>
              </div>
              
              <div className="space-y-4">
                <button
                  className="w-full bg-[#45573a] hover:bg-[#0b0e11] text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg text-lg"
                  onClick={() => navigate("/login")}
                >
                  <i className="fas fa-sign-in-alt mr-2"></i> Login
                </button>
                <button
                  className="w-full bg-[#45573a] hover:bg-[#0b0e11] text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg text-lg"
                  onClick={() => navigate("/signup")}
                >
                  <i className="fas fa-user-plus mr-2"></i> Sign up
                </button>
              </div>
              
              <p className="mt-8 text-center text-sm text-[#727373]">
                By signing up you agree to our Terms of Use and Privacy Policy.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AuthChoice;