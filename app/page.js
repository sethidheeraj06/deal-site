"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [dealsData, setDealsData] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("https://api.sheetbest.com/sheets/0e787e12-8c42-4953-b1ed-a40c1e877028") // replace with your Sheet.best URL
      .then((res) => res.json())
      .then((data) => {
        const fixedData = data
          .map((deal) => ({
            ...deal,
            image: deal.image ? encodeURI(deal.image) : "", // encode special chars
          }))
          .filter((deal) => deal.title && deal.price); // remove invalid rows
        setDealsData(fixedData);
      })
      .catch((err) => console.error("Error fetching deals:", err));
  }, []);

  const categories = ["All", ...new Set(dealsData.map((d) => d.category))];

  const filteredDeals = dealsData.filter((deal) => {
    const matchCategory = category === "All" || deal.category === category;

    const title = deal.title ? deal.title.toLowerCase() : "";
    const price = deal.price ? deal.price.toLowerCase() : "";

    const matchSearch =
      title.includes(search.toLowerCase()) || price.includes(search.toLowerCase());

    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-6 bg-white sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <div className="bg-blue-600 text-white w-12 h-12 flex items-center justify-center rounded-full font-bold text-2xl shadow-md">
            🔥
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            TrueGrabbers
          </h1>
        </div>
        <p className="text-gray-500 font-medium max-w-md">
          📌 Welcome to TrueGrabbers ⚡️ – One-Stop Destination for Loot, Deals & Offers! <br />
          💡 Join all 3 channels to never miss a loot!
        </p>
      </header>

      {/* Channels Banner */}
      <div className="max-w-7xl mx-auto mt-6 px-4 flex flex-col md:flex-row gap-4 justify-between">
        <a href="#" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl p-4 shadow-md hover:scale-105 transition transform flex-1 text-center">
          🔹 TrueGrabbers [Main] <br />
          Top curated & trusted deals
        </a>
        <a href="#" className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl p-4 shadow-md hover:scale-105 transition transform flex-1 text-center">
          🔹 TrueGrabbers 2.0 [Extras] <br />
          Overflow of steal-worthy picks
        </a>
        <a href="#" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl p-4 shadow-md hover:scale-105 transition transform flex-1 text-center">
          🔹 TG | Offers & Tricks <br />
          Cashbacks, tricks & offers
        </a>
      </div>

      {/* Search */}
      <div className="max-w-3xl mx-auto mt-6 px-4">
        <input
          type="text"
          placeholder="Search deals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {/* Categories */}
      <div className="flex justify-center gap-4 mt-6 flex-wrap sticky top-32 bg-gray-50 z-10 py-2 shadow-sm">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-5 py-2 rounded-full font-medium ${
              category === cat
                ? "bg-blue-600 text-white shadow-md transform scale-105"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            } transition-all`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Deals Grid */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredDeals.map((deal, index) => {
              const expired =
                deal.expired === "true" ||
                (deal.end_date && new Date(deal.end_date) < new Date());

              const discountPercent =
                deal.discount
                  ? deal.discount
                  : deal.mrp && deal.price
                    ? Math.round(
                        ((parseFloat(deal.mrp.replace(/[^0-9.]/g, '')) -
                          parseFloat(deal.price.replace(/[^0-9.]/g, ''))) /
                          parseFloat(deal.mrp.replace(/[^0-9.]/g, ''))) *
                          100
                      )
                    : 0;

              return (
                <motion.a
                  key={deal.link + index}
                  href={expired ? undefined : deal.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden relative transform hover:scale-105 hover:shadow-2xl transition-transform duration-300 ${
                    expired ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {/* Discount Ribbon */}
                  {discountPercent > 0 && (
                    <div className="absolute top-3 left-0 bg-red-500 text-white px-3 py-1 rounded-tr-xl rounded-br-xl font-bold text-sm z-10 shadow">
                      {discountPercent}% OFF
                    </div>
                  )}

                  {/* Expired Overlay */}
                  {expired && (
                    <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-20">
                      <span className="text-white font-bold text-xl">EXPIRED</span>
                    </div>
                  )}

                  {/* Image */}
                  <div className="relative w-full h-60 sm:h-48 md:h-56 lg:h-64">
                    <Image
                      src={deal.image}
                      alt={deal.title}
                      fill
                      className="object-cover rounded-t-2xl"
                      unoptimized={true}
                    />
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg line-clamp-2">{deal.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {deal.mrp && (
                        <p className="text-gray-400 line-through">{deal.mrp}</p>
                      )}
                      <p className="text-green-600 font-bold text-xl">{deal.price}</p>
                    </div>

                    {/* Coupon */}
                    {deal.coupon_text && (
                      <p className="mt-1 text-sm text-blue-600 font-medium">
                        {deal.coupon_text}: {deal.coupon_code || ""}
                      </p>
                    )}

                    {/* Grab Deal Button */}
                    {!expired && (
                      <button className="mt-3 w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 rounded-xl font-medium hover:from-indigo-500 hover:to-blue-500 transition">
                        Grab Deal
                      </button>
                    )}
                  </div>
                </motion.a>
              );
            })}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 text-center p-6 mt-12">
        © 2025 TrueGrabbers. All rights reserved.
      </footer>
    </div>
  );
}