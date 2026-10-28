"use client";

import React, { useState } from "react";
import { formatINR, calculateWeightedValue } from "@/lib/calculations";
import { APPROVED_CATALOGUE } from "@/lib/catalog";

export interface OpportunityRecord {
  id: number;
  customer: string;
  product: string;
  industry: string;
  contactPerson: string;
  phone: string;
  city: string;
  salesStage: string;
  estimatedValue: number;
  probability: number;
  expectedSeats: number;
  expectedCloseDate: string;
  assignedEmployee: string;
  leadDate: string;
  remarks: string;
}

interface OpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (opportunity: OpportunityRecord) => void;
  customers: { companyName: string }[];
}

export function OpportunityModal({ isOpen, onClose, onSave, customers }: OpportunityModalProps) {
  const [customer, setCustomer] = useState(customers[0]?.companyName || "NAMAN TECHNOLOGIES");
  const [product, setProduct] = useState("Fusion 360");
  const [salesStage, setSalesStage] = useState("Proposal");
  const [estimatedValue, setEstimatedValue] = useState<number>(140000);
  const [probability, setProbability] = useState<number>(75);
  const [expectedSeats, setExpectedSeats] = useState<number>(2);
  const [expectedCloseDate, setExpectedCloseDate] = useState("2026-12-15");
  const [assignedEmployee, setAssignedEmployee] = useState("Harshith S");
  const [remarks, setRemarks] = useState("Technical evaluation and machining benchmark proposal.");

  if (!isOpen) return null;

  const weighted = calculateWeightedValue(estimatedValue, probability);

  const handleSave = () => {
    if (onSave) {
      onSave({
        id: Date.now(),
        customer,
        product,
        industry: "Manufacturing",
        contactPerson: "Primary Contact",
        phone: "+91 98450 00000",
        city: "Bengaluru",
        salesStage,
        estimatedValue,
        probability,
        expectedSeats,
        expectedCloseDate,
        assignedEmployee,
        leadDate: new Date().toISOString().split("T")[0],
        remarks,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-2xl shadow-2xl text-slate-100 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">Sales Pipeline</span>
            <h2 className="text-xl font-bold tracking-tight text-white">Create New Deal Opportunity</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs text-slate-400 block mb-1">Customer / Account *</label>
            <input
              type="text"
              list="customerList"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              placeholder="Search or enter customer..."
            />
            <datalist id="customerList">
              {customers.map((c, i) => (
                <option key={i} value={c.companyName} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Product Interested</label>
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              {APPROVED_CATALOGUE.map((p) => (
                <option key={p.id} value={p.productName}>
                  {p.productName} ({formatINR(p.standardPrice)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Sales Stage</label>
            <select
              value={salesStage}
              onChange={(e) => setSalesStage(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="Lead">Lead</option>
              <option value="Qualification">Qualification</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Won">Won (Closed Deal)</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Estimated Value (INR)</label>
            <input
              type="number"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Probability (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={probability}
              onChange={(e) => setProbability(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Expected Seats</label>
            <input
              type="number"
              value={expectedSeats}
              onChange={(e) => setExpectedSeats(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Expected Close Date</label>
            <input
              type="date"
              value={expectedCloseDate}
              onChange={(e) => setExpectedCloseDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-slate-400 block mb-1">Assigned Sales Engineer</label>
            <input
              type="text"
              value={assignedEmployee}
              onChange={(e) => setAssignedEmployee(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              placeholder="e.g. Harshith S"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-slate-400 block mb-1">Opportunity Notes & Next Action</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Weighted Forecast Value:</span>
            <p className="text-lg font-bold text-emerald-400">{formatINR(weighted)}</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            {probability}% Win Probability
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 transition"
          >
            Create Opportunity
          </button>
        </div>
      </div>
    </div>
  );
}
