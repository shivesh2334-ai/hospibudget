'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'

// ─── Constants ───────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  'Cardiology & CTVS', 'Cardiac Catheterisation Lab', 'Cardiac ICU (CICU)',
  'Intensive Care Unit (ICU)', 'Emergency & Trauma', 'Radiology & Imaging',
  'Operation Theatre', 'Orthopaedics', 'Neurology & Neurosurgery',
  'Oncology & Radiotherapy', 'Nephrology & Dialysis', 'Pulmonology',
  'Gastroenterology', 'Paediatrics & NICU', 'Pathology & Laboratory',
  'Pharmacy', 'Administration & HR', 'Facilities & Engineering', 'Other'
]

const EQUIPMENT_CATEGORIES = [
  'Diagnostic Equipment', 'Therapeutic Equipment', 'Monitoring Equipment',
  'Life Support Equipment', 'Surgical Instruments', 'IT & Informatics',
  'Furniture & Fixtures', 'Cold Storage & Refrigeration', 'Communication Systems',
  'Safety & Security', 'Sterilisation Equipment', 'Other'
]

const STAFF_CATEGORIES = [
  { label: 'Senior Consultant / HOD', level: 'senior' },
  { label: 'Consultant', level: 'senior' },
  { label: 'Resident / Fellow', level: 'mid' },
  { label: 'Junior Resident', level: 'junior' },
  { label: 'Nursing Supervisor', level: 'mid' },
  { label: 'Staff Nurse', level: 'mid' },
  { label: 'Technician / Technologist', level: 'mid' },
  { label: 'Paramedic / EMT', level: 'mid' },
  { label: 'Ward Boy / Orderly', level: 'junior' },
  { label: 'Administrative / Coordinator', level: 'junior' },
  { label: 'Housekeeping', level: 'junior' },
  { label: 'Security', level: 'junior' },
]

const MAINT_TYPES = [
  'Annual Maintenance Contract (AMC)', 'Comprehensive Maintenance Contract (CMC)',
  'Preventive Maintenance (PM)', 'Corrective / Breakdown Maintenance',
  'Calibration & Validation', 'IT / Software Support Contract',
  'Infrastructure / Civil', 'Safety Audit & Compliance'
]

const PRIORITY = ['Critical', 'High', 'Medium', 'Low']

const COLORS = {
  equipment: '#14b8a6',
  maintenance: '#f59e0b',
  manpower: '#8b5cf6',
  capex: '#f59e0b',
  opex: '#38bdf8',
}

const CHART_PALETTE = ['#14b8a6', '#f59e0b', '#8b5cf6', '#f43f5e', '#38bdf8', '#a3e635', '#fb923c', '#e879f9']

// ─── Helpers ─────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9)
const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)
const fmtNum = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n || 0)

const STORAGE_KEY = 'hospibudget_v2'

const defaultState = () => ({
  meta: {
    department: 'Cardiology & CTVS',
    hospital: 'Max Super Speciality Hospital',
    budgetYear: new Date().getFullYear() + 1,
    preparedBy: '',
    approver: '',
    notes: '',
  },
  equipment: [],
  maintenance: [],
  manpower: [],
})

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = '#14b8a6', icon }) {
  return (
    <div className="glass-card p-5" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="flex items-start justify-between mb-2">
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
      </div>
      <div className="stat-number">{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ─── Equipment Section ────────────────────────────────────────────────────────
function EquipmentSection({ items, onChange }) {
  const emptyForm = {
    name: '', category: EQUIPMENT_CATEGORIES[0], vendor: '', model: '',
    qty: 1, unitCost: '', type: 'CapEx', priority: 'High',
    lifecycleYears: 7, yearOfPurchase: new Date().getFullYear(),
    maintenancePct: 8, notes: ''
  }
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = () => {
    if (!form.name || !form.unitCost) return
    const entry = { ...form, id: editId || uid(), totalCost: (parseFloat(form.unitCost) || 0) * (parseInt(form.qty) || 1) }
    if (editId) onChange(items.map(i => i.id === editId ? entry : i))
    else onChange([...items, entry])
    setForm(emptyForm)
    setShowForm(false)
    setEditId(null)
  }

  const remove = (id) => onChange(items.filter(i => i.id !== id))

  const edit = (item) => {
    setForm({ ...item })
    setEditId(item.id)
    setShowForm(true)
  }

  const totalCapex = items.filter(i => i.type === 'CapEx').reduce((s, i) => s + i.totalCost, 0)
  const totalOpex = items.filter(i => i.type === 'OpEx').reduce((s, i) => s + i.totalCost, 0)

  return (
    <div>
      <SectionHeader
        title="Equipment Budget"
        subtitle={`${items.length} items · CapEx: ${fmt(totalCapex)} · OpEx: ${fmt(totalOpex)}`}
        action={
          <button className="btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm) }}>
            <span>+</span> Add Equipment
          </button>
        }
      />

      {showForm && (
        <div className="glass-card p-5 mb-5" style={{ borderColor: 'rgba(20,184,166,0.3)' }}>
          <h3 style={{ fontFamily: 'var(--font-sora)', fontSize: '0.95rem', fontWeight: 600, marginBottom: 14, color: 'var(--accent-teal)' }}>
            {editId ? '✏️ Edit Equipment' : '➕ New Equipment Item'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Equipment Name *</label>
              <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Echocardiography Machine" />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Category</label>
              <select className="input-field" value={form.category} onChange={e => set('category', e.target.value)}>
                {EQUIPMENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Vendor / Make</label>
              <input className="input-field" value={form.vendor} onChange={e => set('vendor', e.target.value)} placeholder="e.g. Philips, GE Healthcare" />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Model</label>
              <input className="input-field" value={form.model} onChange={e => set('model', e.target.value)} placeholder="Model number" />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Quantity</label>
              <input className="input-field" type="number" min="1" value={form.qty} onChange={e => set('qty', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Unit Cost (₹) *</label>
              <input className="input-field" type="number" min="0" value={form.unitCost} onChange={e => set('unitCost', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Budget Type</label>
              <select className="input-field" value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="CapEx">CapEx (Capital Expenditure)</option>
                <option value="OpEx">OpEx (Operational Expenditure)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Priority</label>
              <select className="input-field" value={form.priority} onChange={e => set('priority', e.target.value)}>
                {PRIORITY.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Service Life (Years)</label>
              <input className="input-field" type="number" min="1" max="30" value={form.lifecycleYears} onChange={e => set('lifecycleYears', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Year of Purchase / Plan</label>
              <input className="input-field" type="number" min="2020" max="2035" value={form.yearOfPurchase} onChange={e => set('yearOfPurchase', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Annual Maintenance (% of cost)</label>
              <input className="input-field" type="number" min="0" max="30" step="0.5" value={form.maintenancePct} onChange={e => set('maintenancePct', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Notes</label>
              <input className="input-field" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Justification, specs, etc." />
            </div>
          </div>
          {form.name && form.unitCost && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(20,184,166,0.07)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              💡 Total Cost: <strong style={{ color: 'var(--accent-teal)' }}>{fmt((parseFloat(form.unitCost)||0) * (parseInt(form.qty)||1))}</strong>
              &nbsp;·&nbsp; Est. Annual Maint: <strong style={{ color: '#f59e0b' }}>{fmt((parseFloat(form.unitCost)||0) * (parseInt(form.qty)||1) * (parseFloat(form.maintenancePct)||0) / 100)}</strong>
              &nbsp;·&nbsp; Replacement in {form.lifecycleYears} yr ({parseInt(form.yearOfPurchase) + parseInt(form.lifecycleYears)})
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn-primary" onClick={save}>{editId ? 'Update' : 'Add Item'}</button>
            <button className="btn-ghost" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm) }}>Cancel</button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🏥</div>
          <div style={{ fontWeight: 500 }}>No equipment added yet</div>
          <div style={{ fontSize: '0.8rem', marginTop: 4 }}>Click "Add Equipment" to start building your equipment budget</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Category</th>
                <th>Vendor / Model</th>
                <th>Qty</th>
                <th>Unit Cost</th>
                <th>Total</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Life</th>
                <th>Maint/yr</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500 }}>{item.name}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{item.category}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{item.vendor}{item.model ? ` / ${item.model}` : ''}</td>
                  <td style={{ fontFamily: 'var(--font-jetbrains)', textAlign: 'right' }}>{item.qty}</td>
                  <td style={{ fontFamily: 'var(--font-jetbrains)', textAlign: 'right' }}>{fmt(item.unitCost)}</td>
                  <td style={{ fontFamily: 'var(--font-jetbrains)', textAlign: 'right', fontWeight: 600, color: 'var(--accent-teal)' }}>{fmt(item.totalCost)}</td>
                  <td><span className={`badge badge-${item.type === 'CapEx' ? 'capex' : 'opex'}`}>{item.type}</span></td>
                  <td><span className={`badge badge-${item.priority.toLowerCase()}`}>{item.priority}</span></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.lifecycleYears} yr</td>
                  <td style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '0.8rem', color: '#f59e0b' }}>{fmt(item.totalCost * item.maintenancePct / 100)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem' }} onClick={() => edit(item)} title="Edit">✏️</button>
                      <button className="btn-danger" onClick={() => remove(item.id)}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Maintenance Section ──────────────────────────────────────────────────────
function MaintenanceSection({ items, equipment, onChange }) {
  const emptyForm = {
    name: '', type: MAINT_TYPES[0], vendor: '', equipmentRef: '',
    annualCost: '', frequency: 'Annual', priority: 'High',
    contractStart: '', contractEnd: '', notes: ''
  }
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = () => {
    if (!form.name || !form.annualCost) return
    const entry = { ...form, id: editId || uid() }
    if (editId) onChange(items.map(i => i.id === editId ? entry : i))
    else onChange([...items, entry])
    setForm(emptyForm)
    setShowForm(false)
    setEditId(null)
  }

  const remove = (id) => onChange(items.filter(i => i.id !== id))
  const edit = (item) => { setForm({ ...item }); setEditId(item.id); setShowForm(true) }

  const total = items.reduce((s, i) => s + (parseFloat(i.annualCost) || 0), 0)

  // Auto-suggest maintenance from equipment
  const suggestedTotal = equipment.reduce((s, eq) => s + (eq.totalCost * eq.maintenancePct / 100), 0)

  return (
    <div>
      <SectionHeader
        title="Maintenance Budget"
        subtitle={`${items.length} contracts/schedules · Annual total: ${fmt(total)}`}
        action={
          <button className="btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm) }}>
            <span>+</span> Add Maintenance
          </button>
        }
      />

      {equipment.length > 0 && (
        <div style={{ padding: '10px 16px', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, marginBottom: 16, fontSize: '0.82rem' }}>
          💡 <strong style={{ color: '#f59e0b' }}>Suggested maintenance budget from Equipment list:</strong>
          <span style={{ color: 'var(--text-secondary)', marginLeft: 6 }}>{fmt(suggestedTotal)} / year (based on % entered per equipment)</span>
        </div>
      )}

      {showForm && (
        <div className="glass-card p-5 mb-5" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
          <h3 style={{ fontFamily: 'var(--font-sora)', fontSize: '0.95rem', fontWeight: 600, marginBottom: 14, color: '#f59e0b' }}>
            {editId ? '✏️ Edit Maintenance' : '➕ New Maintenance Item'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Description *</label>
              <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Cath Lab AMC" />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Maintenance Type</label>
              <select className="input-field" value={form.type} onChange={e => set('type', e.target.value)}>
                {MAINT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Vendor / Agency</label>
              <input className="input-field" value={form.vendor} onChange={e => set('vendor', e.target.value)} placeholder="OEM or third-party" />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Related Equipment</label>
              <select className="input-field" value={form.equipmentRef} onChange={e => set('equipmentRef', e.target.value)}>
                <option value="">— None / General —</option>
                {equipment.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Annual Cost (₹) *</label>
              <input className="input-field" type="number" min="0" value={form.annualCost} onChange={e => set('annualCost', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Frequency</label>
              <select className="input-field" value={form.frequency} onChange={e => set('frequency', e.target.value)}>
                {['Annual','Half-yearly','Quarterly','Monthly','As needed'].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Priority</label>
              <select className="input-field" value={form.priority} onChange={e => set('priority', e.target.value)}>
                {PRIORITY.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Contract Start</label>
              <input className="input-field" type="date" value={form.contractStart} onChange={e => set('contractStart', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Contract End</label>
              <input className="input-field" type="date" value={form.contractEnd} onChange={e => set('contractEnd', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Notes</label>
              <input className="input-field" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Scope, SLA, escalations..." />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn-primary" onClick={save}>{editId ? 'Update' : 'Add Item'}</button>
            <button className="btn-ghost" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm) }}>Cancel</button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🔧</div>
          <div style={{ fontWeight: 500 }}>No maintenance items added yet</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Type</th>
                <th>Vendor</th>
                <th>Frequency</th>
                <th>Priority</th>
                <th>Annual Cost</th>
                <th>Contract Period</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const linkedEq = equipment.find(e => e.id === item.equipmentRef)
                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{item.name}</div>
                      {linkedEq && <div style={{ fontSize: '0.75rem', color: 'var(--accent-teal)' }}>↳ {linkedEq.name}</div>}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.type}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.vendor || '—'}</td>
                    <td style={{ fontSize: '0.8rem' }}>{item.frequency}</td>
                    <td><span className={`badge badge-${item.priority.toLowerCase()}`}>{item.priority}</span></td>
                    <td style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 600, color: '#f59e0b' }}>{fmt(item.annualCost)}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {item.contractStart && item.contractEnd ? `${item.contractStart} → ${item.contractEnd}` : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem' }} onClick={() => edit(item)}>✏️</button>
                        <button className="btn-danger" onClick={() => remove(item.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Manpower Section ─────────────────────────────────────────────────────────
function ManpowerSection({ items, onChange }) {
  const emptyForm = {
    role: STAFF_CATEGORIES[0].label, customRole: '', count: 1,
    grossSalary: '', hra: 10, ta: 5, pf: 12, gratuity: 4.81,
    medicalAllowance: 1250, incentive: 0, notes: ''
  }
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [useCustom, setUseCustom] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const calcPerEmployee = (f) => {
    const base = parseFloat(f.grossSalary) || 0
    const hra = base * (parseFloat(f.hra) || 0) / 100
    const ta = base * (parseFloat(f.ta) || 0) / 100
    const pf = base * (parseFloat(f.pf) || 0) / 100
    const grat = base * (parseFloat(f.gratuity) || 0) / 100
    const med = parseFloat(f.medicalAllowance) || 0
    const inc = parseFloat(f.incentive) || 0
    return base + hra + ta + pf + grat + med + inc
  }

  const save = () => {
    if ((!form.role && !form.customRole) || !form.grossSalary) return
    const monthly = calcPerEmployee(form)
    const annual = monthly * 12 * (parseInt(form.count) || 1)
    const entry = {
      ...form,
      role: useCustom ? form.customRole : form.role,
      id: editId || uid(),
      monthlyCTC: monthly,
      annualCTC: annual,
    }
    if (editId) onChange(items.map(i => i.id === editId ? entry : i))
    else onChange([...items, entry])
    setForm(emptyForm)
    setShowForm(false)
    setEditId(null)
  }

  const remove = (id) => onChange(items.filter(i => i.id !== id))
  const edit = (item) => { setForm({ ...item }); setEditId(item.id); setShowForm(true) }

  const totalHeadcount = items.reduce((s, i) => s + (parseInt(i.count) || 1), 0)
  const totalAnnual = items.reduce((s, i) => s + (i.annualCTC || 0), 0)

  return (
    <div>
      <SectionHeader
        title="Manpower Budget"
        subtitle={`${totalHeadcount} staff · Annual CTC: ${fmt(totalAnnual)}`}
        action={
          <button className="btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm) }}>
            <span>+</span> Add Staff
          </button>
        }
      />

      {showForm && (
        <div className="glass-card p-5 mb-5" style={{ borderColor: 'rgba(139,92,246,0.3)' }}>
          <h3 style={{ fontFamily: 'var(--font-sora)', fontSize: '0.95rem', fontWeight: 600, marginBottom: 14, color: '#8b5cf6' }}>
            {editId ? '✏️ Edit Staff Entry' : '➕ New Staff Entry'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Role / Designation
                <label style={{ marginLeft: 10, fontSize: '0.72rem', color: 'var(--accent-teal)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={useCustom} onChange={e => setUseCustom(e.target.checked)} style={{ marginRight: 4 }} />
                  Custom
                </label>
              </label>
              {useCustom
                ? <input className="input-field" value={form.customRole} onChange={e => set('customRole', e.target.value)} placeholder="Enter designation" />
                : <select className="input-field" value={form.role} onChange={e => set('role', e.target.value)}>
                    {STAFF_CATEGORIES.map(c => <option key={c.label}>{c.label}</option>)}
                  </select>
              }
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>No. of Posts</label>
              <input className="input-field" type="number" min="1" value={form.count} onChange={e => set('count', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Gross Monthly Salary (₹) *</label>
              <input className="input-field" type="number" min="0" value={form.grossSalary} onChange={e => set('grossSalary', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>HRA (%)</label>
              <input className="input-field" type="number" min="0" max="50" value={form.hra} onChange={e => set('hra', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Transport Allowance (%)</label>
              <input className="input-field" type="number" min="0" max="20" value={form.ta} onChange={e => set('ta', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>PF / ESIC Employer (%)</label>
              <input className="input-field" type="number" min="0" max="20" step="0.01" value={form.pf} onChange={e => set('pf', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Gratuity (%)</label>
              <input className="input-field" type="number" min="0" max="10" step="0.01" value={form.gratuity} onChange={e => set('gratuity', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Medical Allowance (₹/mo)</label>
              <input className="input-field" type="number" min="0" value={form.medicalAllowance} onChange={e => set('medicalAllowance', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Incentive / Performance (₹/mo)</label>
              <input className="input-field" type="number" min="0" value={form.incentive} onChange={e => set('incentive', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Notes</label>
              <input className="input-field" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Shift pattern, qualifications..." />
            </div>
          </div>
          {form.grossSalary && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(139,92,246,0.07)', borderRadius: 8, fontSize: '0.82rem', display: 'flex', gap: 20 }}>
              <span>Monthly CTC/person: <strong style={{ color: '#8b5cf6' }}>{fmt(calcPerEmployee(form))}</strong></span>
              <span>Annual for {form.count} staff: <strong style={{ color: 'var(--accent-teal)' }}>{fmt(calcPerEmployee(form) * 12 * (parseInt(form.count)||1))}</strong></span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn-primary" onClick={save}>{editId ? 'Update' : 'Add Entry'}</button>
            <button className="btn-ghost" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm) }}>Cancel</button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>👥</div>
          <div style={{ fontWeight: 500 }}>No staff entries added yet</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Posts</th>
                <th>Gross Salary</th>
                <th>Total CTC/mo</th>
                <th>Annual CTC</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500 }}>{item.role}</td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-jetbrains)', fontWeight: 700, color: '#8b5cf6' }}>{item.count}</td>
                  <td style={{ fontFamily: 'var(--font-jetbrains)' }}>{fmt(item.grossSalary)}</td>
                  <td style={{ fontFamily: 'var(--font-jetbrains)' }}>{fmt(item.monthlyCTC)}</td>
                  <td style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 600, color: '#8b5cf6' }}>{fmt(item.annualCTC)}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.notes || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem' }} onClick={() => edit(item)}>✏️</button>
                      <button className="btn-danger" onClick={() => remove(item.id)}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
              <tr style={{ background: 'rgba(139,92,246,0.05)' }}>
                <td colSpan={1} style={{ fontWeight: 700, color: '#8b5cf6' }}>TOTAL</td>
                <td style={{ textAlign: 'center', fontFamily: 'var(--font-jetbrains)', fontWeight: 700 }}>{totalHeadcount}</td>
                <td colSpan={2}></td>
                <td style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, color: '#8b5cf6' }}>{fmt(totalAnnual)}</td>
                <td colSpan={2}></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Summary / Dashboard ──────────────────────────────────────────────────────
function SummarySection({ data }) {
  const { equipment, maintenance, manpower, meta } = data

  const totalEquip = equipment.reduce((s, i) => s + i.totalCost, 0)
  const totalCapex = equipment.filter(i => i.type === 'CapEx').reduce((s, i) => s + i.totalCost, 0)
  const totalOpex = equipment.filter(i => i.type === 'OpEx').reduce((s, i) => s + i.totalCost, 0)
  const totalMaint = maintenance.reduce((s, i) => s + (parseFloat(i.annualCost) || 0), 0)
  const totalManpower = manpower.reduce((s, i) => s + (i.annualCTC || 0), 0)
  const totalHeadcount = manpower.reduce((s, i) => s + (parseInt(i.count) || 1), 0)
  const grandTotal = totalEquip + totalMaint + totalManpower

  const pieData = [
    { name: 'Equipment', value: totalEquip, color: COLORS.equipment },
    { name: 'Maintenance', value: totalMaint, color: COLORS.maintenance },
    { name: 'Manpower', value: totalManpower, color: COLORS.manpower },
  ].filter(d => d.value > 0)

  // Equipment by category bar
  const catMap = {}
  equipment.forEach(eq => {
    if (!catMap[eq.category]) catMap[eq.category] = 0
    catMap[eq.category] += eq.totalCost
  })
  const catData = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name: name.split(' ')[0], value }))

  // Manpower by category
  const mpMap = {}
  manpower.forEach(mp => {
    if (!mpMap[mp.role]) mpMap[mp.role] = { count: 0, cost: 0 }
    mpMap[mp.role].count += parseInt(mp.count) || 1
    mpMap[mp.role].cost += mp.annualCTC || 0
  })

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: '0.82rem' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{payload[0].name}</div>
          <div style={{ color: 'var(--accent-teal)' }}>{fmt(payload[0].value)}</div>
        </div>
      )
    }
    return null
  }

  return (
    <div>
      <SectionHeader title="Budget Summary & Analytics" subtitle={`${meta.department} · FY ${meta.budgetYear}`} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Grand Total Budget" value={fmt(grandTotal)} sub="All categories combined" color="#14b8a6" icon="💰" />
        <StatCard label="Equipment (CapEx)" value={fmt(totalCapex)} sub="Capital expenditure" color="#f59e0b" icon="🏗️" />
        <StatCard label="Equipment (OpEx)" value={fmt(totalOpex)} sub="Operational expenditure" color="#38bdf8" icon="⚙️" />
        <StatCard label="Maintenance" value={fmt(totalMaint)} sub="Annual contracts & PM" color="#f59e0b" icon="🔧" />
        <StatCard label="Manpower (Annual)" value={fmt(totalManpower)} sub={`${totalHeadcount} staff members`} color="#8b5cf6" icon="👥" />
        <StatCard label="Cost Per Staff" value={totalHeadcount ? fmt(totalManpower / totalHeadcount) : '—'} sub="Average annual CTC" color="#a3e635" icon="📊" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        {pieData.length > 0 && (
          <div className="glass-card p-5">
            <h3 style={{ fontFamily: 'var(--font-sora)', fontSize: '0.9rem', fontWeight: 600, marginBottom: 14, color: 'var(--text-secondary)' }}>Budget Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value, entry) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {catData.length > 0 && (
          <div className="glass-card p-5">
            <h3 style={{ fontFamily: 'var(--font-sora)', fontSize: '0.9rem', fontWeight: 600, marginBottom: 14, color: 'var(--text-secondary)' }}>Equipment by Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={catData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Breakdown table */}
      <div className="glass-card p-5">
        <h3 style={{ fontFamily: 'var(--font-sora)', fontSize: '0.9rem', fontWeight: 600, marginBottom: 14, color: 'var(--text-secondary)' }}>Budget Breakdown Summary</h3>
        <table className="data-table">
          <thead>
            <tr><th>Category</th><th>Items/Staff</th><th>Amount</th><th>% of Total</th></tr>
          </thead>
          <tbody>
            {[
              { name: 'Equipment — Capital (CapEx)', count: equipment.filter(i=>i.type==='CapEx').length + ' items', val: totalCapex, color: '#f59e0b' },
              { name: 'Equipment — Operational (OpEx)', count: equipment.filter(i=>i.type==='OpEx').length + ' items', val: totalOpex, color: '#38bdf8' },
              { name: 'Maintenance & AMC', count: maintenance.length + ' contracts', val: totalMaint, color: '#f59e0b' },
              { name: 'Manpower & Salaries', count: totalHeadcount + ' staff', val: totalManpower, color: '#8b5cf6' },
            ].map(row => (
              <tr key={row.name}>
                <td style={{ fontWeight: 500 }}>{row.name}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{row.count}</td>
                <td style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 600, color: row.color }}>{fmt(row.val)}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="progress-bar" style={{ width: 80 }}>
                      <div className="progress-fill" style={{ width: `${grandTotal ? (row.val / grandTotal * 100) : 0}%`, background: `linear-gradient(90deg, ${row.color}88, ${row.color})` }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '0.8rem', color: row.color }}>
                      {grandTotal ? (row.val / grandTotal * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            <tr style={{ background: 'rgba(20,184,166,0.06)', borderTop: '2px solid var(--border)' }}>
              <td style={{ fontWeight: 700, color: 'var(--accent-teal)', fontFamily: 'var(--font-sora)' }}>GRAND TOTAL</td>
              <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{equipment.length + maintenance.length} items · {totalHeadcount} staff</td>
              <td style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, color: 'var(--accent-teal)', fontSize: '1rem' }}>{fmt(grandTotal)}</td>
              <td style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, color: 'var(--text-secondary)' }}>100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function BudgetPlanner() {
  const [data, setData] = useState(null)
  const [activeTab, setActiveTab] = useState('summary')
  const [saved, setSaved] = useState(false)
  const [showMeta, setShowMeta] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      setData(stored ? JSON.parse(stored) : defaultState())
    } catch {
      setData(defaultState())
    }
  }, [])

  const save = useCallback((d) => {
    setData(d)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(d))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {}
  }, [])

  const update = useCallback((key, val) => {
    setData(d => {
      const nd = { ...d, [key]: val }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(nd)) } catch {}
      return nd
    })
  }, [])

  const updateMeta = (k, v) => {
    setData(d => {
      const nd = { ...d, meta: { ...d.meta, [k]: v } }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(nd)) } catch {}
      return nd
    })
  }

  const clearAll = () => {
    if (confirm('Clear all budget data? This cannot be undone.')) {
      const fresh = defaultState()
      setData(fresh)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh)) } catch {}
    }
  }

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.meta.department.replace(/\s+/g, '_')}_Budget_FY${data.meta.budgetYear}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportCSV = () => {
    const rows = [['Type', 'Name', 'Category/Role', 'Quantity/Posts', 'Unit/Monthly Cost', 'Total/Annual Cost', 'Priority/Notes']]
    data.equipment.forEach(e => rows.push(['Equipment', e.name, e.category, e.qty, e.unitCost, e.totalCost, e.priority]))
    data.maintenance.forEach(m => rows.push(['Maintenance', m.name, m.type, 1, m.annualCost, m.annualCost, m.priority]))
    data.manpower.forEach(mp => rows.push(['Manpower', mp.role, 'Staff', mp.count, mp.grossSalary, mp.annualCTC, mp.notes]))
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.meta.department.replace(/\s+/g, '_')}_Budget_FY${data.meta.budgetYear}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>⏳</div>
          <div>Loading HospiBudget...</div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'summary', label: 'Dashboard', icon: '📊' },
    { id: 'equipment', label: 'Equipment', icon: '🏥' },
    { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { id: 'manpower', label: 'Manpower', icon: '👥' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        height: 60,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 700,
          }}>❤️</div>
          <div>
            <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1 }}>HospiBudget</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>DEPARTMENT BUDGET PLANNER</div>
          </div>
        </div>

        <div style={{ height: 30, width: 1, background: 'var(--border)', margin: '0 4px' }} />

        <button onClick={() => setShowMeta(!showMeta)} style={{
          background: 'none', border: '1px solid var(--border)', borderRadius: 8,
          padding: '5px 12px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.82rem',
          display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
        }}>
          <span>🏥</span>
          <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {data.meta.department} · FY {data.meta.budgetYear}
          </span>
          <span style={{ fontSize: '0.7rem' }}>▼</span>
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {saved && (
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: 4 }}>
              ✓ Saved
            </span>
          )}
          <button className="btn-ghost" onClick={exportCSV} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>📥 CSV</button>
          <button className="btn-ghost" onClick={exportJSON} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>📥 JSON</button>
          <button onClick={clearAll} style={{
            background: 'none', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 8,
            padding: '6px 12px', cursor: 'pointer', color: '#f43f5e', fontSize: '0.8rem',
          }}>🗑 Clear</button>
        </div>
      </header>

      {/* Meta panel */}
      {showMeta && (
        <div style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          padding: '16px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 12,
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Hospital Name</label>
            <input className="input-field" value={data.meta.hospital} onChange={e => updateMeta('hospital', e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Department</label>
            <select className="input-field" value={data.meta.department} onChange={e => updateMeta('department', e.target.value)}>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Budget Year</label>
            <input className="input-field" type="number" min="2024" max="2035" value={data.meta.budgetYear} onChange={e => updateMeta('budgetYear', e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Prepared By</label>
            <input className="input-field" value={data.meta.preparedBy} onChange={e => updateMeta('preparedBy', e.target.value)} placeholder="Name & Designation" />
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Approver</label>
            <input className="input-field" value={data.meta.approver} onChange={e => updateMeta('approver', e.target.value)} placeholder="HOD / CFO" />
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Notes</label>
            <input className="input-field" value={data.meta.notes} onChange={e => updateMeta('notes', e.target.value)} placeholder="Budget cycle, assumptions..." />
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '8px 24px',
        display: 'flex',
        gap: 4,
        overflowX: 'auto',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ flex: 1, padding: '24px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
        <div style={{ animation: 'slideUp 0.3s ease-out' }}>
          {activeTab === 'summary' && <SummarySection data={data} />}
          {activeTab === 'equipment' && (
            <EquipmentSection items={data.equipment} onChange={val => update('equipment', val)} />
          )}
          {activeTab === 'maintenance' && (
            <MaintenanceSection items={data.maintenance} equipment={data.equipment} onChange={val => update('maintenance', val)} />
          )}
          {activeTab === 'manpower' && (
            <ManpowerSection items={data.manpower} onChange={val => update('manpower', val)} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '12px 24px',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        background: 'var(--bg-secondary)',
      }}>
        HospiBudget · Department Budget Planning Tool · Data stored locally in browser · Built for corporate hospital finance teams
      </footer>
    </div>
  )
}
