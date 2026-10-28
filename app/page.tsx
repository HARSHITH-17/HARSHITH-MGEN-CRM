"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  IconDashboard,
  IconUsers,
  IconPipeline,
  IconSupport,
  IconTour,
  IconRevenue,
  IconProductMaster,
  IconTraining,
  IconDemo,
  IconImportExport,
  IconSearch,
  IconCalculator,
  IconCheck,
} from "@/components/Icons";
import { formatINR } from "@/lib/calculations";
import {
  SEED_CUSTOMERS,
  SEED_PIPELINE,
  SEED_SUPPORT,
  SEED_TOURS,
  APPROVED_CATALOGUE,
} from "@/lib/data-provider";
import { TourCalculatorModal } from "@/components/TourCalculatorModal";
import { CustomerModal } from "@/components/CustomerModal";
import { OpportunityModal } from "@/components/OpportunityModal";
import { ImportModal } from "@/components/ImportModal";

type ActiveTab =
  | "dashboard"
  | "customers"
  | "pipeline"
  | "support"
  | "tours"
  | "catalog"
  | "demos_revenue";

export default function CRMDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  // Live state with seed defaults
  const [customers, setCustomers] = useState(SEED_CUSTOMERS);
  const [pipeline, setPipeline] = useState(SEED_PIPELINE);
  const [support] = useState(SEED_SUPPORT);
  const [tours, setTours] = useState(SEED_TOURS);

  // Modals state
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Metrics calculation
  const totalPipelineVal = useMemo(
    () => pipeline.reduce((sum, item) => sum + (item.estimatedValue || 0), 0),
    [pipeline]
  );
  const weightedPipelineVal = useMemo(
    () =>
      pipeline.reduce(
        (sum, item) => sum + ((item.estimatedValue || 0) * ((item.probability || 0) / 100)),
        0
      ),
    [pipeline]
  );
  const openTicketsCount = useMemo(
    () => support.filter((s) => s.status !== "Resolved").length,
    [support]
  );
  const totalTourExpenses = useMemo(
    () => tours.reduce((sum, t) => sum + (t.totalExpenses || 0), 0),
    [tours]
  );

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.companyName.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        (c.contactName && c.contactName.toLowerCase().includes(q)) ||
        (c.productsUsed && c.productsUsed.toLowerCase().includes(q))
    );
  }, [customers, searchQuery]);

  // Filtered pipeline
  const filteredPipeline = useMemo(() => {
    if (!searchQuery.trim()) return pipeline;
    const q = searchQuery.toLowerCase();
    return pipeline.filter(
      (p) =>
        p.customer.toLowerCase().includes(q) ||
        p.product.toLowerCase().includes(q) ||
        p.salesStage.toLowerCase().includes(q)
    );
  }, [pipeline, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-blue-500 selection:text-white">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 font-black text-white text-base">
              M
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                HARSHITH MGEN
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-sm bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  PRO
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Enterprise CAD/CAM CRM</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 flex-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "dashboard"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <IconDashboard className="w-4 h-4" />
            Executive Overview
          </button>

          <button
            onClick={() => setActiveTab("customers")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "customers"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <div className="flex items-center gap-3">
              <IconUsers className="w-4 h-4" />
              Customer 360
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {customers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("pipeline")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "pipeline"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <div className="flex items-center gap-3">
              <IconPipeline className="w-4 h-4" />
              Sales Pipeline
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
              {pipeline.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("support")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "support"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <div className="flex items-center gap-3">
              <IconSupport className="w-4 h-4" />
              Support & SLA
            </div>
            {openTicketsCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800">
                {openTicketsCount} open
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("tours")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "tours"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <div className="flex items-center gap-3">
              <IconTour className="w-4 h-4" />
              Tour Claims (DA ₹750)
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800">
              {tours.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("catalog")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "catalog"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <IconProductMaster className="w-4 h-4" />
            Autodesk Catalogue
          </button>

          <button
            onClick={() => setActiveTab("demos_revenue")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "demos_revenue"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <IconRevenue className="w-4 h-4" />
            Demos & Financials
          </button>
        </nav>

        {/* Database Status & Quick Importer */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-400">Database Engine</span>
              <span className="flex items-center gap-1 font-semibold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                PostgreSQL / Prisma
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              Schema verified with duplicate protection & safe transaction ledger.
            </p>
          </div>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition border border-slate-700/60"
          >
            <IconImportExport className="w-4 h-4 text-blue-400" />
            Import Excel / SQLite
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers, opportunities, contacts, products..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsTourModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-medium transition"
            >
              <IconCalculator className="w-3.5 h-3.5" />
              Tour Calculator
            </button>

            <button
              onClick={() => setIsOpportunityModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition"
            >
              + Opportunity
            </button>

            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition"
            >
              + Add Customer
            </button>

            <div className="h-6 w-px bg-slate-800 mx-1"></div>

            <Link
              href="/login"
              className="flex items-center gap-2 pl-1 p-1 rounded-lg hover:bg-slate-800 transition"
              title="Admin Login & Password Recovery"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400">
                HR
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-white leading-none">Harshith S</p>
                <p className="text-[10px] text-slate-400 leading-none mt-0.5">Admin & Sales Lead</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Content Body by Tab */}
        <div className="p-6 md:p-8 space-y-6 flex-1">
          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Top KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Active Customer Base
                    </span>
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                      <IconUsers className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-white">{customers.length} Accounts</h3>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2 font-medium">
                    <span>↑ 100% verified</span>
                    <span className="text-slate-500">• 59 synced contacts</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Gross Pipeline Value
                    </span>
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <IconPipeline className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-white">{formatINR(totalPipelineVal)}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 font-medium">
                    <span>Weighted Forecast:</span>
                    <strong className="text-emerald-400">{formatINR(weightedPipelineVal)}</strong>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Support SLA Status
                    </span>
                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                      <IconSupport className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-white">{openTicketsCount} Active Tickets</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 font-medium">
                    <span className="text-emerald-400">1.2 days avg turnaround</span>
                    <span className="text-slate-500">• 116 logged</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Approved Tour Claims
                    </span>
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                      <IconTour className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-white">{formatINR(totalTourExpenses)}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 mt-2 font-medium">
                    <span>Daily Allowance ₹750/day</span>
                    <span className="text-slate-500">• 2 approved</span>
                  </div>
                </div>
              </div>

              {/* Grid: Pipeline Stages Funnel & Quick Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pipeline Funnel */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-white">Sales Pipeline Distribution</h3>
                      <p className="text-xs text-slate-400">Active opportunities mapped by sales progression stage</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("pipeline")}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition"
                    >
                      View All Leads →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {pipeline.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white">{item.customer}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                item.salesStage === "Won"
                                  ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                                  : item.salesStage === "Proposal"
                                  ? "bg-blue-950 text-blue-300 border-blue-800"
                                  : item.salesStage === "Negotiation"
                                  ? "bg-purple-950 text-purple-300 border-purple-800"
                                  : "bg-slate-800 text-slate-300 border-slate-700"
                              }`}
                            >
                              {item.salesStage}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            {item.product} • {item.expectedSeats} seat(s) • Close: {item.expectedCloseDate}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">{formatINR(item.estimatedValue)}</p>
                          <p className="text-[11px] text-emerald-400 font-medium">
                            {item.probability}% Win Probability ({formatINR(item.estimatedValue * (item.probability / 100))})
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Side: Autodesk Catalog Spotlight & Tour Rule */}
                <div className="space-y-6">
                  {/* Autodesk Solutions Highlights */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        <IconProductMaster className="w-4 h-4 text-blue-400" />
                        Autodesk 17-Product Catalog
                      </h3>
                      <button
                        onClick={() => setActiveTab("catalog")}
                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        All Products →
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {APPROVED_CATALOGUE.slice(0, 5).map((p) => (
                        <div key={p.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-850">
                          <div>
                            <span className="font-medium text-slate-200 block">{p.productName}</span>
                            <span className="text-[10px] text-slate-500">{p.category}</span>
                          </div>
                          <span className="font-bold text-slate-100">{formatINR(p.standardPrice)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Policy Engine Badge */}
                  <div className="bg-gradient-to-br from-amber-500/10 to-indigo-500/10 border border-amber-500/20 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center gap-2">
                      <IconCalculator className="w-5 h-5 text-amber-400" />
                      <h4 className="font-bold text-xs uppercase tracking-wider text-amber-300">Deterministic Calculations</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Daily Allowance (DA) is strictly applied at <strong>₹750/day</strong>. Tours &le;12h remainder receive a half-day allowance; &gt;12h receives full-day reimbursement.
                    </p>
                    <button
                      onClick={() => setIsTourModalOpen(true)}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4"
                    >
                      Open Live Tour Calculation Engine →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOMER 360 */}
          {activeTab === "customers" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Customer 360 Accounts Master</h2>
                  <p className="text-xs text-slate-400">
                    Comprehensive accounts database with verified GSTIN, primary/secondary contacts, and Autodesk software stack.
                  </p>
                </div>
                <button
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition self-start sm:self-auto"
                >
                  + Add Customer Account
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="text-[11px] uppercase font-bold text-slate-400 bg-slate-950/70 border-y border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Customer Code</th>
                      <th className="py-3 px-4">Company Name</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">GST Number</th>
                      <th className="py-3 px-4">Primary Contact</th>
                      <th className="py-3 px-4">Products Used</th>
                      <th className="py-3 px-4 text-right">Potential (INR)</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-mono text-blue-400 font-medium">{c.customerCode}</td>
                        <td className="py-3.5 px-4 font-bold text-white">{c.companyName}</td>
                        <td className="py-3.5 px-4 text-slate-400">{c.city}, {c.state}</td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                          {c.gstNumber ? (
                            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                              <IconCheck className="w-3.5 h-3.5" />
                              {c.gstNumber}
                            </span>
                          ) : (
                            <span className="text-slate-500">Unspecified</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-200">{c.contactName}</p>
                          <p className="text-[10px] text-slate-400">{c.phone || c.email}</p>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-slate-300" title={c.productsUsed}>
                          {c.productsUsed}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-white">
                          {formatINR(c.annualBusinessPotential)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SALES PIPELINE */}
          {activeTab === "pipeline" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Sales Pipeline & Opportunity Forecast</h2>
                  <p className="text-xs text-slate-400">
                    Gross Pipeline: <strong className="text-white">{formatINR(totalPipelineVal)}</strong> • Weighted
                    Revenue Forecast: <strong className="text-emerald-400">{formatINR(weightedPipelineVal)}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setIsOpportunityModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition self-start sm:self-auto"
                >
                  + Add Opportunity
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="text-[11px] uppercase font-bold text-slate-400 bg-slate-950/70 border-y border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Customer Account</th>
                      <th className="py-3 px-4">Product Solution</th>
                      <th className="py-3 px-4">Sales Stage</th>
                      <th className="py-3 px-4 text-right">Estimated Value</th>
                      <th className="py-3 px-4 text-center">Win %</th>
                      <th className="py-3 px-4 text-right">Weighted Forecast</th>
                      <th className="py-3 px-4">Expected Close</th>
                      <th className="py-3 px-4">Owner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {filteredPipeline.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-bold text-white">{p.customer}</td>
                        <td className="py-3.5 px-4 text-slate-300">{p.product}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              p.salesStage === "Won"
                                ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                                : p.salesStage === "Proposal"
                                ? "bg-blue-950 text-blue-300 border-blue-800"
                                : p.salesStage === "Negotiation"
                                ? "bg-purple-950 text-purple-300 border-purple-800"
                                : "bg-slate-800 text-slate-300 border-slate-700"
                            }`}
                          >
                            {p.salesStage}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-white">{formatINR(p.estimatedValue)}</td>
                        <td className="py-3.5 px-4 text-center font-mono text-emerald-400 font-bold">{p.probability}%</td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                          {formatINR(p.estimatedValue * (p.probability / 100))}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">{p.expectedCloseDate}</td>
                        <td className="py-3.5 px-4 text-slate-300 font-medium">{p.assignedEmployee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SUPPORT DESK */}
          {activeTab === "support" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Technical Support Desk & Kinematics Resolution</h2>
                  <p className="text-xs text-slate-400">Mazak 5-axis post-processors, Vault replication, and CAM toolpath troubleshooting.</p>
                </div>
              </div>

              <div className="space-y-3">
                {support.map((t) => (
                  <div key={t.id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{t.customer}</span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {t.product}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md border font-semibold ${
                            t.priority === "High"
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          t.status === "Resolved"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">{t.issue}</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-850">
                      <span>Assigned to: <strong className="text-slate-300">{t.assignedEmployee}</strong> • {t.activityType}</span>
                      <span>Hours spent: <strong className="text-white">{t.hoursSpent}h</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: TOUR MANAGEMENT */}
          {activeTab === "tours" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Employee Tour Management & Claims Ledger</h2>
                  <p className="text-xs text-slate-400">
                    Calculated with strict policy: ₹750/day DA, 12-hour cutoff rule, office lodging exclusions, and advance adjustments.
                  </p>
                </div>
                <button
                  onClick={() => setIsTourModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition self-start sm:self-auto"
                >
                  + New Tour Claim
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tours.map((tour) => (
                  <div key={tour.id} className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4 hover:border-slate-750 transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-base text-white">{tour.employeeName}</h4>
                        <p className="text-xs text-slate-400">{tour.branch} • {tour.group}</p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {tour.placesToured}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center bg-slate-900/80 p-3 rounded-lg border border-slate-850">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Duration</span>
                        <span className="font-bold text-xs text-white">{tour.tourDurationHours} hrs</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">DA Days</span>
                        <span className="font-bold text-xs text-amber-400">{tour.daDays} days</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Computed DA</span>
                        <span className="font-bold text-xs text-emerald-400">{formatINR(tour.daAmount)}</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Total Tour Expenses:</span>
                        <strong className="text-white">{formatINR(tour.totalExpenses)}</strong>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Advance Received:</span>
                        <span className="text-slate-300">{formatINR(tour.advanceReceived)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 font-semibold pt-1 border-t border-slate-850">
                        <span className="text-emerald-400">Due to Employee:</span>
                        <span className="text-emerald-400 font-bold">{formatINR(tour.dueToSelf)}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 italic bg-slate-900 p-2 rounded-md">
                      &quot;{tour.remarks}&quot;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: AUTODESK CATALOGUE */}
          {activeTab === "catalog" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Autodesk 17-Product Standard Catalog</h2>
                  <p className="text-xs text-slate-400">
                    Official enterprise commercial catalogue with standard INR pricing, category mapping, and licensing tiers.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {APPROVED_CATALOGUE.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {p.category}
                        </span>
                        <span className="text-xs font-semibold text-emerald-400">Active</span>
                      </div>
                      <h4 className="font-bold text-sm text-white pt-2">{p.productName}</h4>
                      <p className="text-xs text-slate-400">{p.versionPlan}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-850 mt-4 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Standard Price:</span>
                      <span className="text-base font-bold text-white">{formatINR(p.standardPrice)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: DEMOS & REVENUE */}
          {activeTab === "demos_revenue" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white">Product Demonstrations & Revenue Tracking</h2>
                <p className="text-xs text-slate-400">12 scheduled demos, 8 completed training workshops, and verified invoice transactions.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <IconDemo className="w-4 h-4 text-emerald-400" />
                      Benchmarked Product Demos
                    </h4>
                    <span className="text-xs text-emerald-400 font-semibold">12 Completed</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-850 flex justify-between items-center">
                      <span>NAMAN TECHNOLOGIES - 5-Axis Cut Trial</span>
                      <strong className="text-emerald-400">Deal Closed (Won)</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-850 flex justify-between items-center">
                      <span>ZENITH AUTO - Moldflow Fill Analysis</span>
                      <strong className="text-blue-400">PO Pending</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-850 flex justify-between items-center">
                      <span>AEROSTRUCTURES - Netfabb Metal Slicing</span>
                      <strong className="text-purple-400">Technical Passed</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <IconTraining className="w-4 h-4 text-blue-400" />
                      Training Workshops & Ratings
                    </h4>
                    <span className="text-xs text-blue-400 font-semibold">8 Sessions (Rating 4.9)</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-850 flex justify-between items-center">
                      <span>PowerMill 5-Axis Advanced Milling</span>
                      <span className="text-amber-400 font-bold">★ 5.0 (6 participants)</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-850 flex justify-between items-center">
                      <span>FeatureCAM Turn-Mill Automation</span>
                      <span className="text-amber-400 font-bold">★ 4.8 (4 participants)</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-850 flex justify-between items-center">
                      <span>Vault Professional Admin Setup</span>
                      <span className="text-amber-400 font-bold">★ 4.9 (3 participants)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Interactive Modals */}
      <TourCalculatorModal
        isOpen={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
        onSave={(data) => {
          setTours([data, ...tours]);
        }}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={(newCust) => {
          setCustomers([newCust, ...customers]);
        }}
      />

      <OpportunityModal
        isOpen={isOpportunityModalOpen}
        onClose={() => setIsOpportunityModalOpen(false)}
        customers={customers}
        onSave={(newOpp) => {
          setPipeline([newOpp, ...pipeline]);
        }}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}
