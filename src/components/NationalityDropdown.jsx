import { useState, useRef, useEffect } from "react";

const countries = [
  "Afghanistan",
  "Australia",
  "Bangladesh",
  "Canada",
  "China",
  "France",
  "Germany",
  "India",
  "Italy",
  "Japan",
  "Malaysia",
  "New Zealand",
  "Pakistan",
  "Singapore",
  "Sri Lanka",
  "United Kingdom",
  "United States",
];

export default function NationalityDropdown({ formData, setFormData }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-gray-900 font-bold mb-2">
        Select your nationality as shown on the passport you will be travelling on{" "}
        <span className="text-red-600">*</span>
      </label>

      {/* Selected value */}
      <div
        onClick={() => setOpen(!open)}
        className="
          w-full bg-white px-4 py-2 border border-gray-400 font-bold
          cursor-pointer flex justify-between items-center
          focus:outline-none
        "
      >
        <span className={formData.nationality ? "text-gray-900" : "text-gray-400"}>
          {formData.nationality || "Select your nationality"}
        </span>
        <span className="text-gray-600">▾</span>
      </div>

      {/* Dropdown list */}
      {open && (
        <ul
          className="
            absolute z-50 mt-1 w-full max-h-60 overflow-y-auto
            bg-white border border-gray-400
          "
        >
          {countries.map((country) => (
            <li
              key={country}
              onClick={() => {
                setFormData({ ...formData, nationality: country });
                setOpen(false);
              }}
              className="
                px-4 py-2 cursor-pointer font-bold
                hover:bg-red-600 hover:text-white
              "
            >
              {country}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
