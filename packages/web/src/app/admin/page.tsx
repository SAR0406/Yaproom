"use client";

import { useEffect, useState } from 'react';
import styles from './admin.module.css';

type LogItem = { title: string; detail: string; time: string };

export default function AdminPage() {
  const [clock, setClock] = useState('--:--:--');
  const [history, setHistory] = useState<LogItem[]>([]);
  const [visible, setVisible] = useState(true);
  const [previewOn, setPreviewOn] = useState(true);
  const [mode, setMode] = useState('Standard');

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // restore draft
    try {
      const raw = localStorage.getItem('mqtt_admin_draft');
      if (raw) {
        const data = JSON.parse(raw);
        Object.entries(data).forEach(([key, value]) => {
          const el = document.getElementById(key) as HTMLInputElement | null;
          if (el) el.value = String(value ?? '');
        });
      }
    } catch {}
    updatePreview('ready');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function timeString() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function pushLog(title: string, detail: string) {
    const item = { title, detail, time: timeString() };
    setHistory((h) => [item, ...h].slice(0, 6));
  }

  function readForm() {
    const ids = ['broker','publishTopic','settingsTopic','username','message','count','speed','panelTitle'];
    const out: Record<string, any> = {};
    ids.forEach((id) => {
      const el = document.getElementById(id) as HTMLInputElement | null;
      out[id] = el ? el.value : '';
    });
    return out;
  }

  function updateStats() {
    const data = readForm();
    const sb = document.getElementById('statBroker');
    const sp = document.getElementById('statPublish');
    const ss = document.getElementById('statSettings');
    const sm = document.getElementById('statMode');
    const bt = document.getElementById('brandTitle');
    if (sb) sb.textContent = data.broker ? 'Configured' : 'Offline';
    if (sp) sp.textContent = data.publishTopic || '-';
    if (ss) ss.textContent = data.settingsTopic || '-';
    if (sm) sm.textContent = mode;
    if (bt) bt.textContent = data.panelTitle || 'ADMIN PANEL';
  }

  function updatePreview(action = 'ready') {
    const data = readForm();
    const payload = {
      action,
      broker: data.broker,
      publishTopic: data.publishTopic,
      settingsTopic: data.settingsTopic,
      username: data.username,
      message: data.message,
      count: Number(data.count || 0),
      speed: Number(data.speed || 0),
      panelTitle: data.panelTitle,
      visible,
      previewOn,
      date: new Date().toISOString(),
    };
    const preview = document.getElementById('previewText');
    if (preview) preview.textContent = JSON.stringify(payload, null, 2);
    updateStats();
    const status = document.getElementById('statusText');
    if (status) status.textContent = action.toUpperCase();
  }

  function safeText(s: any) {
    return String(s ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  }

  function standardMode() {
    setMode('Standard');
    updatePreview('standard_publish');
    const data = readForm();
    pushLog('STANDARD', `Prepared publish payload for ${data.publishTopic}`);
  }

  function chaosMode() {
    setMode('Chaos Matrix');
    const names = [
      'Tony Stark 💗','Math Warrior','Physics King','Code Ninja','Aryan Sharma','Rohit Gamer','Ananya Singh','Dev Master','JEE AIR 1','Sigma Boy'
    ];
    const el = document.getElementById('username') as HTMLInputElement | null;
    if (el) el.value = names[Math.floor(Math.random()*names.length)];
    updatePreview('chaos_matrix');
    const data = readForm();
    pushLog('CHAOS MATRIX', `Randomized identity: ${data.username}`);
  }

  function allClear() { setMode('All Clear'); (document.getElementById('message') as HTMLInputElement | null)!.value = ''; updatePreview('all_clear'); pushLog('ALL CLEAR','Message field cleared'); }
  function stopAction() { setMode('Stopped'); updatePreview('stop'); pushLog('STOP','Operations paused'); }
  function lockChat(){ setMode('Chat Locked'); updatePreview('chat_lock'); pushLog('LOCK CHAT', `Settings payload prepared for ${(document.getElementById('settingsTopic') as HTMLInputElement | null)?.value}`); }
  function unlockChat(){ setMode('Chat Unlocked'); updatePreview('chat_unlock'); pushLog('UNLOCK', `Settings payload prepared for ${(document.getElementById('settingsTopic') as HTMLInputElement | null)?.value}`); }
  function hideChat(){ setMode('Hidden'); updatePreview('chat_hide'); pushLog('CHAT HIDE','Chat hidden mode enabled'); }
  function publicChat(){ setMode('Public'); updatePreview('chat_public'); pushLog('CHAT PUBLIC','Public mode enabled'); }
  function connectBroker(){ setMode('Connected'); updatePreview('connected'); const b = (document.getElementById('broker') as HTMLInputElement | null)?.value || ''; (document.getElementById('statBroker') as HTMLElement | null)!.textContent = b ? 'Connected' : 'Offline'; pushLog('CONNECT', b || 'Broker URL missing'); }

  function resetPanel(){
    const defaults: Record<string,string> = {
      broker:'wss://mqtt-ws.example.com:8084/mqtt',publishTopic:'room_publish',settingsTopic:'room_settings',username:'Tony Stark 💗',message:'Hello everyone 🔥',count:'100',speed:'300',panelTitle:'MQTT Chaos Panel'
    };
    Object.entries(defaults).forEach(([id, val]) => {
      const el = document.getElementById(id) as HTMLInputElement | null; if (el) el.value = val;
    });
    setVisible(true); setPreviewOn(true); setMode('Standard');
    const tv = document.getElementById('toggleVisible'); if (tv) tv.classList.add('on');
    const tp = document.getElementById('togglePreview'); if (tp) tp.classList.add('on');
    const sp = document.getElementById('section-preview'); if (sp) sp.classList.remove('hidden');
    const sc = document.getElementById('section-controls'); if (sc) sc.classList.remove('hidden');
    setHistory([]); updatePreview('reset'); pushLog('RESET','Panel restored to defaults'); const status = document.getElementById('statusText'); if (status) status.textContent = 'READY';
  }

  function copyPreview(){ const text = (document.getElementById('previewText') as HTMLElement | null)?.textContent || ''; navigator.clipboard.writeText(text).then(()=>{ pushLog('COPY','Preview copied to clipboard'); const status = document.getElementById('statusText'); if (status) status.textContent = 'COPIED'; }); }
  function saveDraft(){ localStorage.setItem('mqtt_admin_draft', JSON.stringify(readForm())); pushLog('SAVE','Draft saved locally'); const status = document.getElementById('statusText'); if (status) status.textContent = 'SAVED'; }

  return (
    <div className={styles.root}>
      <div className={styles.noise}></div>
      <div className={`${styles.orb} ${styles.a}`}></div>
      <div className={`${styles.orb} ${styles.b}`}></div>
      <div className={`${styles.orb} ${styles.c}`}></div>

      <div className={styles.shell}>
        <aside className={`${styles.sidebar} ${styles.panel}`}>
          <div className={styles.brand}>
            <div className={styles.badge}>MQTT</div>
            <div>
              <h1 id="brandTitle">ADMIN PANEL</h1>
              <p>Neubrutal control center</p>
            </div>
          </div>

          <div className={styles['status-card']}>
            <div className={styles.dot}></div>
            <div>
              <p className={styles['small-label']}>SYSTEM STATUS</p>
              <div className={styles['status-value']} id="statusText">READY</div>
            </div>
          </div>

          <div className={styles.nav}>
            <button className={styles.active} data-section="section-publish">Publish</button>
            <button data-section="section-settings">Settings</button>
            <button data-section="section-controls">Controls</button>
            <button data-section="section-preview">Preview</button>
          </div>

          <div className={styles['sidebar-footer']}>
            <span className={styles['tiny-label'] + ' ' + styles['small-label']}>LIVE CLOCK</span>
            <div className={styles.clock} id="clock">{clock}</div>
            <div className={styles.subtle}>Local demo dashboard interface</div>
          </div>
        </aside>

        <main className={styles.main}>
          <section className={`${styles.topbar} ${styles.panel}`}>
            <div>
              <p className={styles.eyebrow}>BROKER CONSOLE</p>
              <h2>Professional MQTT Admin Interface</h2>
            </div>

            <div className={styles.right + ' ' + styles.topbar}>
              <button className={`${styles.chip} ${styles['chip-green']}`} id="btnConnect" onClick={connectBroker}>Connect</button>
              <button className={`${styles.chip} ${styles['chip-dark']}`} id="btnReset" onClick={resetPanel}>Reset</button>
            </div>
          </section>

          <section className={styles.stats}>
            <article className={`${styles.stat} ${styles.panel}`}>
              <span>Broker</span>
              <strong id="statBroker">Offline</strong>
            </article>
            <article className={`${styles.stat} ${styles.panel}`}>
              <span>Publish Topic</span>
              <strong id="statPublish">room_publish</strong>
            </article>
            <article className={`${styles.stat} ${styles.panel}`}>
              <span>Settings Topic</span>
              <strong id="statSettings">room_settings</strong>
            </article>
            <article className={`${styles.stat} ${styles.panel}`}>
              <span>Mode</span>
              <strong id="statMode">Standard</strong>
            </article>
          </section>

          <section id="section-publish" className={`${styles.panel} ${styles.card}`}>
            <div className={styles['card-head']}>
              <div>
                <p className={styles.eyebrow}>PUBLISH CONFIG</p>
                <h3>Chat Payload Builder</h3>
              </div>
              <span className={`${styles.pill} ${styles.pink}`}>_publish</span>
            </div>

            <div className={styles.fields}>
              <div className={`${styles.grid} ${styles.two}`}>
                <div className={styles.field}>
                  <label>MQTT Broker URL</label>
                  <input id="broker" defaultValue="wss://mqtt-ws.example.com:8084/mqtt" />
                </div>
                <div className={styles.field}>
                  <label>Publish Topic</label>
                  <input id="publishTopic" defaultValue="room_publish" />
                </div>
              </div>

              <div className={`${styles.grid} ${styles.two}`}>
                <div className={styles.field}>
                  <label>Username</label>
                  <input id="username" defaultValue="Tony Stark 💗" />
                </div>
                <div className={styles.field}>
                  <label>Message</label>
                  <input id="message" defaultValue="Hello everyone 🔥" />
                </div>
              </div>

              <div className={`${styles.grid} ${styles.two}`}>
                <div className={styles.field}>
                  <label>Count</label>
                  <input id="count" type="number" defaultValue={100} />
                </div>
                <div className={styles.field}>
                  <label>Speed (ms)</label>
                  <input id="speed" type="number" defaultValue={300} />
                </div>
              </div>

              <div className={styles.actions}>
                <button className={`${styles.btn} ${styles['btn-primary']}`} id="btnStandard" onClick={standardMode}>Standard Publish</button>
                <button className={`${styles.btn} ${styles['btn-accent']}`} id="btnChaos" onClick={chaosMode}>Chaos Matrix</button>
                <button className={`${styles.btn} ${styles['btn-neutral']}`} id="btnAllClear" onClick={allClear}>All Clear</button>
                <button className={`${styles.btn} ${styles['btn-danger']}`} id="btnStop" onClick={stopAction}>Stop</button>
              </div>
            </div>
          </section>

          <section id="section-settings" className={`${styles.panel} ${styles.card}`}>
            <div className={styles['card-head']}>
              <div>
                <p className={styles.eyebrow}>SETTINGS CONFIG</p>
                <h3>Room Control Channel</h3>
              </div>
              <span className={`${styles.pill} ${styles.cyan}`}>_settings</span>
            </div>

            <div className={styles.fields}>
              <div className={`${styles.grid} ${styles.two}`}>
                <div className={styles.field}>
                  <label>Settings Topic</label>
                  <input id="settingsTopic" defaultValue="room_settings" />
                </div>
                <div className={styles.field}>
                  <label>Panel Title</label>
                  <input id="panelTitle" defaultValue="MQTT Chaos Panel" />
                </div>
              </div>

              <div className={styles.actions}>
                <button className={`${styles.btn} ${styles['btn-warning']}`} id="btnLock" onClick={lockChat}>Lock Chat</button>
                <button className={`${styles.btn} ${styles['btn-success']}`} id="btnUnlock" onClick={unlockChat}>Unlock</button>
                <button className={`${styles.btn} ${styles['btn-purple']}`} id="btnHide" onClick={hideChat}>Chat Hide</button>
                <button className={`${styles.btn} ${styles['btn-blue']}`} id="btnPublic" onClick={publicChat}>Chat Public</button>
              </div>
            </div>
          </section>

          <section id="section-controls" className={`${styles.panel} ${styles.card}`}>
            <div className={styles['card-head']}>
              <div>
                <p className={styles.eyebrow}>ADMIN CONTROLS</p>
                <h3>Global Switches</h3>
              </div>
              <span className={`${styles.pill} ${styles.gold}`}>LIVE</span>
            </div>

            <div className={styles.controls}>
              <div className={styles.toggle}>
                <span>Panel Visible</span>
                <button id="toggleVisible" className={`${styles.switch} ${visible ? 'on' : ''}`} aria-label="Toggle panel visibility" onClick={() => { setVisible(v => !v); const el = document.getElementById('section-preview'); if (el) el.classList.toggle('hidden', !visible); pushLog('VISIBILITY', visible ? 'Panel hidden' : 'Panel shown'); updatePreview('visibility_changed'); }}>
                  <span className={styles.knob}></span>
                </button>
              </div>

              <div className={styles.toggle}>
                <span>Auto Preview</span>
                <button id="togglePreview" className={`${styles.switch} ${previewOn ? 'on' : ''}`} aria-label="Toggle live preview" onClick={() => { setPreviewOn(p => !p); const el = document.getElementById('section-preview'); if (el) el.classList.toggle('hidden', !previewOn); pushLog('PREVIEW', previewOn ? 'Preview disabled' : 'Preview enabled'); updatePreview('preview_toggled'); }}>
                  <span className={styles.knob}></span>
                </button>
              </div>
            </div>

            <div className={styles.actions} style={{ marginTop: 14 }}>
              <button className={`${styles.btn} ${styles['btn-dark']}`} id="btnCopy" onClick={copyPreview}>Copy Preview</button>
              <button className={`${styles.btn} ${styles['btn-dark']}`} id="btnSave" onClick={saveDraft}>Save Draft</button>
            </div>
          </section>

          <section id="section-preview" className={`${styles.panel} ${styles.preview}`}>
            <div className={styles['card-head']}>
              <div>
                <p className={styles.eyebrow}>LIVE PREVIEW</p>
                <h3>Generated Payload</h3>
              </div>
              <button className={`${styles.chip} ${styles['chip-dark']}`} id="btnRefresh" onClick={() => updatePreview('refresh')}>Refresh</button>
            </div>
            <pre id="previewText" className={styles['preview-box']}></pre>
          </section>

          <section className={`${styles.panel} ${styles.card}`}>
            <div className={styles['card-head']}>
              <div>
                <p className={styles.eyebrow}>AUDIT TRAIL</p>
                <h3>Recent Actions</h3>
              </div>
              <span className={`${styles['tiny-label']} ${styles['small-label']}`}>LOCAL</span>
            </div>
            <div id="logList" className={styles['log-list']}>
              {history.map((h, i) => (
                <div className={styles.log} key={i}>
                  <div>
                    <strong>{safeText(h.title)}</strong>
                    <span>{safeText(h.detail)}</span>
                  </div>
                  <time>{h.time}</time>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
