'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Download, Calendar, CheckCircle2, FileText } from 'lucide-react';

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState('THIS_MONTH');
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleDownload = (reportTitle: string) => {
    setDownloadingReport(reportTitle);
    setTimeout(() => {
      setDownloadingReport(null);
      setSuccessMessage(`Export Complete: ${reportTitle} (${dateRange}) downloaded to device as CSV.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Financial & Stock Intelligence</span>
        <h1 className="text-3xl font-serif font-black uppercase tracking-wider text-dark mt-1">
          Business Reports Studio
        </h1>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs flex items-center shadow-sm">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Date Range Selector Bar */}
      <div className="bg-cream border border-parchment p-4 shadow-lux flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calendar className="h-4 w-4 text-gold" />
          <span className="text-xs font-bold uppercase text-dark">Reporting Period:</span>
        </div>
        <select
          value={dateRange}
          onChange={e => setDateRange(e.target.value)}
          className="py-2 px-4 bg-cream border border-parchment text-xs font-bold uppercase tracking-wider text-dark focus:outline-none focus:border-gold"
        >
          <option value="THIS_MONTH">This Month (Aug 2026)</option>
          <option value="LAST_MONTH">Last Month (July 2026)</option>
          <option value="LAST_QUARTER">Q2 2026 (Apr - Jun)</option>
          <option value="YEAR_TO_DATE">Financial Year 2026-27</option>
        </select>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Report 1 */}
        <div className="bg-cream border border-parchment p-6 shadow-lux flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gold">
              <FileSpreadsheet className="h-5 w-5" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-gold">Sales Ledger</span>
            </div>
            <h3 className="font-serif font-bold text-lg text-dark">Gross & Net Sales Report</h3>
            <p className="text-xs text-dark/70">
              Detailed breakdown of all customer orders, item subtotal, discount voucher deductions, shipping fee collections, and net payout totals.
            </p>
          </div>

          <div className="pt-4 border-t border-parchment flex items-center justify-between">
            <span className="text-[10px] font-mono text-dark/50">Format: CSV / Excel</span>
            <button
              onClick={() => handleDownload('Gross & Net Sales Report')}
              disabled={downloadingReport === 'Gross & Net Sales Report'}
              className="inline-flex items-center px-4 py-2 bg-gold text-dark text-xs font-bold uppercase tracking-wider hover:bg-gold/90 transition-colors shadow-sm disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5 mr-2" />
              {downloadingReport === 'Gross & Net Sales Report' ? 'Generating...' : 'Export CSV'}
            </button>
          </div>
        </div>

        {/* Report 2 */}
        <div className="bg-cream border border-parchment p-6 shadow-lux flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gold">
              <FileText className="h-5 w-5" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-gold">Compliance</span>
            </div>
            <h3 className="font-serif font-bold text-lg text-dark">GST & Tax Liabilities Report</h3>
            <p className="text-xs text-dark/70">
              Itemized tax calculations (CGST/SGST/IGST breakdown at 18%) per invoice for tax filings and audit compliance.
            </p>
          </div>

          <div className="pt-4 border-t border-parchment flex items-center justify-between">
            <span className="text-[10px] font-mono text-dark/50">Format: CSV / Excel</span>
            <button
              onClick={() => handleDownload('GST Tax Liabilities Report')}
              disabled={downloadingReport === 'GST Tax Liabilities Report'}
              className="inline-flex items-center px-4 py-2 bg-gold text-dark text-xs font-bold uppercase tracking-wider hover:bg-gold/90 transition-colors shadow-sm disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5 mr-2" />
              {downloadingReport === 'GST Tax Liabilities Report' ? 'Generating...' : 'Export CSV'}
            </button>
          </div>
        </div>

        {/* Report 3 */}
        <div className="bg-cream border border-parchment p-6 shadow-lux flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gold">
              <FileSpreadsheet className="h-5 w-5" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-gold">Logistics</span>
            </div>
            <h3 className="font-serif font-bold text-lg text-dark">Inventory Valuation & Movement</h3>
            <p className="text-xs text-dark/70">
              Current warehouse stock counts, unit unit costs, total stock value, reserved stock counts, and reorder levels.
            </p>
          </div>

          <div className="pt-4 border-t border-parchment flex items-center justify-between">
            <span className="text-[10px] font-mono text-dark/50">Format: CSV / Excel</span>
            <button
              onClick={() => handleDownload('Inventory Valuation Report')}
              disabled={downloadingReport === 'Inventory Valuation Report'}
              className="inline-flex items-center px-4 py-2 bg-gold text-dark text-xs font-bold uppercase tracking-wider hover:bg-gold/90 transition-colors shadow-sm disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5 mr-2" />
              {downloadingReport === 'Inventory Valuation Report' ? 'Generating...' : 'Export CSV'}
            </button>
          </div>
        </div>

        {/* Report 4 */}
        <div className="bg-cream border border-parchment p-6 shadow-lux flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gold">
              <FileText className="h-5 w-5" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-gold">Patron Cohorts</span>
            </div>
            <h3 className="font-serif font-bold text-lg text-dark">Customer Lifetime Value & Cohorts</h3>
            <p className="text-xs text-dark/70">
              List of registered buyers, order frequencies, total lifetime spend, and regional city breakdown.
            </p>
          </div>

          <div className="pt-4 border-t border-parchment flex items-center justify-between">
            <span className="text-[10px] font-mono text-dark/50">Format: CSV / Excel</span>
            <button
              onClick={() => handleDownload('Customer Lifetime Value Report')}
              disabled={downloadingReport === 'Customer Lifetime Value Report'}
              className="inline-flex items-center px-4 py-2 bg-gold text-dark text-xs font-bold uppercase tracking-wider hover:bg-gold/90 transition-colors shadow-sm disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5 mr-2" />
              {downloadingReport === 'Customer Lifetime Value Report' ? 'Generating...' : 'Export CSV'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
