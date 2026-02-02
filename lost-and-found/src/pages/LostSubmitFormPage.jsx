import React from 'react';
import HeroBanner from '../components/HeroBanner';
import LostSubmitForm from '../components/LostSubmitForm';

function LostSubmitFormPage() {
  return (
    <>
      <HeroBanner title="Report a Lost Item" />
      <main className="container">
        <LostSubmitForm />
      </main>
    </>
  );
}

export default LostSubmitFormPage;
