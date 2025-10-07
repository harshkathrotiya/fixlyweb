import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PlaceholderImg from "../../assets/plumbing.png";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../config/api";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const Services = () => {
  // State for listings and categories
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredListings, setFilteredListings] = useState([]);

  // State for loading and errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [tags, setTags] = useState("");
  const [ratingFilter, setRatingFilter] = useState(""); // New state for rating filter

  // State for pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  // State for sorting
  const [sortOption, setSortOption] = useState("newest");

  // State for favorite services (if user is logged in)
  const [favorites, setFavorites] = useState([]);

  // State for sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Parse query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // Extract all possible query parameters
    const categoryParam = params.get("category");
    const searchParam = params.get("search");
    const minPriceParam = params.get("minPrice");
    const maxPriceParam = params.get("maxPrice");
    const tagsParam = params.get("tags");
    const ratingParam = params.get("rating"); // New parameter
    const pageParam = params.get("page");
    const limitParam = params.get("limit");
    const sortParam = params.get("sort");
    
    // Set state based on URL parameters
    if (categoryParam) setSelectedCategory(categoryParam);
    if (searchParam) setSearchTerm(searchParam);
    if (minPriceParam) setMinPrice(minPriceParam);
    if (maxPriceParam) setMaxPrice(maxPriceParam);
    if (tagsParam) setTags(tagsParam);
    if (ratingParam) setRatingFilter(ratingParam);
    if (pageParam) setPage(parseInt(pageParam));
    if (limitParam) setLimit(parseInt(limitParam));
    if (sortParam) setSortOption(sortParam);
  }, [location.search]);

  // Fetch categories and providers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await api.get('/api/categories');
        const fetchedCategories = categoriesResponse.data.data || [];
        setCategories(fetchedCategories);
        
        // Don't auto-select any category, show all by default
        // setSelectedCategory will remain empty to show all listings
        
        // Removed provider fetching since we're removing provider filter
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      }
    };
    
    fetchData();
    
    // If user is logged in, fetch favorites
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  // Mock function to fetch user favorites - this would need to be implemented in your backend
  const fetchFavorites = async () => {
    // This is a placeholder - replace with actual API call
    try {
      // const response = await axios.get(`/api/users/${user.id}/favorites`);
      // setFavorites(response.data.data || []);

      // For now, just using localStorage to simulate favorites functionality
      const savedFavorites = localStorage.getItem('serviceFavorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  // Fetch listings based on filters, sorting, and pagination
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = '/api/listings';
        let params = new URLSearchParams();

        // Add query parameters
        if (selectedCategory) params.append('category', selectedCategory);
        // Removed provider filter since we're removing provider functionality
        if (searchTerm) params.append('search', searchTerm);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (tags) params.append('tags', tags);
        if (ratingFilter) params.append('minRating', ratingFilter);
        if (sortOption) params.append('sort', sortOption);

        // Pagination parameters
        params.append('page', page);
        params.append('limit', limit);

        // Make the API request with timeout
        console.log('Fetching listings from:', url, 'with params:', params.toString());
        
        // Add timeout to catch network issues
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await api.get(
          params.toString() ? `${url}?${params.toString()}` : url,
          { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        
        console.log('API Response:', response);

        // Handle the response
        const data = response.data;
        if (data && Array.isArray(data.data)) {
          setFilteredListings(data.data);
        } else {
          console.warn('Unexpected data format:', data);
          setFilteredListings([]);
        }

        // Set pagination info if available
        if (data && data.pagination) {
          setTotalPages(data.pagination.pages || 1);
        }

        console.log('Fetched listings:', data?.data);
      } catch (err) {
        console.error('Error fetching listings:', err);
        
        // Handle different types of errors
        if (err.code === 'ERR_NETWORK') {
          setError('Network error. Please check your connection and try again.');
        } else if (err.code === 'ERR_CANCELED') {
          setError('Request timeout. Please try again.');
        } else if (err.response) {
          // Server responded with error status
          setError(`Server error: ${err.response.data?.message || 'Failed to load services'}`);
        } else {
          // Network or other error
          setError('Failed to load services. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [
    selectedCategory,
    searchTerm,
    minPrice,
    maxPrice,
    tags,
    ratingFilter,
    page,
    limit,
    sortOption
  ]);

  // Update URL with current filters
  const updateUrlWithFilters = () => {
    const params = new URLSearchParams();

    // Only add category param if a specific category is selected
    if (selectedCategory) params.append('category', selectedCategory);
    // Removed provider filter since we're removing provider functionality
    if (searchTerm) params.append('search', searchTerm);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (tags) params.append('tags', tags);
    if (ratingFilter) params.append('rating', ratingFilter);
    if (page > 1) params.append('page', page);
    if (limit !== 12) params.append('limit', limit);
    if (sortOption !== 'newest') params.append('sort', sortOption);

    navigate(`/services?${params.toString()}`, { replace: true });
  };

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setPage(1); // Reset to first page

    // Update URL
    const params = new URLSearchParams(location.search);
    if (categoryId) {
      params.set('category', categoryId);
    } else {
      // Remove category param to show all listings
      params.delete('category');
    }
    params.set('page', '1');
    navigate(`/services?${params.toString()}`, { replace: true });
  };

  // Handle view details
  const handleViewDetails = (listing) => {
    navigate(`/listing/${listing._id}`);
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    setPage(1); // Reset to first page
    updateUrlWithFilters();
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setPage(1); // Reset to first page

    // Update URL
    const params = new URLSearchParams(location.search);
    params.set('sort', e.target.value);
    params.set('page', '1');
    navigate(`/services?${params.toString()}`, { replace: true });
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);

    // Update URL
    const params = new URLSearchParams(location.search);
    params.set('page', newPage.toString());
    navigate(`/services?${params.toString()}`, { replace: true });

    // Scroll to top of services section
    if (servicesRef.current) {
      servicesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
    setTags("");
    setRatingFilter("");
    // Removed setSelectedProvider since we're removing provider functionality
    setSortOption("newest");
    setPage(1);
    setSelectedCategory(""); // Reset to show all categories

    // Clear all params to show all listings
    navigate('/services', { replace: true });
  };

  // Toggle favorite status
  const toggleFavorite = (listingId) => {
    if (!user) {
      // Redirect to login if not logged in
      navigate('/login', { state: { from: location } });
      return;
    }

    // Update local favorites list
    let updatedFavorites;
    if (favorites.includes(listingId)) {
      updatedFavorites = favorites.filter(id => id !== listingId);
    } else {
      updatedFavorites = [...favorites, listingId];
    }

    setFavorites(updatedFavorites);

    // Save to localStorage (replace with API call in production)
    localStorage.setItem('serviceFavorites', JSON.stringify(updatedFavorites));

    // For a real implementation, you'd save to the database
    // axios.post(`/api/users/${user.id}/favorites`, { listingId });
  };

  // Find the name of the selected category
  const selectedCategoryName = selectedCategory 
    ? categories.find(cat => cat._id === selectedCategory)?.categoryName || 'Unknown Category'
    : 'All Services';

  // Calculate average rating for stars display
  const renderStars = (rating) => {
    if (!rating || rating <= 0) return null;

    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="flex text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <i key={`full-${i}`} className="fas fa-star"></i>
        ))}
        {halfStar && <i key="half" className="fas fa-star-half-alt"></i>}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`empty-${i}`} className="far fa-star"></i>
        ))}
      </div>
    );
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;

    // Calculate range of pages to show
    let startPage = Math.max(1, page - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    // Adjust if we're at the end
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    // First page button
    if (startPage > 1) {
      buttons.push(
        <button
          key="first"
          onClick={() => handlePageChange(1)}
          className="px-3 py-2 rounded-md bg-white border border-[#939492] text-[#0b0e11] hover:bg-[#ebf2f3] transition-colors duration-200 shadow-sm"
        >
          1
        </button>
      );

      if (startPage > 2) {
        buttons.push(<span key="dots1" className="px-2 py-2 text-[#727373]">...</span>);
      }
    }

    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 rounded-md transition-colors duration-200 shadow-sm ${
            page === i
              ? 'bg-[#50B498] text-white border border-[#50B498]'
              : 'bg-white border border-[#939492] text-[#0b0e11] hover:bg-[#ebf2f3]'
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page button
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="dots2" className="px-2 py-2 text-[#727373]">...</span>);
      }

      buttons.push(
        <button
          key="last"
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-2 rounded-md bg-white border border-[#939492] text-[#0b0e11] hover:bg-[#ebf2f3] transition-colors duration-200 shadow-sm"
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  // Get category icon
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Home Cleaning': 'fas fa-broom',
      'Plumbing': 'fas fa-faucet',
      'Electrical': 'fas fa-bolt',
      'Carpentry': 'fas fa-hammer',
      'Painting': 'fas fa-paint-roller',
      'Appliance Repair': 'fas fa-tools',
      'Pest Control': 'fas fa-spider',
      'Gardening': 'fas fa-seedling',
      'Interior Design': 'fas fa-couch',
      'Moving & Packing': 'fas fa-truck-moving',
      'Beauty & Spa': 'fas fa-spa',
      'Computer Repair': 'fas fa-laptop',
      'Tutoring': 'fas fa-chalkboard-teacher',
      'Event Planning': 'fas fa-calendar-alt',
      'Photography': 'fas fa-camera',
      'Other': 'fas fa-ellipsis-h'
    };
    
    return iconMap[categoryName] || 'fas fa-tag';
  };

  // Service card component
  const ServiceCard = ({ listing, index }) => {
    const [imageError, setImageError] = useState(false);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group"
      >
        {/* Service Image */}
        <div className="relative h-56 overflow-hidden">
          {listing.serviceImage && !imageError ? (
            <img
              src={listing.serviceImage}
              alt={listing.serviceTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-[#DEF9C4] flex items-center justify-center">
              <img 
                src={PlaceholderImg} 
                alt={listing.serviceTitle} 
                className="w-20 h-20 object-contain opacity-70"
              />
            </div>
          )}
          
          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(listing._id);
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white bg-opacity-80 flex items-center justify-center hover:bg-opacity-100 transition-all"
          >
            <i className={`fas ${favorites.includes(listing._id) ? 'fa-heart text-red-500' : 'far fa-heart'} text-lg`}></i>
          </button>
          
          {/* Rating badge */}
          {listing.averageRating > 0 && (
            <div className="absolute bottom-3 left-3 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
              <i className="fas fa-star mr-1"></i>
              {listing.averageRating.toFixed(1)}
            </div>
          )}
        </div>
        
        {/* Service Details */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-xl text-[#0b0e11] line-clamp-1">{listing.serviceTitle}</h3>
            <span className="text-xl font-bold text-[#50B498]">₹{listing.servicePrice?.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center text-[#727373] mb-3">
            <i className="fas fa-tag mr-2 text-[#50B498]"></i>
            <span className="font-medium">{listing.categoryId?.categoryName || 'General Service'}</span>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#DEF9C4] flex items-center justify-center mr-2">
                <i className="fas fa-user text-[#50B498] text-sm"></i>
              </div>
              <span className="font-medium text-[#0b0e11]">
                {listing.serviceProviderId?.firstName} {listing.serviceProviderId?.lastName}
              </span>
            </div>
            
            {listing.isActive ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <i className="fas fa-check-circle mr-1"></i> Active
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <i className="fas fa-times-circle mr-1"></i> Inactive
              </span>
            )}
          </div>
          
          <Button
            onClick={() => handleViewDetails(listing)}
            className="w-full py-2.5 bg-gradient-to-r from-[#50B498] to-[#468585] hover:from-[#468585] hover:to-[#50B498] text-white font-medium"
          >
            View Details
          </Button>
        </div>
      </motion.div>
    );
  };

  // Service card skeleton for loading state
  const ServiceCardSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
      <div className="h-56 bg-[#ebf2f3]"></div>
      <div className="p-6">
        <div className="h-7 bg-[#ebf2f3] rounded mb-3"></div>
        <div className="h-5 bg-[#ebf2f3] rounded mb-3 w-3/4"></div>
        <div className="h-5 bg-[#ebf2f3] rounded mb-4 w-1/2"></div>
        <div className="h-12 bg-[#babfbc] rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DEF9C4] to-[#9CDBA6]">
      {/* Hero Section */}
      <section className="relative py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[#0b0e11] mb-4">
              Find the Perfect Service
            </h1>
            <p className="text-xl text-[#727373] mb-8">
              Discover trusted professionals for all your needs
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Input
                type="text"
                placeholder="Search for services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
                className="py-4 pl-12 pr-4 text-lg bg-white border-2 border-[#939492] rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-[#50B498] focus:border-transparent transition-all"
              />
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-[#939492] text-xl"></i>
              <Button
                onClick={handleApplyFilters}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#50B498] hover:bg-[#468585] text-white font-medium py-2 px-6 rounded-full transition-all"
              >
                Search
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <motion.div
            className={`lg:w-80 flex-shrink-0 ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 bg-white rounded-2xl shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#0b0e11]">Filters</h2>
                <Button
                  variant="secondary"
                  onClick={resetFilters}
                  className="text-sm bg-[#babfbc] hover:bg-[#939492] text-[#0b0e11]"
                >
                  Reset
                </Button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-[#0b0e11] mb-3 flex items-center">
                  <i className="fas fa-tags mr-2 text-[#50B498]"></i> Categories
                </h3>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                  {/* All Categories Option */}
                  <div
                    onClick={() => handleCategoryChange('')}
                    className={`flex items-center p-4 rounded-xl cursor-pointer transition-all ${
                      selectedCategory === ''
                        ? 'bg-[#DEF9C4] border-2 border-[#50B498]'
                        : 'hover:bg-[#ebf2f3] border border-gray-200'
                    }`}
                  >
                    <span className="font-medium text-lg">All Categories</span>
                  </div>
                  
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <div
                        key={category._id}
                        onClick={() => handleCategoryChange(category._id)}
                        className={`flex items-center p-4 rounded-xl cursor-pointer transition-all ${
                          selectedCategory === category._id
                            ? 'bg-[#DEF9C4] border-2 border-[#50B498]'
                            : 'hover:bg-[#ebf2f3] border border-gray-200'
                        }`}
                      >
                        <span className="font-medium text-lg">{category.categoryName}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No categories available
                    </div>
                  )}
                </div>
              </div>

              {/* Removed Provider Filter since we're removing provider functionality */}
              
              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-[#0b0e11] mb-3 flex items-center">
                  <i className="fas fa-dollar-sign mr-2 text-[#50B498]"></i> Price Range
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="bg-[#ebf2f3]"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="bg-[#ebf2f3]"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-[#0b0e11] mb-3 flex items-center">
                  <i className="fas fa-star mr-2 text-[#50B498]"></i> Minimum Rating
                </h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <div
                      key={rating}
                      onClick={() => setRatingFilter(rating.toString())}
                      className={`flex items-center p-2 rounded-lg cursor-pointer transition-all ${
                        ratingFilter === rating.toString()
                          ? 'bg-[#DEF9C4] border border-[#50B498]'
                          : 'hover:bg-[#ebf2f3]'
                      }`}
                    >
                      <div className="flex text-yellow-400 mr-2">
                        {[...Array(rating)].map((_, i) => (
                          <i key={`filled-${i}`} className="fas fa-star"></i>
                        ))}
                        {[...Array(5 - rating)].map((_, i) => (
                          <i key={`empty-${i}`} className="far fa-star"></i>
                        ))}
                      </div>
                      <span className="font-medium">& Up</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-[#0b0e11] mb-3 flex items-center">
                  <i className="fas fa-tags mr-2 text-[#50B498]"></i> Tags
                </h3>
                <Input
                  type="text"
                  placeholder="e.g. emergency, weekend"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="bg-[#ebf2f3]"
                />
              </div>

              {/* Apply Filters Button */}
              <Button
                onClick={handleApplyFilters}
                className="w-full py-3 bg-gradient-to-r from-[#50B498] to-[#468585] hover:from-[#468585] hover:to-[#50B498] text-white font-medium"
              >
                Apply Filters
              </Button>
            </Card>
          </motion.div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
              <Button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="w-full py-3 bg-white border border-[#939492] text-[#0b0e11] font-medium flex items-center justify-center"
              >
                <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-filter'} mr-2`}></i>
                {isSidebarOpen ? 'Close Filters' : 'Show Filters'}
              </Button>
            </div>

            {error && (
              <Card className="mb-6 p-4 bg-red-50 border-l-4 border-red-500">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-circle text-red-500 text-xl mr-3"></i>
                  <p className="text-red-700 flex-1">{error}</p>
                  <button 
                    onClick={() => setError(null)} 
                    className="text-red-700 hover:text-red-900 transition-colors"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </Card>
            )}

            {/* Results Header */}
            <Card className="mb-6 p-6 bg-white rounded-2xl shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#0b0e11]">
                    {selectedCategoryName}
                    {searchTerm && ` - "${searchTerm}"`}
                  </h2>
                  <p className="text-[#727373]">
                    {filteredListings.length} service{filteredListings.length !== 1 ? 's' : ''} found
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center">
                    <label htmlFor="sort-select" className="mr-2 text-[#727373]">Sort by:</label>
                    <select
                      id="sort-select"
                      value={sortOption}
                      onChange={handleSortChange}
                      className="border border-[#939492] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#50B498] transition-all bg-[#ebf2f3]"
                    >
                      <option value="newest">Newest First</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Services Results */}
            <div className="min-h-[400px]">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, index) => (
                    <ServiceCardSkeleton key={index} />
                  ))}
                </div>
              ) : filteredListings.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                      {filteredListings.map((listing, index) => (
                        <ServiceCard key={listing._id} listing={listing} index={index} />
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Pagination controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-12">
                      <Button
                        variant="secondary"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="flex items-center bg-[#DEF9C4] hover:bg-[#9CDBA6] text-[#0b0e11]"
                      >
                        <i className="fas fa-chevron-left mr-2"></i> Previous
                      </Button>

                      <div className="flex gap-1">
                        {renderPaginationButtons()}
                      </div>

                      <Button
                        variant="secondary"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        className="flex items-center bg-[#DEF9C4] hover:bg-[#9CDBA6] text-[#0b0e11]"
                      >
                        Next <i className="fas fa-chevron-right ml-2"></i>
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <Card className="text-center p-12 bg-white rounded-2xl">
                  <div className="text-5xl text-[#babfbc] mb-6">
                    <i className="fas fa-search"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-[#0b0e11] mb-3">No Services Found</h3>
                  <p className="text-[#727373] mb-2">We couldn't find any services matching your criteria.</p>
                  <p className="text-[#727373] mb-6">Try adjusting your filters or search term to find what you're looking for.</p>
                  <Button 
                    onClick={resetFilters}
                    className="bg-gradient-to-r from-[#50B498] to-[#468585] hover:from-[#468585] hover:to-[#50B498] text-white"
                  >
                    Reset Filters
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;