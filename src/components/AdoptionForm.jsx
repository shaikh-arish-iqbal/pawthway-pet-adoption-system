import React from "react";

export default function AdoptionForm({ pet }) {
  return (
    <form className="mt-6 bg-[#FFFFFC] p-6 border border-[#BEB7A4] rounded-lg shadow">
      <h2 className="text-2xl font-bold text-[#FF1B1C] mb-4">
        Apply to adopt {pet.name}
      </h2>

      <input
        type="text"
        placeholder="Your Name"
        required
        className="w-full mb-4 p-3 border border-[#BEB7A4] rounded"
      />
      <input
        type="email"
        placeholder="Email Address"
        required
        className="w-full mb-4 p-3 border border-[#BEB7A4] rounded"
      />
      <textarea
        placeholder="Why do you want to adopt?"
        required
        className="w-full mb-4 p-3 border border-[#BEB7A4] rounded"
        rows="4"
      />

      <button
        type="submit"
        className="bg-[#FF7F11] text-[#FFFFFC] px-6 py-3 rounded hover:bg-[#FF1B1C] transition"
      >
        Submit Application
      </button>
    </form>
  );
}
