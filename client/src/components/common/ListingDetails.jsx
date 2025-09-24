import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import Card from '../common/Card';
import Button from '../common/Button';

function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/listings/${id}`);
        setListing(response.data.data);
      } catch (err) {
        setError('Error fetching listing details');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#DEF9C4] to-[#9CDBA6] py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-pulse">
            <div className="h-12 bg-[#babfbc] rounded-t-2xl"></div>
            <div className="p-6">
              <div className="h-6 bg-[#babfbc] rounded mb-4"></div>
              <div className="h-48 bg-[#babfbc] rounded-lg mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-[#babfbc] rounded"></div>
                <div className="h-4 bg-[#babfbc] rounded w-3/4"></div>
                <div className="h-4 bg-[#babfbc] rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#DEF9C4] to-[#9CDBA6] py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="text-center p-12">
            <div className="text-5xl text-[#babfbc] mb-6">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h3 className="text-2xl font-bold text-[#0b0e11] mb-3">Service Not Found</h3>
            <p className="text-[#727373] mb-6">We couldn't find the service you're looking for.</p>
            <Button 
              onClick={() => navigate('/services')}
              className="bg-gradient-to-r from-[#50B498] to-[#468585] hover:from-[#468585] hover:to-[#50B498] text-white"
            >
              Back to Services
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DEF9C4] to-[#9CDBA6] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/services')}
            className="flex items-center text-[#468585] hover:text-[#50B498] font-medium transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i> Back to Services
          </button>
        </div>

        <Card className="overflow-hidden rounded-2xl shadow-xl">
          <div className="bg-gradient-to-r from-[#50B498] to-[#468585] p-6">
            <h2 className="text-2xl font-bold text-white">Listing Details</h2>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="md:w-1/3">
                <div className="bg-[#ebf2f3] rounded-xl overflow-hidden h-64 flex items-center justify-center">
                  {listing.serviceImage ? (
                    <img 
                      src={listing.serviceImage} 
                      alt={listing.serviceTitle} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <i className="fas fa-image text-4xl text-[#babfbc]"></i>
                  )}
                </div>
              </div>
              
              <div className="md:w-2/3">
                <h3 className="text-2xl font-bold text-[#0b0e11] mb-3">{listing.serviceTitle}</h3>
                <div className="mb-4">
                  <span className="text-2xl font-bold bg-gradient-to-r from-[#50B498] to-[#468585] bg-clip-text text-transparent">
                    ₹{listing.servicePrice}
                  </span>
                </div>
                <p className="text-[#727373] mb-6">{listing.serviceDetails}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {listing.tags && listing.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="bg-gradient-to-r from-[#DEF9C4] to-[#9CDBA6] text-[#0b0e11] px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center mb-2">
                  <span className="text-[#0b0e11] font-medium mr-2">Status:</span>
                  <span className={`font-medium ${listing.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {listing.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#babfbc] pt-6">
              <h4 className="text-lg font-bold text-[#0b0e11] mb-4">Provider Information</h4>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#50B498] to-[#468585] flex items-center justify-center text-white mr-3">
                  <i className="fas fa-user"></i>
                </div>
                <div>
                  <p className="font-medium text-[#0b0e11]">
                    {listing.serviceProviderId?.userId ?
                      `${listing.serviceProviderId.userId.firstName || ''} ${listing.serviceProviderId.userId.lastName || ''}`.trim() || 'Service Provider'
                      : 'Service Provider'}
                  </p>
                  <p className="text-sm text-[#727373]">Verified Provider</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-[#babfbc]">
              <Button 
                onClick={() => navigate(`/provider/edit-listing/${id}`)}
                className="bg-gradient-to-r from-[#50B498] to-[#468585] hover:from-[#468585] hover:to-[#50B498] text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                <i className="fas fa-edit mr-2"></i> Edit Listing
              </Button>
              <Button 
                onClick={() => navigate('/provider/dashboard')}
                className="bg-gradient-to-r from-[#DEF9C4] to-[#9CDBA6] hover:from-[#9CDBA6] hover:to-[#50B498] text-[#0b0e11] px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                <i className="fas fa-arrow-left mr-2"></i> Back to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ListingDetails;