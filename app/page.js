"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, Sun, CloudLightning, Wind, MapPin, Search, Cloud, Snowflakes, Navigation } from 'lucide-react';

export default function SkyCast() {
  const [weather, setWeather] = useState(null);
  const [query, setQuery] = useState("Paris");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = process.env.NEXT_PUBLIC_WEATHER_KEY;

const getLocation = () => {
  if (!navigator.geolocation) {
    alert("La géolocalisation n'est pas supportée par votre navigateur");
    return;
  }

  setLoading(true);
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=fr&appid=${API_KEY}`
      );
      const data = await res.json();
      setWeather({
        city: data.name,
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main,
        humidity: data.main.humidity,
        wind: Math.round(data.wind.speed * 3.6),
      });
    } catch (err) {
      setError("Impossible de localiser votre position");
    } finally {
      setLoading(false);
    }
  }, () => {
    setError("Accès à la position refusé");
    setLoading(false);
  });
};

  const fetchWeather = async (city) => {
    setLoading(true);
    setError(null);
    if (city.toLowerCase() === "demo") {
    setWeather({
      city: "Paris (Mode Démo)",
      temp: 22,
      condition: "Rain", // Possibilité de changer ici pour tester : "Clear", "Clouds", "Snow"
      humidity: 45,
      wind: 15
    });
    setLoading(false);
    return;
  }
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=fr&appid=${API_KEY}`
      );
      if (!res.ok) throw new Error("Ville non trouvée");
      const data = await res.json();
      
      setWeather({
        city: data.name,
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main, // Clear, Rain, Clouds, Snow, etc.
        humidity: data.main.humidity,
        wind: Math.round(data.wind.speed * 3.6), // Conversion m/s en km/h
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWeather("Paris"); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query) fetchWeather(query);
  };

  const themes = {
    Clear: "from-orange-400 to-yellow-200 text-orange-900",
    Rain: "from-slate-700 to-blue-900 text-blue-100",
    Clouds: "from-gray-400 to-slate-600 text-gray-100",
    Snow: "from-blue-100 to-blue-300 text-blue-800",
    Thunderstorm: "from-purple-900 to-black text-purple-100"
  };

  if (!weather && loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">CHARGEMENT...</div>;

  return (
    <div className={`min-h-screen transition-all duration-1000 bg-gradient-to-br ${themes[weather?.condition] || themes.Clear} p-6 flex items-center justify-center font-sans relative`}>
      
      {/* Animation de Pluie ou Neige */}
      <AnimatePresence>
        {weather?.condition === "Rain" && (
           <div className="absolute inset-0 overflow-hidden pointer-events-none">
           {[...Array(20)].map((_, i) => (
             <motion.div key={i} initial={{ y: -20, x: `${Math.random() * 100}%` }} animate={{ y: 1000 }} transition={{ repeat: Infinity, duration: 0.7, delay: Math.random() }} className="absolute w-[1px] h-10 bg-white/40" />
           ))}
         </div>
        )}
      </AnimatePresence>

      <motion.div layout className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-[3rem] shadow-2xl">
        <div className="flex gap-2 mb-12">
          <form onSubmit={handleSearch} className="relative flex-1">
            <input 
              type="text" 
              placeholder="Chercher une ville..."
              className="w-full bg-white/10 border border-white/20 py-3 px-6 rounded-2xl outline-none focus:bg-white/30 transition-all placeholder:text-inherit/50"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-4 top-3.5 opacity-50 hover:opacity-100 transition-opacity">
              <Search size={20} />
            </button>
          </form>

          <button 
            onClick={getLocation}
            type="button"
            className="bg-white/10 border border-white/20 p-3 rounded-2xl hover:bg-white/30 transition-all flex items-center justify-center group shadow-lg"
            title="Ma position"
          >
            <Navigation size={20} className="group-hover:rotate-12 transition-transform opacity-70 group-hover:opacity-100" />
          </button>
        </div>

        

        {error ? (
          <div className="text-center font-bold text-red-400">{error}</div>
        ) : (
          weather && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2 opacity-70">
                <MapPin size={16} />
                <span className="font-crimson italic text-xl">{weather.city}</span>
              </div>
              <h2 className="text-8xl font-black font-itim mb-4">{weather.temp}°</h2>
              <div className="text-sm font-bold tracking-[0.3em] uppercase mb-8">{weather.condition}</div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/10 p-4 rounded-3xl">
                  <p className="text-[10px] font-bold opacity-50 uppercase">Vent</p>
                  <p className="font-mono">{weather.wind} km/h</p>
                </div>
                <div className="bg-black/10 p-4 rounded-3xl">
                  <p className="text-[10px] font-bold opacity-50 uppercase">Humidité</p>
                  <p className="font-mono">{weather.humidity}%</p>
                </div>
              </div>
            </div>
          )
        )}
      </motion.div>
    </div>
  );
}