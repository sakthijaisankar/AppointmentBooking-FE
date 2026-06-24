import { useState, useEffect } from 'react';
import { useNotificationTemplates, useUpdateNotificationTemplate } from '../../hooks/useNotification';
import './NotificationTemplatesPage.css';

export default function NotificationTemplatesPage() {
  const { data: templatesResponse, isLoading, error, refetch } = useNotificationTemplates();
  const templates = templatesResponse?.data || [];

  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Form states
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [channel, setChannel] = useState('All');
  const [isActive, setIsActive] = useState(true);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const updateMutation = useUpdateNotificationTemplate(selectedTemplate?.templateCode);

  useEffect(() => {
    if (selectedTemplate) {
      setSubject(selectedTemplate.subjectTemplate || '');
      setBody(selectedTemplate.bodyTemplate || '');
      setChannel(selectedTemplate.defaultChannel || 'All');
      setIsActive(selectedTemplate.isActive);
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [selectedTemplate]);

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplate(tpl);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!body.trim()) {
      alert('Template Body cannot be empty.');
      return;
    }

    const payload = {
      subjectTemplate: subject.trim() || null,
      bodyTemplate: body.trim(),
      defaultChannel: channel,
      isActive,
    };

    updateMutation.mutate(payload, {
      onSuccess: () => {
        setSuccessMsg('Notification template updated successfully!');
        refetch();
        setTimeout(() => setSuccessMsg(''), 3000);
      },
      onError: (err) => {
        setErrorMsg(err.response?.data?.message || 'Failed to update template.');
      },
    });
  };

  const getPlaceholdersForCode = (code) => {
    switch (code) {
      case 'APPOINTMENT_BOOKED':
      case 'APPOINTMENT_CONFIRMED':
        return ['{PatientName}', '{DoctorName}', '{AppointmentNumber}', '{ScheduledTime}'];
      case 'APPOINTMENT_CANCELLED':
        return ['{PatientName}', '{DoctorName}', '{AppointmentNumber}', '{ScheduledTime}', '{Reason}'];
      case 'QUEUE_CALLING':
        return ['{PatientName}', '{DoctorName}', '{QueueNumber}'];
      case 'CONSULTATION_COMPLETED':
        return ['{PatientName}', '{DoctorName}', '{AppointmentNumber}', '{Diagnosis}'];
      default:
        return ['{PatientName}', '{DoctorName}'];
    }
  };

  if (isLoading) {
    return (
      <div className="templates-page-container">
        <div className="spinner-container">
          <div className="spinner"></div>
          <span>Retrieving notification templates...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="templates-page-container">
        <div className="error-message">Failed to load templates: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="templates-page-container">
      <header className="page-header">
        <h1>Notification Dispatch Settings</h1>
        <p className="subtitle">Configure automated SMS, Email, and Push alerts for clinic workflows.</p>
      </header>

      <div className="templates-grid">
        {/* Left Side: Template selector list */}
        <aside className="templates-sidebar">
          <h2>Templates</h2>
          <div className="templates-list">
            {templates.map((tpl) => (
              <button
                key={tpl.templateId}
                onClick={() => handleSelectTemplate(tpl)}
                className={`template-selector-card ${selectedTemplate?.templateId === tpl.templateId ? 'selected' : ''}`}
              >
                <span className="template-card-code">{tpl.templateCode}</span>
                <span className="template-card-name">{tpl.templateName}</span>
                <span className="template-card-channel">Channel: {tpl.defaultChannel}</span>
                {!tpl.isActive && <span style={{ marginLeft: '0.5rem', color: '#ef4444', fontSize: '0.7rem', fontWeight: 'bold' }}>DISABLED</span>}
              </button>
            ))}
          </div>
        </aside>

        {/* Right Side: Editor form */}
        <main>
          {selectedTemplate ? (
            <div className="template-editor-card">
              <h2>Edit: {selectedTemplate.templateName}</h2>

              {successMsg && <div className="success-message">{successMsg}</div>}
              {errorMsg && <div className="error-message">{errorMsg}</div>}

              {/* Dynamic Placeholder Guide */}
              <div className="placeholder-ref-box">
                <h4>Available Dynamic Placeholders</h4>
                <div className="placeholder-chips">
                  {getPlaceholdersForCode(selectedTemplate.templateCode).map((placeholder) => (
                    <span key={placeholder} className="placeholder-chip">
                      {placeholder}
                    </span>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSave}>
                <div className="active-toggle-row">
                  <input
                    type="checkbox"
                    id="isActiveToggle"
                    className="checkbox-input"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <label htmlFor="isActiveToggle">Template is active and sending notifications</label>
                </div>

                <div className="form-group" style={{ maxWidth: '300px' }}>
                  <label htmlFor="defaultChannelSelect">Default Dispatch Channel</label>
                  <select
                    id="defaultChannelSelect"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                  >
                    <option value="All">All Channels (SMS, Email & Push)</option>
                    <option value="Push">Push Notification Only</option>
                    <option value="Email">Email Notification Only</option>
                    <option value="SMS">SMS Notification Only</option>
                  </select>
                </div>

                {/* Subject Template only relevant if Email is a dispatcher */}
                {(channel === 'All' || channel === 'Email') && (
                  <div className="form-group">
                    <label htmlFor="subjectInput">Email Subject Template</label>
                    <input
                      type="text"
                      id="subjectInput"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Appointment Booked: {AppointmentNumber}"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="bodyTextarea">Message Body Template</label>
                  <textarea
                    id="bodyTextarea"
                    rows={6}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Enter message template text here..."
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                  <button
                    type="submit"
                    className="btn-save"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save Template Configuration'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="template-editor-card editor-empty-state">
              <span className="icon">📝</span>
              <h3>No Template Selected</h3>
              <p>Select a message template from the sidebar list to modify its content or delivery configurations.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
