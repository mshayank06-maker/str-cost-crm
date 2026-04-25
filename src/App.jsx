import React, { useEffect, useMemo, useState } from "react";
import "./index.css";
import { supabase } from "./supabaseClient";

const starterProperties = [
  { id: "P-001", name: "120XY SL 2B", address: "17 Seagull Lane", beds: 2, approvalLimit: 100 },
  { id: "P-002", name: "503WG 1B", address: "Adriatic Apartments, 20 Western Gateway", beds: 1, approvalLimit: 100 },
  { id: "P-003", name: "204DRY 2B", address: "37 Commercial Road", beds: 2, approvalLimit: 100 },
  { id: "P-004", name: "51COR 2B", address: "Adriatic Apartments, 20 Western Gateway", beds: 2, approvalLimit: 100 },
  { id: "P-005", name: "240XY 2B", address: "Adriatic Apartments, 20 Western Gateway", beds: 2, approvalLimit: 100 },
  { id: "P-006", name: "06ROS 3B", address: "Adriatic Apartments, 20 Western Gateway", beds: 3, approvalLimit: 100 },
  { id: "P-007", name: "05OCE 2B", address: "16 Western Gateway", beds: 2, approvalLimit: 100 },
  { id: "P-008", name: "1801WG 3B", address: "Unit C, 14 Western Gateway", beds: 3, approvalLimit: 100 },
  { id: "P-009", name: "06COM 1B", address: "Royal Crest Avenue", beds: 1, approvalLimit: 100 },
  { id: "P-010", name: "42ALA 3B", address: "18 Western Gateway", beds: 3, approvalLimit: 100 },
  { id: "P-011", name: "67OXY 1B", address: "Western Gateway", beds: 1, approvalLimit: 100 },
  { id: "P-012", name: "402DRI 2B", address: "Atlantis Avenue", beds: 2, approvalLimit: 100 },
  { id: "P-013", name: "53OXY 1B", address: "Western Gateway", beds: 1, approvalLimit: 100 },
  { id: "P-014", name: "401DRI 2B", address: "Atlantis Avenue", beds: 2, approvalLimit: 100 },
  { id: "P-015", name: "03OXY 2B", address: "Western Gateway", beds: 2, approvalLimit: 100 },
  { id: "P-016", name: "139OXY 2B", address: "Western Gateway", beds: 2, approvalLimit: 100 },
  { id: "P-017", name: "37ADR 1B", address: "Western Gateway", beds: 1, approvalLimit: 100 },
  { id: "P-018", name: "1006BAL", address: "Balearic Apartments, 15 Western Gateway", beds: 1, approvalLimit: 100 },
  { id: "P-019", name: "1007BAL", address: "18 Western Gateway", beds: 1, approvalLimit: 100 },
  { id: "P-020", name: "207 FAT 2B", address: "19 Atlantis Avenue", beds: 2, approvalLimit: 100 },
  { id: "P-021", name: "30MAN 2B", address: "Western Gateway", beds: 2, approvalLimit: 100 },
  { id: "P-022", name: "129 ADR 1B", address: "Western Gateway", beds: 1, approvalLimit: 100 },
  { id: "P-023", name: "103 SAI 2B", address: "Atlantis Avenue", beds: 2, approvalLimit: 100 },
  { id: "P-024", name: "1201 12WG 3B", address: "Garvary Road", beds: 3, approvalLimit: 100 },
  { id: "P-025", name: "28 ELS 2B", address: "Western Gateway", beds: 2, approvalLimit: 100 },
  { id: "P-026", name: "22 HIE 2B", address: "Blair Street", beds: 2, approvalLimit: 100 },
  { id: "P-027", name: "35COR 2B", address: "14 Western Gateway", beds: 2, approvalLimit: 100 },
  { id: "P-028", name: "209DRI 2B", address: "28 Elsdale Street", beds: 2, approvalLimit: 100 },
  { id: "P-029", name: "940XY 2B", address: "17 Bermuda Way", beds: 2, approvalLimit: 100 },
  { id: "P-030", name: "706 12WG", address: "Western Gateway, Unit D", beds: 1, approvalLimit: 100 },
  { id: "P-031", name: "2 PLA 1B", address: "13 Derny Avenue", beds: 1, approvalLimit: 100 },
  { id: "P-032", name: "404 DRI 2B", address: "19 Atlantis Avenue", beds: 2, approvalLimit: 100 },
];

const priceGuide = [
  { task: "Light bulb replacement", category: "Electrical", hourlyRate: 10 },
  { task: "Appliance check / reset", category: "Appliances", hourlyRate: 40 },
  { task: "Painting and décor touch-up", category: "Painting & Décor", hourlyRate: 40 },
  { task: "Clogged sink", category: "Plumbing", hourlyRate: 40 },
  { task: "Locks / lock adjustment", category: "Locks", hourlyRate: 30 },
  { task: "Misc plumbing", category: "Plumbing", hourlyRate: 40 },
  { task: "Misc electrical", category: "Electrical", hourlyRate: 40 },
  { task: "Misc handyman", category: "Handyman", hourlyRate: 40 },
  { task: "Flooring repair", category: "Flooring", hourlyRate: 40 },
  { task: "Toilet blockage", category: "Plumbing", hourlyRate: 30 },
  { task: "Shower / silicone reseal", category: "Plumbing", hourlyRate: 40 },
  { task: "Door alignment / easing", category: "Handyman", hourlyRate: 50 },
  { task: "Curtain / blind fix", category: "Handyman", hourlyRate: 40 },
  { task: "Smoke alarm battery / replacement", category: "Electrical", hourlyRate: 30 },
  { task: "Extractor fan clean / minor fix", category: "Electrical", hourlyRate: 40 },
  { task: "Fridge / freezer defrost service", category: "Appliances", hourlyRate: 40 },
];

function currency(value) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(value || 0));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-GB");
}

function formatMonth(value) {
  if (value === "all") return "All Months";
  const [year, month] = value.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleString("en-GB", { month: "long", year: "numeric" });
}

function generateInvoiceNumber(invoices) {
  const year = new Date().getFullYear();
  return `INV-${year}-${String(invoices.length + 1).padStart(4, "0")}`;
}

function propertyToDb(p) {
  return {
    id: p.id,
    name: p.name,
    address: p.address,
    beds: Number(p.beds || 0),
    approval_limit: Number(p.approvalLimit || 0),
  };
}

function propertyFromDb(p) {
  return {
    id: p.id,
    name: p.name,
    address: p.address,
    beds: p.beds,
    approvalLimit: p.approval_limit,
  };
}

function calculateJobLabour(job) {
  return Number(job.labourHours || 0) * Number(job.labourRate || 0);
}

function calculateJobTotal(job) {
  return calculateJobLabour(job) + Number(job.materialCost || 0);
}

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const [properties, setProperties] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [invoiceItems, setInvoiceItems] = useState([]);

  const [selectedPropertyId, setSelectedPropertyId] = useState("P-001");
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [dashboardMonthFilter, setDashboardMonthFilter] = useState("all");

  const [invoiceForm, setInvoiceForm] = useState({
    invoiceDate: todayISO(),
    dueDate: todayISO(),
    propertyId: "P-001",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    await supabase
      .from("properties")
      .upsert(starterProperties.map(propertyToDb), { onConflict: "id" });

    const [propertiesRes, maintenanceRes, invoicesRes, invoiceItemsRes] = await Promise.all([
      supabase.from("properties").select("*").order("id"),
      supabase.from("maintenance_jobs").select("*").order("created_at", { ascending: false }),
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      supabase.from("invoice_items").select("*"),
    ]);

    setProperties(propertiesRes.error ? starterProperties : (propertiesRes.data || []).map(propertyFromDb));

    setMaintenance(
      (maintenanceRes.data || []).map((job) => ({
        id: job.id,
        propertyId: job.property_id,
        propertyName: job.property_name,
        propertyAddress: job.property_address,
        title: job.title,
        taskName: job.task_name,
        category: job.category,
        assignedTo: job.assigned_to,
        status: job.status,
        labourHours: job.labour_hours,
        labourRate: job.labour_rate,
        materialCost: job.material_cost,
        invoiceStatus: job.invoice_status,
      }))
    );

    setInvoices(
      (invoicesRes.data || []).map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoice_number,
        invoiceDate: inv.invoice_date,
        dueDate: inv.due_date,
        propertyId: inv.property_id,
        propertyName: inv.property_name,
        propertyAddress: inv.property_address,
        labourSubtotal: inv.labour_subtotal,
        materialsTotal: inv.materials_total,
        total: inv.total,
        status: inv.status,
      }))
    );

    setInvoiceItems(
      (invoiceItemsRes.data || []).map((item) => ({
        id: item.id,
        invoiceId: item.invoice_id,
        jobId: item.job_id,
        title: item.title,
        taskName: item.task_name,
        labourHours: item.labour_hours,
        labourRate: item.labour_rate,
        labourCharge: item.labour_charge,
        materialCost: item.material_cost,
        totalCost: item.total_cost,
      }))
    );

    setLoading(false);
  }

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId) || properties[0];
  const selectedMaintenance = maintenance.find((m) => m.id === selectedMaintenanceId) || null;
  const selectedInvoice = invoices.find((i) => i.id === selectedInvoiceId) || null;

  const selectedInvoiceWithItems = selectedInvoice
    ? { ...selectedInvoice, items: invoiceItems.filter((item) => item.invoiceId === selectedInvoice.id) }
    : null;

  const maintenanceWithCost = useMemo(
    () => maintenance.map((job) => ({ ...job, labourCharge: calculateJobLabour(job), totalCost: calculateJobTotal(job) })),
    [maintenance]
  );

  const invoiceJobs = useMemo(() => {
    return maintenanceWithCost.filter(
      (job) => job.propertyId === invoiceForm.propertyId && job.status === "Completed" && job.invoiceStatus !== "Billed"
    );
  }, [maintenanceWithCost, invoiceForm.propertyId]);

  const invoiceMonthOptions = useMemo(() => {
    const months = invoices.map((inv) => inv.invoiceDate?.slice(0, 7)).filter(Boolean);
    return ["all", ...Array.from(new Set(months))];
  }, [invoices]);

  const filteredDashboardInvoices = useMemo(() => {
    if (dashboardMonthFilter === "all") return invoices;
    return invoices.filter((inv) => inv.invoiceDate?.slice(0, 7) === dashboardMonthFilter);
  }, [invoices, dashboardMonthFilter]);

  const dashboard = useMemo(() => {
    return {
      maintenanceCostsCharged: filteredDashboardInvoices.reduce((sum, inv) => sum + Number(inv.labourSubtotal || 0), 0),
      openMaintenance: maintenanceWithCost.filter((j) => j.status !== "Completed").length,
      invoices: filteredDashboardInvoices.length,
    };
  }, [filteredDashboardInvoices, maintenanceWithCost]);

  async function addMaintenance() {
    const property = selectedProperty || properties[0];
    const guide = priceGuide[0];
    if (!property) return;

    const job = {
      id: `JOB-${Date.now()}`,
      propertyId: property.id,
      propertyName: property.name,
      propertyAddress: property.address,
      title: "New Maintenance Job",
      taskName: guide.task,
      category: guide.category,
      assignedTo: "Inhouse Handyman",
      status: "Open",
      labourHours: 1,
      labourRate: guide.hourlyRate,
      materialCost: 0,
      invoiceStatus: "Not Started",
    };

    const { error } = await supabase.from("maintenance_jobs").insert({
      id: job.id,
      property_id: job.propertyId,
      property_name: job.propertyName,
      property_address: job.propertyAddress,
      title: job.title,
      task_name: job.taskName,
      category: job.category,
      assigned_to: job.assignedTo,
      status: job.status,
      labour_hours: job.labourHours,
      labour_rate: job.labourRate,
      material_cost: job.materialCost,
      invoice_status: job.invoiceStatus,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setMaintenance((prev) => [job, ...prev]);
    setSelectedMaintenanceId(job.id);
  }

  async function updateMaintenance(field, value) {
    const numeric = ["labourHours", "labourRate", "materialCost"];
    const updatedValue = numeric.includes(field) ? Number(value) : value;

    const updated = maintenance.map((job) =>
      job.id === selectedMaintenanceId ? { ...job, [field]: updatedValue } : job
    );

    setMaintenance(updated);

    const job = updated.find((j) => j.id === selectedMaintenanceId);
    if (!job) return;

    await supabase
      .from("maintenance_jobs")
      .update({
        property_id: job.propertyId,
        property_name: job.propertyName,
        property_address: job.propertyAddress,
        title: job.title,
        task_name: job.taskName,
        category: job.category,
        assigned_to: job.assignedTo,
        status: job.status,
        labour_hours: job.labourHours,
        labour_rate: job.labourRate,
        material_cost: job.materialCost,
        invoice_status: job.invoiceStatus,
      })
      .eq("id", job.id);
  }

  async function changeMaintenanceProperty(propertyId) {
    const property = properties.find((p) => p.id === propertyId);
    if (!property || !selectedMaintenance) return;

    const updatedJob = {
      ...selectedMaintenance,
      propertyId: property.id,
      propertyName: property.name,
      propertyAddress: property.address,
    };

    setMaintenance((prev) => prev.map((job) => (job.id === selectedMaintenanceId ? updatedJob : job)));

    await supabase
      .from("maintenance_jobs")
      .update({
        property_id: updatedJob.propertyId,
        property_name: updatedJob.propertyName,
        property_address: updatedJob.propertyAddress,
      })
      .eq("id", updatedJob.id);
  }

  async function applyPriceGuide(taskName) {
    const guide = priceGuide.find((item) => item.task === taskName);
    if (!guide || !selectedMaintenance) return;

    const updatedJob = {
      ...selectedMaintenance,
      taskName: guide.task,
      category: guide.category,
      labourRate: guide.hourlyRate,
    };

    setMaintenance((prev) => prev.map((job) => (job.id === selectedMaintenanceId ? updatedJob : job)));

    await supabase
      .from("maintenance_jobs")
      .update({
        task_name: updatedJob.taskName,
        category: updatedJob.category,
        labour_rate: updatedJob.labourRate,
      })
      .eq("id", updatedJob.id);
  }

  async function deleteMaintenanceJob(jobId) {
    const job = maintenance.find((m) => m.id === jobId);

    if (job?.invoiceStatus === "Billed") {
      alert("Delete the invoice first before removing this maintenance job.");
      return;
    }

    await supabase.from("maintenance_jobs").delete().eq("id", jobId);
    setMaintenance((prev) => prev.filter((job) => job.id !== jobId));

    if (selectedMaintenanceId === jobId) setSelectedMaintenanceId("");
  }

  async function createInvoice() {
    const property = properties.find((p) => p.id === invoiceForm.propertyId);
    if (!property || invoiceJobs.length === 0) return;

    const labourSubtotal = invoiceJobs.reduce((sum, job) => sum + calculateJobLabour(job), 0);
    const materialsTotal = invoiceJobs.reduce((sum, job) => sum + Number(job.materialCost || 0), 0);

    const invoice = {
      id: `INVREC-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(invoices),
      invoiceDate: invoiceForm.invoiceDate,
      dueDate: invoiceForm.dueDate,
      propertyId: property.id,
      propertyName: property.name,
      propertyAddress: property.address,
      labourSubtotal,
      materialsTotal,
      total: labourSubtotal + materialsTotal,
      status: "Draft",
    };

    await supabase.from("invoices").insert({
      id: invoice.id,
      invoice_number: invoice.invoiceNumber,
      invoice_date: invoice.invoiceDate,
      due_date: invoice.dueDate,
      property_id: invoice.propertyId,
      property_name: invoice.propertyName,
      property_address: invoice.propertyAddress,
      labour_subtotal: invoice.labourSubtotal,
      materials_total: invoice.materialsTotal,
      total: invoice.total,
      status: invoice.status,
    });

    const items = invoiceJobs.map((job) => ({
      id: `ITEM-${job.id}-${Date.now()}`,
      invoiceId: invoice.id,
      jobId: job.id,
      title: job.title,
      taskName: job.taskName,
      labourHours: job.labourHours,
      labourRate: job.labourRate,
      labourCharge: calculateJobLabour(job),
      materialCost: job.materialCost,
      totalCost: calculateJobTotal(job),
    }));

    await supabase.from("invoice_items").insert(
      items.map((item) => ({
        id: item.id,
        invoice_id: item.invoiceId,
        job_id: item.jobId,
        title: item.title,
        task_name: item.taskName,
        labour_hours: item.labourHours,
        labour_rate: item.labourRate,
        labour_charge: item.labourCharge,
        material_cost: item.materialCost,
        total_cost: item.totalCost,
      }))
    );

    const jobIds = invoiceJobs.map((job) => job.id);
    await supabase.from("maintenance_jobs").update({ invoice_status: "Billed" }).in("id", jobIds);

    setInvoices((prev) => [invoice, ...prev]);
    setInvoiceItems((prev) => [...items, ...prev]);
    setMaintenance((prev) => prev.map((job) => (jobIds.includes(job.id) ? { ...job, invoiceStatus: "Billed" } : job)));

    setSelectedInvoiceId(invoice.id);
    setActiveTab("invoices");
  }

  async function deleteInvoice(invoiceId) {
    const relatedItems = invoiceItems.filter((item) => item.invoiceId === invoiceId);
    const jobIds = relatedItems.map((item) => item.jobId);

    await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);
    await supabase.from("invoices").delete().eq("id", invoiceId);

    if (jobIds.length > 0) {
      await supabase.from("maintenance_jobs").update({ invoice_status: "Pending" }).in("id", jobIds);
    }

    setInvoiceItems((prev) => prev.filter((item) => item.invoiceId !== invoiceId));
    setInvoices((prev) => prev.filter((invoice) => invoice.id !== invoiceId));
    setMaintenance((prev) => prev.map((job) => (jobIds.includes(job.id) ? { ...job, invoiceStatus: "Pending" } : job)));
    setSelectedInvoiceId("");
  }

  async function updateInvoiceStatus(invoiceId, status) {
    await supabase.from("invoices").update({ status }).eq("id", invoiceId);
    setInvoices((prev) => prev.map((invoice) => (invoice.id === invoiceId ? { ...invoice, status } : invoice)));
  }

  async function addProperty() {
    const property = {
      id: `P-${String(properties.length + 1).padStart(3, "0")}`,
      name: `New Property ${properties.length + 1}`,
      address: "Enter address",
      beds: 1,
      approvalLimit: 100,
    };

    await supabase.from("properties").insert(propertyToDb(property));
    setProperties((prev) => [...prev, property]);
    setSelectedPropertyId(property.id);
  }

  async function updateProperty(field, value) {
    const numeric = ["beds", "approvalLimit"];
    const updatedValue = numeric.includes(field) ? Number(value) : value;

    const updated = properties.map((p) => (p.id === selectedPropertyId ? { ...p, [field]: updatedValue } : p));
    setProperties(updated);

    const property = updated.find((p) => p.id === selectedPropertyId);
    if (property) await supabase.from("properties").update(propertyToDb(property)).eq("id", property.id);
  }

  if (loading) return <div className="loading-screen">Loading CRM...</div>;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <h2>OPS CRM</h2>
          <p>STR Cost Control</p>
        </div>

        <button type="button" className={activeTab === "dashboard" ? "nav-btn active" : "nav-btn"} onClick={() => setActiveTab("dashboard")}>Dashboard</button>
        <button type="button" className={activeTab === "maintenance" ? "nav-btn active" : "nav-btn"} onClick={() => setActiveTab("maintenance")}>Maintenance</button>
        <button type="button" className={activeTab === "invoices" ? "nav-btn active" : "nav-btn"} onClick={() => setActiveTab("invoices")}>Invoices</button>
        <button type="button" className={activeTab === "properties" ? "nav-btn active" : "nav-btn"} onClick={() => setActiveTab("properties")}>Properties</button>
      </aside>

      <main className="main-content">
        <header className="topbar no-print">
          <div>
            <h1>Internal CRM Dashboard</h1>
            <p>Premium operations control for maintenance, invoices and properties.</p>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <>
            <div className="dashboard-filter-card">
              <label>Filter invoices by month</label>
              <select value={dashboardMonthFilter} onChange={(e) => setDashboardMonthFilter(e.target.value)}>
                {invoiceMonthOptions.map((month) => (
                  <option key={month} value={month}>{formatMonth(month)}</option>
                ))}
              </select>
            </div>

            <section className="stats-grid">
              <StatCard title="Maintenance Charged" value={currency(dashboard.maintenanceCostsCharged)} />
              <StatCard title="Open Maintenance" value={dashboard.openMaintenance} />
              <StatCard title="Invoices" value={dashboard.invoices} />
            </section>
          </>
        )}

        {activeTab === "maintenance" && (
          <div className="editor-grid">
            <section className="panel list-panel">
              <div className="section-head">
                <h3>Maintenance Jobs</h3>
                <button className="action-btn" onClick={addMaintenance}>Add Job</button>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Job</th><th>Property</th><th>Task</th><th>Status</th><th>Total</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {maintenanceWithCost.map((job) => (
                      <tr key={job.id} className={selectedMaintenanceId === job.id ? "selected-row" : ""} onClick={() => setSelectedMaintenanceId(job.id)}>
                        <td>{job.title}</td>
                        <td>{job.propertyName}</td>
                        <td>{job.taskName}</td>
                        <td>{job.status}</td>
                        <td>{currency(job.totalCost)}</td>
                        <td>
                          <button className="mini-danger-btn" onClick={(e) => { e.stopPropagation(); deleteMaintenanceJob(job.id); }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel form-panel">
              <h3>Edit Maintenance</h3>

              {selectedMaintenance ? (
                <div className="form-grid">
                  <Field label="Property">
                    <select value={selectedMaintenance.propertyId} onChange={(e) => changeMaintenanceProperty(e.target.value)}>
                      {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </Field>

                  <Field label="Title">
                    <input value={selectedMaintenance.title} onChange={(e) => updateMaintenance("title", e.target.value)} />
                  </Field>

                  <Field label="Task">
                    <select value={selectedMaintenance.taskName} onChange={(e) => applyPriceGuide(e.target.value)}>
                      {priceGuide.map((p) => <option key={p.task} value={p.task}>{p.task}</option>)}
                    </select>
                  </Field>

                  <Field label="Category">
                    <input value={selectedMaintenance.category} readOnly />
                  </Field>

                  <Field label="Status">
                    <select value={selectedMaintenance.status} onChange={(e) => updateMaintenance("status", e.target.value)}>
                      <option>Open</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  </Field>

                  <Field label="Labour Hours">
                    <input type="number" step="0.25" value={selectedMaintenance.labourHours} onChange={(e) => updateMaintenance("labourHours", e.target.value)} />
                  </Field>

                  <Field label="Hourly Rate">
                    <input value={selectedMaintenance.labourRate} readOnly />
                  </Field>

                  <Field label="Materials">
                    <input type="number" value={selectedMaintenance.materialCost} onChange={(e) => updateMaintenance("materialCost", e.target.value)} />
                  </Field>

                  <Field label="Invoice Status">
                    <input value={selectedMaintenance.invoiceStatus} readOnly />
                  </Field>
                </div>
              ) : (
                <div className="empty-state">Add or select a maintenance job.</div>
              )}
            </section>
          </div>
        )}

        {activeTab === "invoices" && (
          <div className="editor-grid invoice-grid">
            <section className="panel list-panel no-print">
              <div className="section-head">
                <h3>Create Invoice</h3>
                <button className="action-btn" onClick={createInvoice}>Generate Invoice</button>
              </div>

              <div className="form-grid">
                <Field label="Property">
                  <select value={invoiceForm.propertyId} onChange={(e) => setInvoiceForm((p) => ({ ...p, propertyId: e.target.value }))}>
                    {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </Field>

                <Field label="Invoice Date">
                  <input type="date" value={invoiceForm.invoiceDate} onChange={(e) => setInvoiceForm((p) => ({ ...p, invoiceDate: e.target.value }))} />
                </Field>

                <Field label="Due Date">
                  <input type="date" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm((p) => ({ ...p, dueDate: e.target.value }))} />
                </Field>
              </div>

              <div className="calc-box">
                <h4>Jobs Ready to Bill</h4>
                <div className="table-wrap small">
                  <table>
                    <thead><tr><th>Job</th><th>Task</th><th>Total</th></tr></thead>
                    <tbody>
                      {invoiceJobs.length === 0 ? (
                        <tr><td colSpan="3">No completed jobs ready.</td></tr>
                      ) : (
                        invoiceJobs.map((job) => (
                          <tr key={job.id}><td>{job.title}</td><td>{job.taskName}</td><td>{currency(job.totalCost)}</td></tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="calc-box">
                <h4>Saved Invoices</h4>
                <div className="table-wrap small">
                  <table>
                    <thead><tr><th>Invoice</th><th>Property</th><th>Status</th></tr></thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className={selectedInvoiceId === invoice.id ? "selected-row" : ""} onClick={() => setSelectedInvoiceId(invoice.id)}>
                          <td>{invoice.invoiceNumber}</td><td>{invoice.propertyName}</td><td>{invoice.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="panel form-panel invoice-panel">
              {selectedInvoiceWithItems ? (
                <>
                  <div className="invoice-actions no-print">
                    <select value={selectedInvoiceWithItems.status} onChange={(e) => updateInvoiceStatus(selectedInvoiceWithItems.id, e.target.value)}>
                      <option>Draft</option>
                      <option>Sent</option>
                      <option>Paid</option>
                    </select>

                    <button className="action-btn danger" onClick={() => deleteInvoice(selectedInvoiceWithItems.id)}>Delete</button>
                    <button className="action-btn secondary" onClick={() => window.print()}>Print</button>
                  </div>

                  <div className="invoice-paper">
                    <div className="invoice-header">
                      <img src="/logo.png" alt="Logo" className="invoice-logo" />
                      <div className="invoice-meta">
                        <h2>Maintenance Invoice</h2>
                        <div><strong>Invoice No:</strong> {selectedInvoiceWithItems.invoiceNumber}</div>
                        <div><strong>Date:</strong> {formatDate(selectedInvoiceWithItems.invoiceDate)}</div>
                        <div><strong>Due:</strong> {formatDate(selectedInvoiceWithItems.dueDate)}</div>
                        <div><strong>Status:</strong> {selectedInvoiceWithItems.status}</div>
                      </div>
                    </div>

                    <div className="bill-grid">
                      <div className="bill-to-box">
                        <div className="bill-label">Property</div>
                        <strong>{selectedInvoiceWithItems.propertyName}</strong>
                        <div>{selectedInvoiceWithItems.propertyAddress}</div>
                      </div>
                    </div>

                    <div className="table-wrap">
                      <table className="invoice-table">
                        <thead><tr><th>Description</th><th>Hours</th><th>Rate</th><th>Labour</th><th>Materials</th><th>Total</th></tr></thead>
                        <tbody>
                          {selectedInvoiceWithItems.items.map((item) => (
                            <tr key={item.id}>
                              <td>{item.title} - {item.taskName}</td>
                              <td>{item.labourHours}</td>
                              <td>{currency(item.labourRate)}</td>
                              <td>{currency(item.labourCharge)}</td>
                              <td>{currency(item.materialCost)}</td>
                              <td>{currency(item.totalCost)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="invoice-totals">
                      <div className="metric-row"><span>Labour Subtotal</span><strong>{currency(selectedInvoiceWithItems.labourSubtotal)}</strong></div>
                      <div className="metric-row"><span>Materials Total</span><strong>{currency(selectedInvoiceWithItems.materialsTotal)}</strong></div>
                      <div className="metric-row total-line"><span>Grand Total</span><strong>{currency(selectedInvoiceWithItems.total)}</strong></div>
                    </div>

                    <div className="invoice-notes">
                      <div className="bill-label">Notes</div>
                      <p>Paid in full, thank you</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state">Generate or select an invoice.</div>
              )}
            </section>
          </div>
        )}

        {activeTab === "properties" && (
          <div className="editor-grid">
            <section className="panel list-panel">
              <div className="section-head">
                <h3>Properties</h3>
                <button className="action-btn" onClick={addProperty}>Add Property</button>
              </div>

              <div className="table-wrap">
                <table>
                  <thead><tr><th>Name</th><th>Address</th><th>Beds</th></tr></thead>
                  <tbody>
                    {properties.map((property) => (
                      <tr key={property.id} className={selectedPropertyId === property.id ? "selected-row" : ""} onClick={() => setSelectedPropertyId(property.id)}>
                        <td>{property.name}</td>
                        <td>{property.address}</td>
                        <td>{property.beds}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel form-panel">
              <h3>Edit Property</h3>

              {selectedProperty ? (
                <div className="form-grid">
                  <Field label="Name">
                    <input value={selectedProperty.name} onChange={(e) => updateProperty("name", e.target.value)} />
                  </Field>

                  <Field label="Address">
                    <input value={selectedProperty.address} onChange={(e) => updateProperty("address", e.target.value)} />
                  </Field>

                  <Field label="Beds">
                    <input type="number" value={selectedProperty.beds} onChange={(e) => updateProperty("beds", e.target.value)} />
                  </Field>

                  <Field label="Approval Limit">
                    <input type="number" value={selectedProperty.approvalLimit} onChange={(e) => updateProperty("approvalLimit", e.target.value)} />
                  </Field>
                </div>
              ) : (
                <div className="empty-state">Select a property.</div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="stat-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label>{label}</label>
      {children}
    </div>
  );
}