import { useState, useEffect } from 'react';
import axios from 'axios';

interface LocationData {
  location: string;
  country: string;
  region: string;
  city: string;
}

export const useLocationDetection = () => {
  const [locationData, setLocationData] = useState<LocationData>({
    location: '',
    country: '',
    region: '',
    city: ''
  });
  const [isDetecting, setIsDetecting] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const detectLocation = async () => {
      try {
        setIsDetecting(true);
        const ipResponse = await axios.get("https://ipapi.co/json/");
        const { city, region, country_name } = ipResponse.data;

        const newLocationData = {
          location: `${city}, ${region}, ${country_name}`,
          country: country_name,
          region: region,
          city: city,
        };

        setLocationData(newLocationData);
      } catch (err) {
        setError("Could not detect location");
      } finally {
        setIsDetecting(false);
      }
    };

    detectLocation();
  }, []);

  return { locationData, isDetecting, error };
};