import React, { useState } from 'react';
import {
  useDashboardSummary,
  useAppointmentStats,
  useQueueEmergencyStats,
  useDoctorPerformanceStats,
  usePatientAnalytics,
} from '../../hooks/useReport';
import './AdminDashboardPage.css';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');

  // Queries
  const { data: summaryRes, isLoading: isSummaryLoading, error: summaryErr } = useDashboardSummary();
  const { data: apptRes, isLoading: isApptLoading, error: apptErr } = useAppointmentStats();
  const { data: queueRes, isLoading: isQueueLoading, error: queueErr } = useQueueEmergencyStats();
  const { data: docRes, isLoading: isDocLoading, error: docErr } = useDoctorPerformanceStats();
  const { data: patientRes, isLoading: isPatientLoading, error: patientErr } = usePatientAnalytics();

  const summary = summaryRes?.data || {};
  const appointments = apptRes?.data || { statuses: [], trends: [] };
  const queueEmergency = queueRes?.data || { triage: [], overrideCount: 0 };
  const doctors = docRes?.data || [];
  const patients = patientRes?.data || { ageGroups: [], genders: [] };

  const isLoading = isSummaryLoading || isApptLoading || isQueueLoading || isDocLoading || isPatientLoading;
  const hasError = summaryErr || apptErr || queueErr || docErr || patientErr;

  if (isLoading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="spinner"></div>
        <p>Generating real-time intelligence analytics...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="admin-dashboard-error">
        <h3>Analytics Generation Failed</h3>
        <p>Could not retrieve reports data. Ensure database connection is active and backend services are online.</p>
      </div>
    );
  }

  // Monthly Labels Map
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Admin Command & Control Center</h1>
          <p className="subtitle">Real-time health informatics, appointment trends, queue logs, and clinical performance audit.</p>
        </div>
        <button 
          onClick={() => {
            window.print();
          }} 
          className="btn-export-pdf"
          title="Print official clinical report summary"
        >
          🖨️ Export PDF Report
        </button>
      </header>

      {/* KPI Stats Summary Panel */}
      <section className="kpi-panel">
        <div className="kpi-card">
          <div className="kpi-icon blue">👥</div>
          <div className="kpi-details">
            <span className="kpi-title">Total Active Patients</span>
            <span className="kpi-value">{summary.totalPatients ?? 0}</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green">📅</div>
          <div className="kpi-details">
            <span className="kpi-title">Today's Appointments</span>
            <span className="kpi-value">{summary.appointmentsToday ?? 0}</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon purple">⏳</div>
          <div className="kpi-details">
            <span className="kpi-title">Active Queue Load</span>
            <span className="kpi-value">{summary.activeQueueCount ?? 0} Patients</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon orange">🕒</div>
          <div className="kpi-details">
            <span className="kpi-title">Avg Consultation Wait</span>
            <span className="kpi-value">{summary.avgWaitTimeMinutes ?? 0} min</span>
          </div>
        </div>
      </section>

      {/* Navigation tabs */}
      <nav className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview & Trends
        </button>
        <button 
          className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          🗓️ Appointments Analysis
        </button>
        <button 
          className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`}
          onClick={() => setActiveTab('doctors')}
        >
          🥼 Doctor Performance
        </button>
        <button 
          className={`tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          🚨 Queue & Priority Override
        </button>
        <button 
          className={`tab-btn ${activeTab === 'patients' ? 'active' : ''}`}
          onClick={() => setActiveTab('patients')}
        >
          🩺 Patient Demographics
        </button>
      </nav>

      <div className="tab-content">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid-2-col">
            <div className="report-card">
              <h2>Monthly Appointment Volume Trend</h2>
              <p className="card-desc">Volume of patients serviced month-over-month</p>
              
              {appointments.trends && appointments.trends.length > 0 ? (
                <div className="chart-container">
                  <svg viewBox="0 0 500 220" className="trend-svg">
                    {/* Grid lines */}
                    <line x1="40" y1="20" x2="480" y2="20" stroke="#f3f4f6" strokeWidth="1" />
                    <line x1="40" y1="70" x2="480" y2="70" stroke="#f3f4f6" strokeWidth="1" />
                    <line x1="40" y1="120" x2="480" y2="120" stroke="#f3f4f6" strokeWidth="1" />
                    <line x1="40" y1="170" x2="480" y2="170" stroke="#f3f4f6" strokeWidth="1" />

                    {/* Bars */}
                    {appointments.trends.map((item, idx) => {
                      const maxVal = Math.max(...appointments.trends.map(t => t.volume), 10);
                      const barHeight = (item.volume / maxVal) * 130;
                      const x = 50 + idx * 75;
                      const y = 170 - barHeight;
                      return (
                        <g key={idx} className="chart-bar-group">
                          <rect
                            x={x}
                            y={y}
                            width="40"
                            height={barHeight}
                            rx="4"
                            className="chart-bar"
                            fill="url(#trendGrad)"
                          />
                          <text x={x + 20} y={y - 8} textAnchor="middle" className="bar-val">
                            {item.volume}
                          </text>
                          <text x={x + 20} y="190" textAnchor="middle" className="bar-label">
                            {monthNames[(item.month - 1) % 12]} '{item.year.toString().slice(-2)}
                          </text>
                        </g>
                      );
                    })}
                    <defs>
                      <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              ) : (
                <div className="empty-chart">No monthly trend data available.</div>
              )}
            </div>

            <div className="report-card">
              <h2>Triage Urgency Allocation</h2>
              <p className="card-desc">Active queue breakdown by priority tier</p>
              <div className="triage-visualizer">
                {queueEmergency.triage && queueEmergency.triage.length > 0 ? (
                  <div className="triage-distribution">
                    {queueEmergency.triage.map((item, idx) => {
                      const colors = {
                        'Urgent': '#ef4444',
                        'Standard': '#3b82f6',
                        'Normal': '#10b981',
                        'High': '#f59e0b',
                        'Emergency': '#ef4444',
                      };
                      const bg = colors[item.levelName] || '#6b7280';
                      return (
                        <div className="triage-row" key={idx}>
                          <span className="triage-label-badge" style={{ backgroundColor: bg }}>
                            {item.levelName}
                          </span>
                          <div className="triage-progress-track">
                            <div 
                              className="triage-progress-bar" 
                              style={{ width: `${Math.min(100, (item.count / Math.max(...queueEmergency.triage.map(t => t.count), 1)) * 100)}%`, backgroundColor: bg }}
                            ></div>
                          </div>
                          <span className="triage-count-value">{item.count} Patients</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-chart">No triage statistics recorded.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Appointment Stats */}
        {activeTab === 'appointments' && (
          <div className="grid-2-col">
            <div className="report-card">
              <h2>Status Distribution Ratio</h2>
              <p className="card-desc">Historical statuses of all scheduled slots</p>
              {appointments.statuses && appointments.statuses.length > 0 ? (
                <div className="donut-chart-container">
                  <svg viewBox="0 0 200 200" width="100%" height="200">
                    {(() => {
                      const total = appointments.statuses.reduce((acc, curr) => acc + curr.count, 0) || 1;
                      let accumulatedPercent = 0;
                      const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#6b7280", "#8b5cf6"];
                      return appointments.statuses.map((item, idx) => {
                        const percent = item.count / total;
                        const startAngle = accumulatedPercent * 360;
                        accumulatedPercent += percent;
                        const endAngle = accumulatedPercent * 360;

                        // Polar coordinates converter
                        const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
                          const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
                          return {
                            x: centerX + radius * Math.cos(angleInRadians),
                            y: centerY + radius * Math.sin(angleInRadians),
                          };
                        };

                        const start = polarToCartesian(100, 100, 70, startAngle);
                        const end = polarToCartesian(100, 100, 70, endAngle);
                        const largeArcFlag = percent > 0.5 ? 1 : 0;

                        const d = [
                          "M", start.x, start.y,
                          "A", 70, 70, 0, largeArcFlag, 1, end.x, end.y
                        ].join(" ");

                        return (
                          <path
                            key={idx}
                            d={d}
                            fill="none"
                            stroke={colors[idx % colors.length]}
                            strokeWidth="20"
                            className="donut-segment"
                          />
                        );
                      });
                    })()}
                    <circle cx="100" cy="100" r="55" fill="#fff" />
                    <text x="100" y="105" textAnchor="middle" className="donut-center-text">
                      {appointments.statuses.reduce((acc, curr) => acc + curr.count, 0)} Total
                    </text>
                  </svg>
                  <div className="donut-legend">
                    {appointments.statuses.map((item, idx) => {
                      const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#6b7280", "#8b5cf6"];
                      return (
                        <div className="legend-item" key={idx}>
                          <span className="dot" style={{ backgroundColor: colors[idx % colors.length] }}></span>
                          <span className="name">{item.statusName} ({item.count})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="empty-chart">No appointment status records.</div>
              )}
            </div>

            <div className="report-card">
              <h2>Audit Status Breakdown Table</h2>
              <p className="card-desc">Detailed logs of status tallies for clinical scheduling</p>
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Status Category</th>
                    <th className="align-right">Total Count</th>
                    <th className="align-right">Ratio Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.statuses.map((item, idx) => {
                    const total = appointments.statuses.reduce((a, c) => a + c.count, 0) || 1;
                    return (
                      <tr key={idx}>
                        <td><strong>{item.statusName}</strong></td>
                        <td className="align-right">{item.count}</td>
                        <td className="align-right">{((item.count / total) * 100).toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Doctor Performance */}
        {activeTab === 'doctors' && (
          <div className="report-card">
            <h2>Doctor Consultations & Average Waiting Audits</h2>
            <p className="card-desc">Consolidated service volume and patient delays per medical practitioner</p>
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Practitioner ID</th>
                  <th>Full Name</th>
                  <th>Clinical Specialization</th>
                  <th className="align-right">Total Consultations</th>
                  <th className="align-right">Avg Wait Time (Min)</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc, idx) => (
                  <tr key={idx}>
                    <td><code>#{doc.doctorId}</code></td>
                    <td><strong>{doc.doctorName}</strong></td>
                    <td>{doc.specializationName}</td>
                    <td className="align-right">{doc.totalConsultations}</td>
                    <td className="align-right">
                      <span className={`wait-badge ${doc.avgWaitTimeMinutes > 25 ? 'warning' : 'good'}`}>
                        {doc.avgWaitTimeMinutes.toFixed(1)} min
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Queue & Emergency */}
        {activeTab === 'queue' && (
          <div className="grid-2-col">
            <div className="report-card alert-override-card">
              <div className="alert-badge">CRITICAL ACTION LOG</div>
              <h2>Manual Priority Overrides</h2>
              <div className="override-count-display">
                <span className="count-num">{queueEmergency.overrideCount ?? 0}</span>
                <span className="count-label">Emergency Actions Dispatched</span>
              </div>
              <p className="override-disclaimer">
                Manual priority overrides bypass standard appointment slots. These events indicate instances where patients with life-threatening or highly acute symptoms required triage adjustment.
              </p>
            </div>

            <div className="report-card">
              <h2>Queue Congestion Analysis</h2>
              <p className="card-desc">Triage priority allocation list</p>
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Urgency Level</th>
                    <th className="align-right">Patients Count</th>
                  </tr>
                </thead>
                <tbody>
                  {queueEmergency.triage.map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.levelName}</strong></td>
                      <td className="align-right">{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Patient Demographics */}
        {activeTab === 'patients' && (
          <div className="grid-2-col">
            <div className="report-card">
              <h2>Patient Age Breakdown</h2>
              <p className="card-desc">Volume across key age cohorts</p>
              {patients.ageGroups && patients.ageGroups.length > 0 ? (
                <div className="age-bar-chart">
                  {patients.ageGroups.map((item, idx) => {
                    const maxVal = Math.max(...patients.ageGroups.map(a => a.count), 1);
                    const percentage = (item.count / maxVal) * 100;
                    return (
                      <div className="age-bar-row" key={idx}>
                        <span className="age-group-lbl">{item.ageGroup}</span>
                        <div className="age-bar-track">
                          <div className="age-bar-fill" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className="age-count-lbl">{item.count} Patients</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-chart">No patient age statistics available.</div>
              )}
            </div>

            <div className="report-card">
              <h2>Patient Gender Allocation</h2>
              <p className="card-desc">Distribution by binary gender identifiers</p>
              {patients.genders && patients.genders.length > 0 ? (
                <div className="gender-distribution-box">
                  {patients.genders.map((item, idx) => {
                    const total = patients.genders.reduce((acc, curr) => acc + curr.count, 0) || 1;
                    const percent = ((item.count / total) * 100).toFixed(1);
                    return (
                      <div className="gender-stat-card" key={idx}>
                        <div className="gender-icon">{item.gender === 'Male' ? '👨' : '👩'}</div>
                        <div className="gender-details">
                          <span className="gender-name">{item.gender}</span>
                          <span className="gender-val">{item.count} ({percent}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-chart">No patient gender statistics available.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
