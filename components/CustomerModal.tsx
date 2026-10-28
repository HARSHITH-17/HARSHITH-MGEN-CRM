"use client";

import React, { useState } from "react";
import { validateGstin } from "@/lib/calculations";
import { APPROVED_CATALOGUE } from "@/lib/catalog";

export interface CustomerRecord {
  id: number;
  customerCode: string;
  companyName: string;
  customerType: string;
  industry: string;
  contactName: string;
  contactDesignation: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  gstNumber: string;
  productsUsed: string;
  annualBusinessPotential: number;
  priority: string;
  status: string;
  customerRating: number;
  renewalDate: string;
  assignedSalesEngineer: string;
  assignedTechnicalEngineer: string;
}

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (customer: CustomerRecord) => void;
  initialData?: CustomerRecord;
}

export function CustomerModal({ isOpen, onClose, onSave, initialData }: CustomerModalProps) {
  const [companyName, setCompanyName] = useState(initialData?.companyName || "");
  const [customerCode, setCustomerCode] = useState(initialData?.customerCode || "CUST-0099");
  const [customerType, setCustomerType] = useState(initialData?.customerType || "Commercial");
  const [industry, setIndustry] = useState(initialData?.industry || "Manufacturing & Aerospace");
  const [contactName, setContactName] = useState(initialData?.contactName || "");
  const [contactDesignation, setContactDesignation] = useState(initialData?.contactDesignation || "Manager");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [city, setCity] = useState(initialData?.city || "Bengaluru");
  const [state, setState] = useState(initialData?.state || "Karnataka");
  const [gstNumber, setGstNumber] = useState(initialData?.gstNumber || "");
  const [gstError, setGstError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    initialData?.productsUsed ? initialData.productsUsed.split(", ") : ["Fusion 360"]
  );
  const [potential, setPotential] = useState<number>(initialData?.annualBusinessPotential || 500000);
  const [priority, setPriority] = useState(initialData?.priority || "High");
  const [status, setStatus] = useState(initialData?.status || "Active");
  const [renewalDate, setRenewalDate] = useState(initialData?.renewalDate || "2027-03-31");

  if (!isOpen) return null;

  const handleGstBlur = () => {
    if (!gstNumber) {
      setGstError(null);
      return;
    }
    const result = validateGstin(gstNumber);
    if (!result.valid) {
      setGstError(result.error || "Invalid GST format");
    } else {
      setGstError(null);
      setGstNumber(result.formatted);
    }
  };

  const toggleProduct = (prod: string) => {
    if (selectedProducts.includes(prod)) {
      setSelectedProducts(selectedProducts.filter((p) => p !== prod));
    } else {
      setSelectedProducts([...selectedProducts, prod]);
    }
  };

  const handleSave = () => {
    if (!companyName.trim()) {
      alert("Company Name is required.");
      return;
    }
    if (gstNumber) {
      const res = validateGstin(gstNumber);
      if (!res.valid) {
        setGstError(res.error || "Invalid GST");
        return;
      }
    }

    if (onSave) {
      onSave({
        id: initialData?.id || Date.now(),
        customerCode,
        companyName,
        customerType,
        industry,
        contactName,
        contactDesignation,
        phone,
        email,
        city,
        state,
        gstNumber,
        productsUsed: selectedProducts.join(", "),
        annualBusinessPotential: potential,
        priority,
        status,
        customerRating: 4.5,
        renewalDate,
        assignedSalesEngineer: "Harshith S",
        assignedTechnicalEngineer: "Kiran Kumar",
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-3xl shadow-2xl text-slate-100 p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-blue-400">Customer 360 Master</span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              {initialData ? "Edit Customer Record" : "Add New Customer Account"}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Company / Account Name *</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. NAMAN TECHNOLOGIES"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Customer Code</label>
            <input
              type="text"
              value={customerCode}
              onChange={(e) => setCustomerCode(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Customer Type</label>
            <select
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="Enterprise">Enterprise</option>
              <option value="SME">SME</option>
              <option value="Commercial">Commercial</option>
              <option value="Tier 1 Supplier">Tier 1 Supplier</option>
              <option value="Defence & Aerospace">Defence & Aerospace</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="Manufacturing & Aerospace">Manufacturing & Aerospace</option>
              <option value="Tool & Die Making">Tool & Die Making</option>
              <option value="Automotive">Automotive</option>
              <option value="Die Casting & Forging">Die Casting & Forging</option>
              <option value="Aerospace Machining">Aerospace Machining</option>
              <option value="General Precision Machining">General Precision Machining</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Primary Contact Person</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Designation</label>
            <input
              type="text"
              value={contactDesignation}
              onChange={(e) => setContactDesignation(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Contact Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              placeholder="+91 98450 11223"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Contact Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              placeholder="contact@company.com"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">State</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-slate-400 block mb-1">
              GSTIN (15-Character Tax ID)
            </label>
            <input
              type="text"
              value={gstNumber}
              onChange={(e) => {
                setGstNumber(e.target.value.toUpperCase());
                if (gstError) setGstError(null);
              }}
              onBlur={handleGstBlur}
              className={`w-full bg-slate-800 border ${
                gstError ? "border-rose-500 focus:ring-rose-500" : "border-slate-700 focus:ring-blue-500"
              } rounded-lg px-3 py-2 text-sm text-white uppercase font-mono`}
              placeholder="29AABCN1234F1Z5"
            />
            {gstError && <p className="text-rose-400 text-xs mt-1">{gstError}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-slate-400 block mb-1">
              Products Used (Select from Approved Autodesk Catalogue)
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-slate-950/60 border border-slate-800 rounded-lg">
              {APPROVED_CATALOGUE.map((p) => {
                const isSelected = selectedProducts.includes(p.productName);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProduct(p.productName)}
                    className={`text-xs px-2.5 py-1 rounded-md transition border ${
                      isSelected
                        ? "bg-blue-600/30 border-blue-500 text-blue-200"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    {p.productName}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Account Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Standard">Standard</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Account Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="Active">Active</option>
              <option value="Prospect">Prospect</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Annual Business Potential (INR)</label>
            <input
              type="number"
              value={potential}
              onChange={(e) => setPotential(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Support Renewal Date</label>
            <input
              type="date"
              value={renewalDate}
              onChange={(e) => setRenewalDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition"
          >
            Save Customer Record
          </button>
        </div>
      </div>
    </div>
  );
}
