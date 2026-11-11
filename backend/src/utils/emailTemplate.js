export const esc = (s = '') => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export const emailLayout = ({ greeting, paragraphs = [], highlight, button, footnote }) => `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f2f4f7;padding:30px 0;color:#0d1b12;">
  <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #d0d8d3;">
    <div style="background:#008751;padding:20px;text-align:center;">
      <h2 style="color:#fff;margin:0;font-size:18px;">CDSCONNECT</h2>
      <p style="color:#e6f4ee;margin:4px 0 0;font-size:12px;">InfoTech CDS Group · Lagos State</p>
    </div>
    <div style="padding:24px;">
      <p style="font-size:15px;margin-top:0;">Hi <b>${esc(greeting)}</b>,</p>
      ${paragraphs.map(p => `<p style="font-size:14px;color:#4a5568;line-height:1.5;">${p}</p>`).join('')}
      ${highlight ? `<div style="background:#f8fdf9;border:1px dashed #008751;border-radius:6px;padding:16px;text-align:center;margin:20px 0;">
        <span style="font-size:12px;color:#8fa396;text-transform:uppercase;display:block;margin-bottom:6px;">${highlight.label}</span>
        <span style="font-size:26px;font-weight:bold;color:#008751;letter-spacing:2px;">${esc(highlight.value)}</span></div>` : ''}
      ${button ? `<div style="text-align:center;margin:22px 0;"><a href="${button.url}" style="background:#008751;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:bold;display:inline-block;">${button.label}</a></div>` : ''}
      ${footnote ? `<hr style="border:none;border-top:1px solid #e8ece9;margin:20px 0;"/><p style="font-size:12px;color:#8fa396;line-height:1.4;">${footnote}</p>` : ''}
    </div>
    <div style="background:#f8fdf9;padding:12px;text-align:center;border-top:1px solid #e8ece9;">
      <p style="font-size:11px;color:#8fa396;margin:0;">CDSConnect automated service</p>
    </div>
  </div>
</div>`