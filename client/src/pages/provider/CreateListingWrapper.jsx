import React from 'react';
import CreateListing from '../../components/common/CreateListing';
import ProviderLayout from './ProviderLayout';

function CreateListingWrapper() {
  return (
    <ProviderLayout>
      <CreateListing />
    </ProviderLayout>
  );
}

export default CreateListingWrapper;
