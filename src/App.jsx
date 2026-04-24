import React, { useMemo, useState } from "react";
import "./index.css";

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

const starterLinen = [
  { id: "LIN-001", propertyId: "P-001", propertyName: "120XY SL 2B", item: "Duvet Cover", usableStock: 8, inLaundry: 2, incomingStock: 0, avgWeeklyUsage: 4, peakWeeklyUsage: 6, supplierLeadDays: 5, safetyStock: 3, maxStockCap: 12, damaged: 0, missing: 1 },
  { id: "LIN-002", propertyId: "P-002", propertyName: "503WG 1B", item: "Bed Sheet", usableStock: 6, inLaundry: 3, incomingStock: 2, avgWeeklyUsage: 5, peakWeeklyUsage: 7, supplierLeadDays: 4, safetyStock: 4, maxStockCap: 14, damaged: 1, missing: 0 },
];

const starterKeys = [
  { id: "KEY-001", propertyId: "P-001", propertyName: "120XY SL 2B", type: "Front Door Key", status: "In Office", holder: "Reception" },
  { id: "KEY-002", propertyId: "P-002", propertyName: "503WG 1B", type: "Fob", status: "Missing", holder: "Unknown" },
];

function currency(value) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(value || 0));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("en-GB");
}

function formatMonth(monthValue) {
  if (monthValue === "all") return "All Months";
  const [year, month] = monthValue.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function generateInvoiceNumber(invoices) {
  const year = new Date().getFullYear();
  return `INV-${year}-${String(invoices.length + 1).padStart(4, "0")}`;
}

function calculateLinenMetrics(row, occupancyFactor = 1) {
  const leadWeeks = row.supplierLeadDays / 7;
  const forecastUsageDuringLead = row.peakWeeklyUsage * leadWeeks * occupancyFactor;
  const totalAvailable = row.usableStock + row.inLaundry + row.incomingStock;
  const projectedAvailable = totalAvailable - forecastUsageDuringLead;
  const reorderPoint = forecastUsageDuringLead + row.safetyStock;
  const recommendedOrder = Math.max(
    0,
    Math.min(Math.ceil(reorderPoint - totalAvailable), row.maxStockCap - totalAvailable)
  );

  let status = "Healthy";
  if (projectedAvailable <= row.safetyStock) status = "Critical";
  else if (projectedAvailable <= reorderPoint) status = "Reorder Soon";

  return {
    totalAvailable,
    forecastUsageDuringLead: Number(forecastUsageDuringLead.toFixed(1)),
    projectedAvailable: Number(projectedAvailable.toFixed(1)),
    reorderPoint: Number(reorderPoint.toFixed(1)),
    recommendedOrder,
    status,
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
  const [occupancyFactor, setOccupancyFactor] = useState(1);

  const [properties, setProperties] = useState(starterProperties);
  const [linen, setLinen] = useState(starterLinen);
  const [keys, setKeys] = useState(starterKeys);
  const [maintenance, setMaintenance] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [selectedPropertyId, setSelectedPropertyId] = useState("P-001");
  const [selectedLinenId, setSelectedLinenId] = useState("LIN-001");
  const [selectedKeyId, setSelectedKeyId] = useState("KEY-001");
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [dashboardMonthFilter, setDashboardMonthFilter] = useState("all");

  const [invoiceForm, setInvoiceForm] = useState({
    invoiceDate: todayISO(),
    dueDate: todayISO(),
    propertyId: "P-001",
  });

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId) || properties[0];
  const selectedLinen = linen.find((l) => l.id === selectedLinenId) || linen[0];
  const selectedKey = keys.find((k) => k.id === selectedKeyId) || keys[0];
  const selectedMaintenance = maintenance.find((m) => m.id === selectedMaintenanceId) || null;
  const selectedInvoice = invoices.find((i) => i.id === selectedInvoiceId) || null;

  const linenWithMetrics = useMemo(
    () => linen.map((item) => ({ ...item, ...calculateLinenMetrics(item, occupancyFactor) })),
    [linen, occupancyFactor]
  );

  const maintenanceWithCost = useMemo(
    () =>
      maintenance.map((job) => ({
        ...job,
        labourCharge: calculateJobLabour(job),
        totalCost: calculateJobTotal(job),
      })),
    [maintenance]
  );

  const invoiceJobs = useMemo(() => {
    return maintenanceWithCost.filter(
      (job) =>
        job.propertyId === invoiceForm.propertyId &&
        job.status === "Completed" &&
        job.invoiceStatus !== "Billed"
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
      maintenanceCostsCharged: filteredDashboardInvoices.reduce((sum, inv) => sum + inv.labourSubtotal, 0),
      openMaintenance: maintenanceWithCost.filter((j) => j.status !== "Completed").length,
      criticalLinen: linenWithMetrics.filter((l) => l.status === "Critical").length,
      reorderSoon: linenWithMetrics.filter((l) => l.status === "Reorder Soon").length,
      missingKeys: keys.filter((k) => k.status === "Missing").length,
      invoiceCount: filteredDashboardInvoices.length,
    };
  }, [filteredDashboardInvoices, maintenanceWithCost, linenWithMetrics, keys]);

  const addMaintenance = () => {
    const property = properties[0];
    const guide = priceGuide[0];
    const id = `JOB-${1000 + maintenance.length + 1}`;

    const job = {
      id,
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

    setMaintenance((prev) => [job, ...prev]);
    setSelectedMaintenanceId(id);
  };

  const deleteMaintenanceJob = (jobId) => {
    const job = maintenance.find((m) => m.id === jobId);
    if (job?.invoiceStatus === "Billed") {
      alert("This job is already billed. Delete the invoice first if you need to remove it.");
      return;
    }

    setMaintenance((prev) => prev.filter((job) => job.id !== jobId));

    if (selectedMaintenanceId === jobId) {
      setSelectedMaintenanceId("");
    }
  };

  const changeMaintenanceProperty = (propertyId) => {
    const property = properties.find((p) => p.id === propertyId);
    if (!property || !selectedMaintenance) return;

    setMaintenance((prev) =>
      prev.map((job) =>
        job.id === selectedMaintenanceId
          ? { ...job, propertyId: property.id, propertyName: property.name, propertyAddress: property.address }
          : job
      )
    );
  };

  const applyPriceGuide = (taskName) => {
    const guide = priceGuide.find((p) => p.task === taskName);
    if (!guide || !selectedMaintenance) return;

    setMaintenance((prev) =>
      prev.map((job) =>
        job.id === selectedMaintenanceId
          ? { ...job, taskName: guide.task, category: guide.category, labourRate: guide.hourlyRate }
          : job
      )
    );
  };

  const updateMaintenance = (field, value) => {
    const numeric = ["labourHours", "labourRate", "materialCost"];
    setMaintenance((prev) =>
      prev.map((job) =>
        job.id === selectedMaintenanceId
          ? { ...job, [field]: numeric.includes(field) ? Number(value) : value }
          : job
      )
    );
  };

  const createInvoice = () => {
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
      items: invoiceJobs.map((job) => ({
        jobId: job.id,
        title: job.title,
        taskName: job.taskName,
        labourHours: job.labourHours,
        labourRate: job.labourRate,
        labourCharge: calculateJobLabour(job),
        materialCost: job.materialCost,
        totalCost: calculateJobTotal(job),
      })),
      labourSubtotal,
      materialsTotal,
      total: labourSubtotal + materialsTotal,
      status: "Draft",
    };

    setInvoices((prev) => [invoice, ...prev]);
    setSelectedInvoiceId(invoice.id);

    setMaintenance((prev) =>
      prev.map((job) =>
        invoiceJobs.some((i) => i.id === job.id) ? { ...job, invoiceStatus: "Billed" } : job
      )
    );

    setActiveTab("invoices");
  };

  const deleteInvoice = (invoiceId) => {
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (!invoice) return;

    const jobIds = invoice.items.map((item) => item.jobId);

    setMaintenance((prev) =>
      prev.map((job) => (jobIds.includes(job.id) ? { ...job, invoiceStatus: "Pending" } : job))
    );

    setInvoices((prev) => prev.filter((i) => i.id !== invoiceId));
    setSelectedInvoiceId("");
  };

  const updateInvoiceStatus = (invoiceId, status) => {
    setInvoices((prev) => prev.map((i) => (i.id === invoiceId ? { ...i, status } : i)));
  };

  const addProperty = () => {
    const id = `P-${String(properties.length + 1).padStart(3, "0")}`;
    const property = {
      id,
      name: `New Property ${properties.length + 1}`,
      address: "Enter address",
      beds: 1,
      approvalLimit: 100,
    };
    setProperties((prev) => [...prev, property]);
    setSelectedPropertyId(id);
  };

  const updateProperty = (field, value) => {
    const numeric = ["beds", "approvalLimit"];
    setProperties((prev) =>
      prev.map((p) =>
        p.id === selectedPropertyId ? { ...p, [field]: numeric.includes(field) ? Number(value) : value } : p
      )
    );
  };

  const updateLinen = (field, value) => {
    const numeric = [
      "usableStock",
      "inLaundry",
      "incomingStock",
      "avgWeeklyUsage",
      "peakWeeklyUsage",
      "supplierLeadDays",
      "safetyStock",
      "maxStockCap",
      "damaged",
      "missing",
    ];

    setLinen((prev) =>
      prev.map((l) =>
        l.id === selectedLinenId ? { ...l, [field]: numeric.includes(field) ? Number(value) : value } : l
      )
    );
  };

  const updateKey = (field, value) => {
    setKeys((prev) => prev.map((k) => (k.id === selectedKeyId ? { ...k, [field]: value } : k)));
  };

  const addLinenItem = () => {
    const property = properties[0];
    const id = `LIN-${String(linen.length + 1).padStart(3, "0")}`;
    const item = {
      id,
      propertyId: property.id,
      propertyName: property.name,
      item: "New Linen Item",
      usableStock: 0,
      inLaundry: 0,
      incomingStock: 0,
      avgWeeklyUsage: 0,
      peakWeeklyUsage: 0,
      supplierLeadDays: 5,
      safetyStock: 1,
      maxStockCap: 10,
      damaged: 0,
      missing: 0,
    };

    setLinen((prev) => [...prev, item]);
    setSelectedLinenId(id);
  };

  const addKey = () => {
    const property = properties[0];
    const id = `KEY-${String(keys.length + 1).padStart(3, "0")}`;

    setKeys((prev) => [
      ...prev,
      {
        id,
        propertyId: property.id,
        propertyName: property.name,
        type: "New Key",
        status: "In Office",
        holder: "Reception",
      },
    ]);

    setSelectedKeyId(id);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <h2>OPS CRM</h2>
          <p>STR Cost Control</p>
        </div>

        {["dashboard", "linen", "maintenance", "invoices", "keys", "properties"].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "nav-btn active" : "nav-btn"}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </aside>

      <main className="main-content">
        <header className="topbar no-print">
          <div>
            <h1>Internal CRM Dashboard</h1>
            <p>Premium operations control for maintenance, invoices, linen, keys and properties.</p>
          </div>

          <div className="topbar-card">
            <label>Occupancy Pressure</label>
            <select value={occupancyFactor} onChange={(e) => setOccupancyFactor(Number(e.target.value))}>
              <option value={0.8}>Low</option>
              <option value={1}>Normal</option>
              <option value={1.2}>Busy</option>
              <option value={1.4}>Peak</option>
            </select>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <>
            <div className="dashboard-filter-card">
              <label>Filter invoices by month</label>
              <select value={dashboardMonthFilter} onChange={(e) => setDashboardMonthFilter(e.target.value)}>
                {invoiceMonthOptions.map((month) => (
                  <option key={month} value={month}>
                    {formatMonth(month)}
                  </option>
                ))}
              </select>
            </div>

            <section className="stats-grid six">
              <StatCard title="Maintenance Charged" value={currency(dashboard.maintenanceCostsCharged)} />
              <StatCard title="Open Maintenance" value={dashboard.openMaintenance} />
              <StatCard title="Critical Linen" value={dashboard.criticalLinen} />
              <StatCard title="Reorder Soon" value={dashboard.reorderSoon} />
              <StatCard title="Missing Keys" value={dashboard.missingKeys} />
              <StatCard title="Invoices" value={dashboard.invoiceCount} />
            </section>

            <section className="content-grid">
              <div className="panel wide">
                <h3>Maintenance Charge Dashboard</h3>
                <div className="metric-row">
                  <span>Labour charged to properties</span>
                  <strong>{currency(dashboard.maintenanceCostsCharged)}</strong>
                </div>
                <div className="metric-row">
                  <span>Invoices generated</span>
                  <strong>{dashboard.invoiceCount}</strong>
                </div>
                <div className="metric-row">
                  <span>Open maintenance jobs</span>
                  <strong>{dashboard.openMaintenance}</strong>
                </div>
              </div>

              <div className="panel">
                <h3>Invoice Source</h3>
                <p className="muted">
                  Invoices are created from completed maintenance jobs for the selected property. Dashboard totals count labour only.
                </p>
              </div>
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
                    <tr>
                      <th>Job</th>
                      <th>Property</th>
                      <th>Task</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceWithCost.map((job) => (
                      <tr
                        key={job.id}
                        className={selectedMaintenanceId === job.id ? "selected-row" : ""}
                        onClick={() => setSelectedMaintenanceId(job.id)}
                      >
                        <td>{job.title}</td>
                        <td>{job.propertyName}</td>
                        <td>{job.taskName}</td>
                        <td>{job.status}</td>
                        <td>{currency(job.totalCost)}</td>
                        <td>
                          <button
                            className="mini-danger-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMaintenanceJob(job.id);
                            }}
                          >
                            Delete
                          </button>
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
                <>
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

                    <Field label="Assigned To">
                      <input value={selectedMaintenance.assignedTo} onChange={(e) => updateMaintenance("assignedTo", e.target.value)} />
                    </Field>

                    <Field label="Status">
                      <select value={selectedMaintenance.status} onChange={(e) => updateMaintenance("status", e.target.value)}>
                        <option>Open</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                        <option>Needs Approval</option>
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
                      <select value={selectedMaintenance.invoiceStatus} onChange={(e) => updateMaintenance("invoiceStatus", e.target.value)}>
                        <option>Not Started</option>
                        <option>Pending</option>
                        <option>Billed</option>
                        <option>Paid</option>
                      </select>
                    </Field>
                  </div>

                  <div className="calc-box">
                    <div className="metric-row">
                      <span>Labour Charge</span>
                      <strong>{currency(calculateJobLabour(selectedMaintenance))}</strong>
                    </div>
                    <div className="metric-row">
                      <span>Total Job Cost</span>
                      <strong>{currency(calculateJobTotal(selectedMaintenance))}</strong>
                    </div>
                  </div>
                </>
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
                  <select
                    value={invoiceForm.propertyId}
                    onChange={(e) => setInvoiceForm((p) => ({ ...p, propertyId: e.target.value }))}
                  >
                    {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </Field>

                <Field label="Invoice Date">
                  <input
                    type="date"
                    value={invoiceForm.invoiceDate}
                    onChange={(e) => setInvoiceForm((p) => ({ ...p, invoiceDate: e.target.value }))}
                  />
                </Field>

                <Field label="Due Date">
                  <input
                    type="date"
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm((p) => ({ ...p, dueDate: e.target.value }))}
                  />
                </Field>
              </div>

              <div className="calc-box">
                <h4 className="subheading">Jobs Ready to Bill</h4>
                <div className="table-wrap small">
                  <table>
                    <thead>
                      <tr>
                        <th>Job</th>
                        <th>Task</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceJobs.length === 0 ? (
                        <tr><td colSpan="3">No completed jobs ready for this property.</td></tr>
                      ) : (
                        invoiceJobs.map((job) => (
                          <tr key={job.id}>
                            <td>{job.title}</td>
                            <td>{job.taskName}</td>
                            <td>{currency(job.totalCost)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="calc-box">
                <h4 className="subheading">Saved Invoices</h4>
                <div className="table-wrap small">
                  <table>
                    <thead>
                      <tr>
                        <th>Invoice</th>
                        <th>Property</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr
                          key={inv.id}
                          className={selectedInvoiceId === inv.id ? "selected-row" : ""}
                          onClick={() => setSelectedInvoiceId(inv.id)}
                        >
                          <td>{inv.invoiceNumber}</td>
                          <td>{inv.propertyName}</td>
                          <td>{inv.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="panel form-panel invoice-panel">
              {selectedInvoice ? (
                <>
                  <div className="invoice-actions no-print">
                    <select value={selectedInvoice.status} onChange={(e) => updateInvoiceStatus(selectedInvoice.id, e.target.value)}>
                      <option>Draft</option>
                      <option>Sent</option>
                      <option>Paid</option>
                    </select>
                    <button className="action-btn danger" onClick={() => deleteInvoice(selectedInvoice.id)}>Delete</button>
                    <button className="action-btn secondary" onClick={() => window.print()}>Print</button>
                  </div>

                  <div className="invoice-paper">
                    <div className="invoice-header">
                      <img src="/logo.png" alt="Logo" className="invoice-logo" />
                      <div className="invoice-meta">
                        <h2>Maintenance Invoice</h2>
                        <div><strong>Invoice No:</strong> {selectedInvoice.invoiceNumber}</div>
                        <div><strong>Date:</strong> {formatDate(selectedInvoice.invoiceDate)}</div>
                        <div><strong>Due:</strong> {formatDate(selectedInvoice.dueDate)}</div>
                        <div><strong>Status:</strong> {selectedInvoice.status}</div>
                      </div>
                    </div>

                    <div className="bill-grid">
                      <div className="bill-to-box">
                        <div className="bill-label">Property</div>
                        <strong>{selectedInvoice.propertyName}</strong>
                        <div>{selectedInvoice.propertyAddress}</div>
                      </div>
                    </div>

                    <div className="table-wrap">
                      <table className="invoice-table">
                        <thead>
                          <tr>
                            <th>Description</th>
                            <th>Hours</th>
                            <th>Rate</th>
                            <th>Labour</th>
                            <th>Materials</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedInvoice.items.map((item) => (
                            <tr key={item.jobId}>
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
                      <div className="metric-row">
                        <span>Labour Subtotal</span>
                        <strong>{currency(selectedInvoice.labourSubtotal)}</strong>
                      </div>
                      <div className="metric-row">
                        <span>Materials Total</span>
                        <strong>{currency(selectedInvoice.materialsTotal)}</strong>
                      </div>
                      <div className="metric-row total-line">
                        <span>Grand Total</span>
                        <strong>{currency(selectedInvoice.total)}</strong>
                      </div>
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

        {activeTab === "linen" && (
          <div className="editor-grid">
            <section className="panel list-panel">
              <div className="section-head">
                <h3>Linen Lines</h3>
                <button className="action-btn" onClick={addLinenItem}>Add Linen</button>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Property</th>
                      <th>Projected</th>
                      <th>Suggested</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linenWithMetrics.map((row) => (
                      <tr
                        key={row.id}
                        className={selectedLinenId === row.id ? "selected-row" : ""}
                        onClick={() => setSelectedLinenId(row.id)}
                      >
                        <td>{row.item}</td>
                        <td>{row.propertyName}</td>
                        <td>{row.projectedAvailable}</td>
                        <td>{row.recommendedOrder}</td>
                        <td>
                          <span className={row.status === "Critical" ? "badge red" : row.status === "Reorder Soon" ? "badge amber" : "badge green"}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel form-panel">
              <h3>Edit Linen</h3>
              {selectedLinen && (
                <div className="form-grid">
                  {[
                    "item",
                    "usableStock",
                    "inLaundry",
                    "incomingStock",
                    "avgWeeklyUsage",
                    "peakWeeklyUsage",
                    "supplierLeadDays",
                    "safetyStock",
                    "maxStockCap",
                    "damaged",
                    "missing",
                  ].map((field) => (
                    <Field key={field} label={field}>
                      <input value={selectedLinen[field]} onChange={(e) => updateLinen(field, e.target.value)} />
                    </Field>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === "keys" && (
          <div className="editor-grid">
            <section className="panel list-panel">
              <div className="section-head">
                <h3>Keys</h3>
                <button className="action-btn" onClick={addKey}>Add Key</button>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Key ID</th>
                      <th>Property</th>
                      <th>Status</th>
                      <th>Holder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keys.map((key) => (
                      <tr
                        key={key.id}
                        className={selectedKeyId === key.id ? "selected-row" : ""}
                        onClick={() => setSelectedKeyId(key.id)}
                      >
                        <td>{key.id}</td>
                        <td>{key.propertyName}</td>
                        <td>{key.status}</td>
                        <td>{key.holder}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel form-panel">
              <h3>Edit Key</h3>
              {selectedKey && (
                <div className="form-grid">
                  <Field label="Type">
                    <input value={selectedKey.type} onChange={(e) => updateKey("type", e.target.value)} />
                  </Field>

                  <Field label="Status">
                    <select value={selectedKey.status} onChange={(e) => updateKey("status", e.target.value)}>
                      <option>In Office</option>
                      <option>With Staff</option>
                      <option>With Guest</option>
                      <option>Missing</option>
                    </select>
                  </Field>

                  <Field label="Holder">
                    <input value={selectedKey.holder} onChange={(e) => updateKey("holder", e.target.value)} />
                  </Field>
                </div>
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
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Address</th>
                      <th>Beds</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((p) => (
                      <tr
                        key={p.id}
                        className={selectedPropertyId === p.id ? "selected-row" : ""}
                        onClick={() => setSelectedPropertyId(p.id)}
                      >
                        <td>{p.name}</td>
                        <td>{p.address}</td>
                        <td>{p.beds}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel form-panel">
              <h3>Edit Property</h3>
              {selectedProperty && (
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