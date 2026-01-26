import React from 'react';
import Navigation from './components/Navigation';
import HeroBanner from './components/HeroBanner';
import ItemCard from './components/ItemCard';
import Footer from './components/Footer';
import './App.css';

// Sample data for lost items (this would come from a database in production)
const sampleItems = [
  {
    id: 1,
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MV7N2?wid=1144&hei=1144&fmt=jpeg&qlt=95&.v=1551489688005',
    title: 'Airpods',
    location: 'POST',
    dateFound: '10/10/2011',
    locationFound: 'Paradise Palms'
  },
  {
    id: 2,
    image: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/99486859-0ff3-46b4-949b-2d16af2ad421/custom-nike-air-max-90-by-you.png',
    title: 'Nike Shoes',
    location: 'Webster Hall',
    dateFound: '06/12/2012',
    locationFound: 'Webster Hall'
  },
  {
    id: 3,
    image: 'https://m.media-amazon.com/images/I/81KteijWfQL._AC_UY695_.jpg',
    title: 'Wallet',
    location: 'Hamilton Library',
    dateFound: '12/02/2014',
    locationFound: 'Shidler Hall'
  },
  {
    id: 4,
    image: 'https://www.hydroflask.com/media/catalog/product/cache/9182eb26c5721c7355c97a885b3b81c1/W/2/W24BTS_Plum_5.jpg',
    title: 'Hydro Flask',
    location: 'Bilger Hall',
    dateFound: '02/18/2023',
    locationFound: 'Keller Hall'
  }
];

function App() {
  const handleReadMore = (itemId) => {
    console.log('Read more clicked for item:', itemId);
    // In a real app, this would navigate to a detail page or open a modal
  };

  return (
    <div className="app">
      <Navigation />
      <HeroBanner title="Lost Items" />
      
      <main className="container">
        <div className="items-grid">
          {sampleItems.map((item) => (
            <ItemCard
              key={item.id}
              image={item.image}
              title={item.title}
              location={item.location}
              dateFound={item.dateFound}
              locationFound={item.locationFound}
              onReadMore={() => handleReadMore(item.id)}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
