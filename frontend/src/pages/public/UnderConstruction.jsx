import  { useState } from 'react'


export default function UnderConstruction() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const theme = {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    bgColor: '#f2f4f7',
    primaryGreen: '#008751',
    primaryGreenLight: '#e6f4ee',
    darkText: '#0d1b12',
    mutedText: '#8fa396',
    secondaryIcon: '#4a5e52',
    white: '#ffffff',
    border: '#e8ece9',
    shadow: '0 2px 12px rgba(0,0,0,0.07)',
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.bgColor,
      fontFamily: theme.fontFamily,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px 100px 16px',
    }}>
      <div style={{
        maxWidth: '390px',
        width: '100%',
        margin: '0 auto',
      }}>
        {/* Status Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <span style={{
            backgroundColor: theme.primaryGreenLight,
            color: theme.primaryGreen,
            fontSize: '12px',
            fontWeight: 700,
            padding: '6px 14px',
            borderRadius: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: theme.primaryGreen,
              display: 'inline-block'
            }} />
            System Maintenance
          </span>
        </div>

        {/* Main Card */}
        <div style={{
          backgroundColor: theme.white,
          borderRadius: '14px',
          padding: '28px 20px',
          boxShadow: theme.shadow,
          textAlign: 'center',
          marginBottom: '16px',
        }}>
          {/* Construction Icon */}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: theme.primaryGreenLight,
            color: theme.primaryGreen,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>

          <h1 style={{
            fontSize: '22px',
            fontWeight: 800,
            color: theme.darkText,
            margin: '0 0 8px 0',
            letterSpacing: '-0.3px',
          }}>
            We're Upgrading
          </h1>

          <p style={{
            fontSize: '14px',
            color: theme.mutedText,
            lineHeight: 1.5,
            margin: '0 0 24px 0',
          }}>
            We are optimizing database infrastructure and enhancing system workflows. Access will resume shortly.
          </p>

          {/* Progress Bar Container */}
          <div style={{
            backgroundColor: theme.bgColor,
            padding: '12px',
            borderRadius: '10px',
            textAlign: 'left',
            marginBottom: '24px',
            border: `1px solid ${theme.border}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: theme.darkText, marginBottom: '6px' }}>
              <span>Deployment Progress</span>
              <span style={{ color: theme.primaryGreen }}>78%</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: theme.border, borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '78%', height: '100%', backgroundColor: theme.primaryGreen, borderRadius: '3px' }} />
            </div>
          </div>

          {/* Email Notification Form */}
          {!subscribed ? (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="email"
                required
                placeholder="Enter email for updates"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: `1px solid ${theme.border}`,
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: theme.fontFamily,
                  color: theme.darkText,
                }}
              />
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: theme.primaryGreen,
                  color: theme.white,
                  fontWeight: 700,
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: theme.fontFamily,
                }}
              >
                Notify Me
              </button>
            </form>
          ) : (
            <div style={{
              padding: '12px',
              backgroundColor: theme.primaryGreenLight,
              color: theme.primaryGreen,
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600
            }}>
              ✓ You will be notified when live.
            </div>
          )}
        </div>

        {/* System Terminal Card */}
        <div style={{
          backgroundColor: theme.white,
          borderRadius: '14px',
          padding: '16px',
          boxShadow: theme.shadow,
          border: `1px solid ${theme.border}`,
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: theme.secondaryIcon, textTransform: 'uppercase', tracking: '0.5px', marginBottom: '8px' }}>
            Live Logs
          </div>
          <div style={{
            fontSize: '12px',
            color: theme.mutedText,
            fontFamily: 'monospace',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div>[OK] PostgreSQL migrations completed</div>
            <div>[OK] API endpoints synced</div>
            <div style={{ color: theme.primaryGreen }}>[RUNNING] Cache warming in progress...</div>
          </div>
        </div>
      </div>
    </div>
  );
}