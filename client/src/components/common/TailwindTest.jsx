import React from 'react';

function TailwindTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-check text-white text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tailwind is Working!</h2>
          <p className="text-gray-600 mb-6">All Tailwind classes are being applied correctly.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-100 p-4 rounded-lg">
              <i className="fas fa-palette text-lg text-blue-600 mx-auto block mb-2"></i>
              <p className="text-sm text-blue-800 font-semibold">Colors</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <i className="fas fa-mobile-alt text-lg text-green-600 mx-auto block mb-2"></i>
              <p className="text-sm text-green-800 font-semibold">Responsive</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg">
              <i className="fas fa-rocket text-lg text-purple-600 mx-auto block mb-2"></i>
              <p className="text-sm text-purple-800 font-semibold">Fast</p>
            </div>
            <div className="bg-orange-100 p-4 rounded-lg">
              <i className="fas fa-heart text-lg text-orange-600 mx-auto block mb-2"></i>
              <p className="text-sm text-orange-800 font-semibold">Beautiful</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TailwindTest;