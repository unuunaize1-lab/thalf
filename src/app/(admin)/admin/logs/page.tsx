'use client';

import React, { useState } from 'react';
import { History, Search, Shield, Terminal, Filter } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  adminName: string;
  adminEmail: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-101',
    adminName: 'Executive Concierge',
    adminEmail: 'admin@thalfchocolates.com',
    action: 'STATUS_UPDATE',
    entity: 'Order',
    entityId: 'THF-2026-9810',
    details: 'Changed status from PACKED to SHIPPED (Tracking: BD-982173981-IN)',
    ipAddress: '103.22.48.11',
    timestamp: '2026-08-03T10:14:20Z',
  },
  {
    id: 'log-102',
    adminName: 'Catalog Manager',
    adminEmail: 'catalog@thalfchocolates.com',
    action: 'CREATE_PRODUCT',
    entity: 'Product',
    entityId: 'thalf-007',
    details: 'Created new product "Madagascan 70% Dark Slab" in Dark Chocolate category',
    ipAddress: '49.36.192.88',
    timestamp: '2026-08-03T08:30:12Z',
  },
  {
    id: 'log-103',
    adminName: 'Catalog Manager',
    adminEmail: 'catalog@thalfchocolates.com',
    action: 'PRICE_UPDATE',
    entity: 'Product',
    entityId: 'thalf-002',
    details: 'Updated price for "Artisan Truffles Selection" from ₹3,200 to ₹3,450',
    ipAddress: '49.36.192.88',
    timestamp: '2026-08-02T16:45:00Z',
  },
  {
    id: 'log-104',
    adminName: 'Executive Concierge',
    adminEmail: 'admin@thalfchocolates.com',
    action: 'CREATE_COUPON',
    entity: 'Coupon',
    entityId: 'FESTIVE500',
    details: 'Created voucher FESTIVE500 (₹500 OFF, Min spend ₹3,500)',
    ipAddress: '103.22.48.11',
    timestamp: '2026-08-01T11:05:40Z',
  },
];

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || l.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Security Ledger</span>
        <h1 className="text-3xl font-serif font-black uppercase tracking-wider text-dark mt-1">
          System Audit Logs
        </h1>
      </div>

      {/* Filter Bar */}
      <div className="bg-cream border border-parchment p-4 shadow-lux flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark/40" />
          <input
            type="text"
            placeholder="Search audit trail by user, entity, or log details..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
          />
        </div>

        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="py-2 px-3 bg-cream border border-parchment text-xs font-semibold uppercase tracking-wider text-dark focus:outline-none focus:border-gold"
        >
          <option value="ALL">All Actions</option>
          <option value="STATUS_UPDATE">Status Update</option>
          <option value="CREATE_PRODUCT">Create Product</option>
          <option value="PRICE_UPDATE">Price Update</option>
          <option value="CREATE_COUPON">Create Coupon</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-cream border border-parchment shadow-lux overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-parchment text-dark/60 uppercase text-[9px] font-bold tracking-wider bg-parchment/30">
                <th className="py-4 px-4">Timestamp (UTC)</th>
                <th className="py-4 px-4">Administrator</th>
                <th className="py-4 px-4">Action Type</th>
                <th className="py-4 px-4">Entity</th>
                <th className="py-4 px-4">Audit Log Details</th>
                <th className="py-4 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment/40">
              {filteredLogs.map(l => (
                <tr key={l.id} className="hover:bg-parchment/20 transition-colors">
                  <td className="py-4 px-4 font-mono text-[10px] text-dark/60 whitespace-nowrap">
                    {new Date(l.timestamp).toLocaleString()}
                  </td>

                  <td className="py-4 px-4 font-semibold text-dark">
                    {l.adminName}
                    <span className="text-[9px] text-dark/40 block font-normal">{l.adminEmail}</span>
                  </td>

                  <td className="py-4 px-4">
                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-gold-light text-dark border border-gold/40">
                      {l.action}
                    </span>
                  </td>

                  <td className="py-4 px-4 font-bold text-dark">{l.entity}</td>

                  <td className="py-4 px-4 text-dark/80 max-w-md font-sans">
                    {l.details}
                  </td>

                  <td className="py-4 px-4 text-right font-mono text-[10px] text-dark/50">
                    {l.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
