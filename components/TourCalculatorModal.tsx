"use client";

import React, { useState, useMemo } from "react";
import { calculateTourExpenses, formatINR, TourExpenseResult } from "@/lib/calculations";

export interface TourClaimRecord extends TourExpenseResult {
  id: number;
  employeeName: string;
  branch: string;
  group: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  tourStartDate: string;
  tourStartTime: string;
  tourEndDate: string;
  tourEndTime: string;
  placesToured: string;
  customerVisited: string;
  companyCustomerVisited: string;
  travelExpenses: number;
  lodgingRatePerDay: number;
  lodgingDays: number;
  lodgingBookedByOffice: string;
  conveyanceExpenses: number;
  otherExpenses: number;
  advanceReceived: number;
  tourDurationHours: number;
  authorisedBy: string;
  remarks: string;
}

interface TourCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: TourClaimRecord) => void;
}

export function TourCalculatorModal({ isOpen, onClose, onSave }: TourCalculatorModalProps) {
  const [employeeName, setEmployeeName] = useState("Harshith S");
  const [branch, setBranch] = useState("Bengaluru HQ");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("08:00");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [endTime, setEndTime] = useState("20:00");
  const [placesToured, setPlacesToured] = useState("Pune MIDC, Bhosari");
  const [customerVisited, setCustomerVisited] = useState("Precision Toolings & Dies");

  const [travelExpenses, setTravelExpenses] = useState<number>(3500);
  const [lodgingRatePerDay, setLodgingRatePerDay] = useState<number>(1800);
  const [lodgingDays, setLodgingDays] = useState<number>(1);
  const [lodgingBookedByOffice, setLodgingBookedByOffice] = useState<boolean>(false);
  const [conveyanceExpenses, setConveyanceExpenses] = useState<number>(850);
  const [otherExpenses, setOtherExpenses] = useState<number>(250);
  const [daRatePerDay, setDaRatePerDay] = useState<number>(750);
  const [advanceReceived, setAdvanceReceived] = useState<number>(8000);

  const calc = useMemo(() => {
    return calculateTourExpenses({
      startDate,
      startTime,
      endDate,
      endTime,
      daRatePerDay,
      travelExpenses,
      lodgingRatePerDay,
      lodgingDays,
      lodgingBookedByOffice,
      conveyanceExpenses,
      otherExpenses,
      advanceReceived,
    });
  }, [
    startDate,
    startTime,
    endDate,
    endTime,
    daRatePerDay,
    travelExpenses,
    lodgingRatePerDay,
    lodgingDays,
    lodgingBookedByOffice,
    conveyanceExpenses,
    otherExpenses,
    advanceReceived,
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-4xl shadow-2xl text-slate-100 p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">HARSHITH MGEN CRM Policy Engine</span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Tour Expense & Daily Allowance (DA) Calculator</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Tour Inputs */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Tour Details & Timing</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Employee Name</label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Branch</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Places Toured</label>
              <input
                type="text"
                value={placesToured}
                onChange={(e) => setPlacesToured(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Customer / Company Visited</label>
              <input
                type="text"
                value={customerVisited}
                onChange={(e) => setCustomerVisited(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          {/* Right Column: Expenses */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Expense Itemization (INR)</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Travel (Train/Flight/Bus)</label>
                <input
                  type="number"
                  value={travelExpenses}
                  onChange={(e) => setTravelExpenses(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Local Conveyance</label>
                <input
                  type="number"
                  value={conveyanceExpenses}
                  onChange={(e) => setConveyanceExpenses(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Lodging Rate / Day</label>
                <input
                  type="number"
                  disabled={lodgingBookedByOffice}
                  value={lodgingRatePerDay}
                  onChange={(e) => setLodgingRatePerDay(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Lodging Days</label>
                <input
                  type="number"
                  disabled={lodgingBookedByOffice}
                  value={lodgingDays}
                  onChange={(e) => setLodgingDays(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="officeLodging"
                checked={lodgingBookedByOffice}
                onChange={(e) => setLodgingBookedByOffice(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700"
              />
              <label htmlFor="officeLodging" className="text-xs text-slate-300">
                Lodging Booked Directly by Office (No employee reimbursement)
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Daily Allowance (DA) Rate</label>
                <input
                  type="number"
                  value={daRatePerDay}
                  onChange={(e) => setDaRatePerDay(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Advance Received</label>
                <input
                  type="number"
                  value={advanceReceived}
                  onChange={(e) => setAdvanceReceived(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Other Incidental Expenses</label>
              <input
                type="number"
                value={otherExpenses}
                onChange={(e) => setOtherExpenses(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          </div>
        </div>

        {/* Calculated Result Cards */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-slate-400">Tour Duration</span>
            <p className="text-lg font-bold text-white">{calc.durationHours} hrs</p>
            <span className="text-[11px] text-slate-500">
              DA Days: <strong className="text-amber-400">{calc.daDays} days</strong> ({daRatePerDay}/day)
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400">Total DA Computed</span>
            <p className="text-lg font-bold text-emerald-400">{formatINR(calc.daAmount)}</p>
            <span className="text-[11px] text-slate-500">Policy: &le;12h = 0.5d, &gt;12h = 1d</span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400">Gross Tour Expenses</span>
            <p className="text-lg font-bold text-sky-400">{formatINR(calc.totalExpenses)}</p>
            <span className="text-[11px] text-slate-500">Advance: {formatINR(advanceReceived)}</span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400">
              {calc.dueToSelf > 0 ? "Reimbursement Due" : "Advance Refund Due"}
            </span>
            <p
              className={`text-xl font-black ${
                calc.dueToSelf > 0 ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {calc.dueToSelf > 0 ? formatINR(calc.dueToSelf) : formatINR(calc.refund)}
            </p>
            <span className="text-[11px] text-slate-500">
              {calc.dueToSelf > 0 ? "Pay to employee" : "Refund to company"}
            </span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (onSave) {
                onSave({
                  id: Date.now(),
                  employeeName,
                  branch,
                  group: "CAM Technical Sales",
                  startDate,
                  startTime,
                  endDate,
                  endTime,
                  tourStartDate: startDate,
                  tourStartTime: startTime,
                  tourEndDate: endDate,
                  tourEndTime: endTime,
                  placesToured,
                  customerVisited,
                  companyCustomerVisited: customerVisited,
                  travelExpenses,
                  lodgingRatePerDay,
                  lodgingDays,
                  lodgingBookedByOffice: lodgingBookedByOffice ? "Yes" : "No",
                  conveyanceExpenses,
                  otherExpenses,
                  advanceReceived,
                  tourDurationHours: calc.durationHours,
                  authorisedBy: "Pending Review",
                  remarks: "Submitted via HARSHITH MGEN CRM Web Portal",
                  ...calc,
                });
              }
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition"
          >
            Save & Submit Tour Claim
          </button>
        </div>
      </div>
    </div>
  );
}
