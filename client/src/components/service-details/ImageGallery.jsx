import React, { useRef } from 'react';
import PlaceholderImg from '../../assets/plumbing.png';

const ImageGallery = ({ images, selectedImageIndex, onImageChange, title }) => {
  const imageGalleryRef = useRef(null);

  const handleImageChange = (index) => {
    onImageChange(index);
    if (imageGalleryRef.current) {
      const thumbnailContainer = imageGalleryRef.current.querySelector('.thumbnail-images');
      const thumbnails = thumbnailContainer.querySelectorAll('.thumbnail-container');
      if (thumbnails[index]) {
        thumbnails[index].scrollIntoView({ behavior: 'smooth', inline: 'center' });
      }
    }
  };

  // Filter out any empty or invalid images
  const validImages = images.filter(img => img && img !== '');

  if (validImages.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 flex items-center justify-center h-96">
        <img
          src={PlaceholderImg}
          alt="Service placeholder"
          className="w-full h-full object-contain p-8"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8" ref={imageGalleryRef}>
      <div className="relative">
        <img
          src={validImages[selectedImageIndex] || PlaceholderImg}
          alt={`${title} - Image ${selectedImageIndex + 1} of ${validImages.length}`}
          className="w-full h-96 object-cover"
          onError={(e) => {
            e.target.src = PlaceholderImg;
          }}
        />
        <div className="absolute inset-0 flex justify-between items-center opacity-0 hover:opacity-100 transition-opacity">
          {validImages.length > 1 && (
            <>
              <button
                className="bg-white bg-opacity-70 text-gray-800 w-10 h-10 rounded-full flex items-center justify-center mx-4 hover:bg-opacity-100 transition-all"
                onClick={() => handleImageChange((selectedImageIndex - 1 + validImages.length) % validImages.length)}
                aria-label="Previous image"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button
                className="bg-white bg-opacity-70 text-gray-800 w-10 h-10 rounded-full flex items-center justify-center mx-4 hover:bg-opacity-100 transition-all"
                onClick={() => handleImageChange((selectedImageIndex + 1) % validImages.length)}
                aria-label="Next image"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </>
          )}
        </div>
      </div>

      {validImages.length > 1 && (
        <div className="flex gap-2 p-4 overflow-x-auto" role="tablist" aria-label="Service images">
          {validImages.map((image, index) => (
            <button
              key={index}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 ${selectedImageIndex === index ? 'border-[#50B498]' : 'border-transparent'}`}
              onClick={() => handleImageChange(index)}
              aria-label={`View image ${index + 1} of ${validImages.length}`}
              aria-selected={selectedImageIndex === index}
              role="tab"
            >
              <img
                src={image}
                alt={`${title} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = PlaceholderImg;
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;