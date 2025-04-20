// pages/index.tsx

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Search } from "lucide-react";

const questions = [
  "Do you have flat feet or high arches?",
  "What sport do you play (if any)?",
  "What kind of cushioning or support do you prefer?",
  "What colors and styles do you love?",
  "Are you looking for lightweight speed or maximum durability?",
  "What's your go-to price range?",
  "How do you like your shoes to fit — snug, roomy, or just right?",
  "Are you on your feet all day or just for short bursts?",
  "Want something low-key or something that turns heads?"
];

export default function KicksFinder() {
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [step, setStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sneakers, setSneakers] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("All");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAnswers = [...answers];
    newAnswers[step] = e.target.value;
    setAnswers(newAnswers);
  };

  const queryString = () =>
    answers
      .map((answer, i) => `${questions[i].split("?")[0]}: ${answer}`)
      .join(" | ");

  const next = async () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setLoading(true);
      const query = queryString();

      try {
        const res = await fetch("/api/search-sneakers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query })
        });
        const data = await res.json();
        setSneakers(data.sneakers || []);
      } catch (err) {
        console.error("Search error:", err);
        setSneakers([]);
      } finally {
        setLoading(false);
        setShowResults(true);
      }
    }
  };

  const brands = ["All", "Nike", "Adidas", "Way of Wade", "WearTesters"];
  const filteredSneakers =
    selectedBrand === "All"
      ? sneakers
      : sneakers.filter((s) => s.brand === selectedBrand);

  return (
    <div className="min-h-screen p-8 bg-gray-100 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl space-y-6"
      >
        {!showResults ? (
          <div className="p-6 shadow-xl bg-white rounded-2xl">
            {loading ? (
              <div className="text-center py-10 text-gray-600">
                Searching WearTesters, Nike, Adidas, Way of Wade...
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-4">{questions[step]}</h2>
                <input
                  value={answers[step]}
                  onChange={handleChange}
                  placeholder="Type your answer..."
                  className="mb-4 w-full p-2 rounded border"
                />
                <button
                  onClick={next}
                  className="w-full bg-black text-white p-2 rounded flex items-center justify-center gap-2"
                >
                  {step === questions.length - 1 ? <Search size={18} /> : <Check size={18} />}
                  {step === questions.length - 1 ? "Find My Kicks" : "Next"}
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="p-4 bg-white shadow rounded-2xl">
              <h3 className="text-lg font-semibold">Your Sneaker Preferences</h3>
              {answers.map((a, i) => (
                <p key={i} className="text-sm text-gray-700">
                  {questions[i]} <span className="font-medium">{a}</span>
                </p>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-4 py-1 border rounded-full ${
                    selectedBrand === brand
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSneakers.map((sneaker, i) => (
                <div key={i} className="p-4 bg-white rounded-2xl shadow-md">
                  <h3 className="text-lg font-bold">{sneaker.name}</h3>
                  {sneaker.image && (
                    <img
                      src={sneaker.image}
                      alt={sneaker.name}
                      className="rounded-xl w-full h-52 object-cover"
                    />
                  )}
                  <p className="text-sm">Brand: {sneaker.brand}</p>
                  <p className="text-sm">Performance: {sneaker.performance}</p>
                  <p className="text-sm">Support: {sneaker.support}</p>
                  <p className="text-sm">Style: {sneaker.style}</p>
                  <a
                    href={sneaker.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block mt-2"
                  >
                    View Review or Buy
                  </a>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
