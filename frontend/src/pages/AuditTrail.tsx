import { useEffect, useState } from 'react';
import { fetchAuditLogs, createAuditLog } from '../services/api';
import { AuditLogItem } from '../types';
import {
  FileText,
  Search,
  Filter,
  Plus,
} from 'lucide-react';

export function AuditTrail() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newActionModal, setNewActionModal] = useState<boolean>(false);
  const [newActionText, setNewActionText] = useState<string>('BUNDLE_AUDIT_COMPLIANCE_VERIFIED');
  const [newPatientId, setNewPatientId] = useState<string>('DEMO-1042');

  const loadLogs = () => {
    setLoading(true);
    fetchAuditLogs(100)
      .then((data) => {
        setLogs(data.logs);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAuditLog({
        user_id: 'IPC_CLINICIAN_ACTIVE',
        user_role: 'IPC_ADMIN',
        action: newActionText,
        patient_id: newPatientId || undefined,
        details: { verified_by: 'Clinical Rounding Team', status: 'Completed' },
      });
      setNewActionModal(false);
      loadLogs();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (selectedRole && log.user_role !== selectedRole) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        log.action.toLowerCase().includes(term) ||
        log.user_id.toLowerCase().includes(term) ||
        (log.patient_id && log.patient_id.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Clinical Audit Trail & Governance Ledger
              </h2>
              <p className="text-xs text-slate-400">
                Immutable chronological log of all AI inferences, what-if simulations, and clinician IPC actions
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setNewActionModal(true)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record IPC Audit Action</span>
          </button>
        </div>
      </div>

      {/* Record Action Modal */}
      {newActionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white">Record Clinical IPC Action</h3>
            <form onSubmit={handleCreateEntry} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Action Protocol:</label>
                <select
                  value={newActionText}
                  onChange={(e) => setNewActionText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="BUNDLE_AUDIT_COMPLIANCE_VERIFIED">BUNDLE_AUDIT_COMPLIANCE_VERIFIED</option>
                  <option value="CENTRAL_LINE_REMOVAL_ASSESSED">CENTRAL_LINE_REMOVAL_ASSESSED</option>
                  <option value="ENVIRONMENTAL_DISINFECTION_DISPATCHED">ENVIRONMENTAL_DISINFECTION_DISPATCHED</option>
                  <option value="CLUSTER_SIGNAL_ACKNOWLEDGED">CLUSTER_SIGNAL_ACKNOWLEDGED</option>
                  <option value="CLINICAL_ROUNDING_COMPLETED">CLINICAL_ROUNDING_COMPLETED</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Patient ID (Optional):</label>
                <input
                  type="text"
                  value={newPatientId}
                  onChange={(e) => setNewPatientId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewActionModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Commit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Action, User ID, or Patient ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="">All User Roles</option>
              <option value="IPC_ADMIN">IPC Admin</option>
              <option value="CLINICIAN">Clinician</option>
              <option value="RESEARCHER">Researcher / ML</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Log ID</th>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Actor / Role</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Target Patient</th>
                <th className="py-3 px-4">Model Ver</th>
                <th className="py-3 px-4">Audit Payload Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Loading audit trail ledger...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                    No audit records match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 text-slate-500">#{log.id}</td>
                    <td className="py-3 px-4 text-slate-300 text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white font-bold">{log.user_id}</div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {log.user_role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-cyan-300 font-bold">{log.action}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {log.patient_id ? (
                        <span className="text-white font-bold">{log.patient_id}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">v{log.model_version}</td>
                    <td className="py-3 px-4 text-[10px] text-slate-400 font-mono max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
