import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import ImageGallery from '../../components/service-details/ImageGallery';
import ServiceHeader from '../../components/service-details/ServiceHeader';
import PricingInfo from '../../components/service-details/PricingInfo';
import ServiceDescription from '../../components/service-details/ServiceDescription';
import ServiceProviderInfo from '../../components/service-details/ServiceProviderInfo';
import ServiceDetailsInfo from '../../components/service-details/ServiceDetailsInfo';
import BookingForm from '../../components/service-details/BookingForm';
import RelatedServices from '../../components/service-details/RelatedServices';
import Button from '../../components/common/Button'; // Import the standardized Button component
import { toast } from 'react-toastify';

function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for service data
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);

  // State for image gallery
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [images, setImages] = useState([]);

  // State for booking
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    date: '',
    time: '',
    notes: ''
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/listings/${id}`);
        setListing(response.data.data);

        // Fix: Check if images exists and is an array before spreading
        const serviceImages = response.data.data.serviceImage
          ? [response.data.data.serviceImage, ...(Array.isArray(response.data.data.images) ? response.data.data.images : [])]
          : [''];

        // Ensure all images are valid URLs
        const validImages = serviceImages.filter(img => img && (img.startsWith('http') || img.startsWith('https') || img.startsWith('/')));
        setImages(validImages.length > 0 ? validImages : ['']);

        if (response.data.data.categoryId?._id) {
          fetchRelatedServices(response.data.data.categoryId._id, id);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching service details:', err);
        setError('Failed to load service details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchRelatedServices = async (categoryId, currentListingId) => {
    try {
      const response = await api.get(`/api/listings?category=${categoryId}&limit=3`);
      const filteredRelated = response.data.data.filter(service => service._id !== currentListingId);
      setRelatedServices(filteredRelated.slice(0, 3));
    } catch (err) {
      console.error('Error fetching related services:', err);
    }
  };

  const handleImageChange = (index) => {
    setSelectedImageIndex(index);
  };

  const handleBookNow = () => {
    if (!user) {
      navigate('/login', { state: { from: `/listing/${id}` } });
      return;
    }
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError(null);

    try {
      // Format the date and time properly for the backend
      const bookingDateTime = new Date(`${bookingDetails.date}T${bookingDetails.time}`);

      // Updated booking data to match the API requirements
      const bookingData = {
        serviceListingId: id,
        serviceDateTime: bookingDateTime.toISOString(),
        specialInstructions: bookingDetails.notes || ''
      };

      const response = await api.post('/api/bookings', bookingData);

      // Close the form first, then show success message
      setShowBookingForm(false);
      
      // Show success toast notification
      toast.success('Booking successful! The provider will contact you shortly.');
      
      // Reset booking details
      setBookingDetails({ date: '', time: '', notes: '' });
    } catch (err) {
      console.error('Error creating booking:', err.response?.data || err.message || err);
      setBookingError(err.response?.data?.message || 'Failed to create booking. Please try again.');
      toast.error('Failed to create booking. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Add the missing getTimeSince function
  const getTimeSince = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return interval === 1 ? '1 year ago' : `${interval} years ago`;
    }

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return interval === 1 ? '1 month ago' : `${interval} months ago`;
    }

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return interval === 1 ? '1 day ago' : `${interval} days ago`;
    }

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
    }

    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
    }

    return 'Just now';
  };

  const handleBackToServices = () => {
    navigate('/services');
  };

  const handleShareService = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.serviceTitle,
        text: `Check out this service: ${listing?.serviceTitle}`,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch((err) => console.error('Could not copy text: ', err));
    }
  };

  const handleContactProvider = () => {
    // Implementation for contacting provider
    alert('Contact provider functionality would be implemented here');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <div className="mb-4">
              <i className="fas fa-spinner fa-spin text-4xl text-[#50B498]"></i>
            </div>
            <p className="text-xl text-gray-600">Loading service details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-8 max-w-2xl mx-auto text-center shadow-md">
            <i className="fas fa-exclamation-circle text-red-500 text-5xl mb-4"></i>
            <p className="text-red-700 mb-6">{error || 'Service not found'}</p>
            <Button 
              onClick={handleBackToServices}
              variant="primary"
            >
              Back to Services
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button 
            onClick={handleBackToServices} 
            className="flex items-center text-[#50B498] hover:text-[#468585] font-medium"
          >
            <i className="fas fa-arrow-left mr-2"></i> Back to Services
          </button>
          <div className="flex items-center ml-4 text-sm text-gray-600">
            <span 
              onClick={handleBackToServices} 
              className="cursor-pointer text-[#50B498] hover:text-[#468585]"
            >
              Services
            </span>
            <i className="fas fa-chevron-right mx-2 text-xs"></i>
            <span 
              onClick={() => navigate(`/services?category=${listing.categoryId?._id}`)} 
              className="cursor-pointer text-[#50B498] hover:text-[#468585]"
            >
              {listing.categoryId?.categoryName || 'Category'}
            </span>
            <i className="fas fa-chevron-right mx-2 text-xs"></i>
            <span className="font-medium text-gray-800">{listing.serviceTitle}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ImageGallery 
              images={images} 
              selectedImageIndex={selectedImageIndex} 
              onImageChange={handleImageChange} 
              title={listing.serviceTitle} 
            />

            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <ServiceHeader 
                title={listing.serviceTitle}
                categoryName={listing.categoryId?.categoryName}
                createdAt={listing.createdAt}
                averageRating={listing.averageRating}
                reviewCount={listing.reviewCount}
                isActive={listing.isActive}
                getTimeSince={getTimeSince}
                formatDate={formatDate}
                onShare={handleShareService}
              />

              <PricingInfo 
                servicePrice={listing.servicePrice}
                providerEarning={listing.providerEarning}
                commissionAmount={listing.commissionAmount}
                userRole={user?.role}
              />

              <ServiceDescription 
                description={listing.serviceDetails}
                tags={listing.tags}
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="flex-1 py-3 px-6"
                  onClick={handleBookNow}
                >
                  <i className="fas fa-calendar-check mr-2"></i> Book Now
                </Button>
              </div>
            </div>
          </div>

          <div>
            <ServiceProviderInfo 
              provider={listing.serviceProviderId} 
              onContactProvider={handleContactProvider} 
            />
            
            <ServiceDetailsInfo 
              location={listing.location}
              isActive={listing.isActive}
              estimatedHours={listing.estimatedHours}
              serviceType={listing.serviceType}
            />
            
            <div className="mt-6">
              <Button 
                className="w-full py-3 px-4"
                onClick={handleBookNow}
              >
                <i className="fas fa-calendar-check mr-2"></i> Book This Service
              </Button>
            </div>
          </div>
        </div>

        {showBookingForm && (
          <BookingForm 
            bookingDetails={bookingDetails}
            onBookingDetailsChange={setBookingDetails}
            onSubmit={handleBookingSubmit}
            onClose={() => setShowBookingForm(false)}
            title={listing.serviceTitle}
            provider={listing.serviceProviderId}
            servicePrice={listing.servicePrice}
            bookingError={bookingError}
          />
        )}

        <RelatedServices services={relatedServices} />
      </div>
    </div>
  );
}

export default ServiceDetails;