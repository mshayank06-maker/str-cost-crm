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
  { id: "P-015", name: "030XY 2B", address: "Western Gateway", beds: 2, approvalLimit: 100 },
  { id: "P-016", name: "139OXY 2B", address: "Western Gateway", beds: 2, approvalLimit: 100 },
  { id: "P-017", name: "37ADR 1B", address: "Western Gateway", beds: 1, approvalLimit: 100 },
  { id: "P-018", name: "130OXY 1B", address: "Western Gateway", beds: 1, approvalLimit: 100 },
  { id: "P-019", name: "161OXY 2B", address: "Western Gateway", beds: 2, approvalLimit: 100 },
  { id: "P-020", name: "65ALA 3B", address: "Western Gateway", beds: 3, approvalLimit: 100 },
  { id: "P-021", name: "1006BAL", address: "Balearic Apartments, 15 Western Gateway", beds: 1, approvalLimit: 100 },
  { id: "P-022", name: "1007BAL", address: "18 Western Gateway", beds: 1, approvalLimit: 100 },
  { id: "P-023", name: "207 FAT 2B", address: "19 Atlantis Avenue", beds: 2, approvalLimit: 100 },
  { id: "P-024", name: "30MAN 2B", address: "Western Gateway", beds: 2, approvalLimit: 100 },
  { id: "P-025", name: "129 ADR 1B", address: "Western Gateway", beds: 1, approvalLimit: 100 },
  { id: "P-026", name: "103 SAI 2B", address: "Atlantis Avenue", beds: 2, approvalLimit: 100 },
  { id: "P-027", name: "1201 12WG 3B", address: "Garvary Road", beds: 3, approvalLimit: 100 },
  { id: "P-028", name: "28 ELS 2B", address: "Western Gateway", beds: 2, approvalLimit: 100 },
  { id: "P-029", name: "22 HIE 2B", address: "Blair Street", beds: 2, approvalLimit: 100 },
  { id: "P-030", name: "35COR 2B", address: "14 Western Gateway", beds: 2, approvalLimit: 100 },
  { id: "P-031", name: "209DRI 2B", address: "28 Elsdale Street", beds: 2, approvalLimit: 100 },
  { id: "P-032", name: "940XY 2B", address: "17 Bermuda Way", beds: 2, approvalLimit: 100 },
  { id: "P-033", name: "706 12WG", address: "Western Gateway, Unit D", beds: 1, approvalLimit: 100 },
  { id: "P-034", name: "2 PLA 1B", address: "13 Derny Avenue", beds: 1, approvalLimit: 100 },
  { id: "P-035", name: "404 DRI 2B", address: "19 Atlantis Avenue", beds: 2, approvalLimit: 100 },
  { id: "P-036", name: "123 OXY 2B", address: "Western Gateway", beds: 2, approvalLimit: 100 },
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
  { id: "LIN-001", item: "Bedsheet White", category: "Bedding", currentStock: 50, minimumStock: 15, healthyStock: 40, notes: "Standard bedsheets" },
  { id: "LIN-002", item: "Pillowcase", category: "Bedding", currentStock: 80, minimumStock: 20, healthyStock: 50, notes: "Standard pillowcases" },
  { id: "LIN-003", item: "Duvet Cover", category: "Bedding", currentStock: 35, minimumStock: 12, healthyStock: 30, notes: "White duvet covers" },
  { id: "LIN-004", item: "Large Towel", category: "Towels", currentStock: 30, minimumStock: 10, healthyStock: 25, notes: "Bath towels" },
  { id: "LIN-005", item: "Small Towel", category: "Towels", currentStock: 20, minimumStock: 8, healthyStock: 18, notes: "Hand towels" },
  { id: "LIN-006", item: "Bath Mat", category: "Towels", currentStock: 14, minimumStock: 6, healthyStock: 15, notes: "Bathroom mats" },
];

const money = (v) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number(v || 0));

const todayISO = () => new Date().toISOString().slice(0, 10);

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB") : "";

function formatMonth(value) {
  if (value === "all") return "All Months";

  const [year, month] = value.split("-");

  return new Date(Number(year), Number(month) - 1).toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  });
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
    beds: Number(p.beds || 0),
    approvalLimit: Number(p.approval_limit || 0),
  };
}

function linenToDb(l) {
  return {
    id: l.id,
    item: l.item,
    category: l.category,
    current_stock: Number(l.currentStock || 0),
    minimum_stock: Number(l.minimumStock || 0),
    healthy_stock: Number(l.healthyStock || 0),
    notes: l.notes || "",
  };
}

function linenFromDb(l) {
  return {
    id: l.id,
    item: l.item,
    category: l.category,
    currentStock: Number(l.current_stock || 0),
    minimumStock: Number(l.minimum_stock || 0),
    healthyStock: Number(l.healthy_stock || 0),
    notes: l.notes || "",
  };
}

function getLinenStatus(item) {
  if (Number(item.currentStock) <= Number(item.minimumStock)) return "low";
  if (Number(item.currentStock) < Number(item.healthyStock)) return "medium";
  return "healthy";
}

function getLinenLabel(status) {
  if (status === "low") return "Low Stock";
  if (status === "medium") return "Reorder Soon";
  return "Healthy";
}

function calculateJobLabour(job) {
  return Number(job.labourHours || 0) * Number(job.labourRate || 0);
}

function calculateJobTotal(job) {
  return calculateJobLabour(job) + Number(job.materialCost || 0);
}

function generateInvoiceNumber(invoices) {
  const year = new Date().getFullYear();

  const currentYearInvoices = invoices.filter((inv) =>
    String(inv.invoiceNumber || "").startsWith(`INV-${year}-`)
  );

  return `INV-${year}-${String(currentYearInvoices.length + 1).padStart(4, "0")}`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const [properties, setProperties] = useState([]);
  const [linen, setLinen] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [invoiceItems, setInvoiceItems] = useState([]);

  const [selectedPropertyId, setSelectedPropertyId] = useState("P-001");
  const [selectedLinenId, setSelectedLinenId] = useState("");
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [dashboardMonthFilter, setDashboardMonthFilter] = useState("all");
  const [maintenanceMonthFilter, setMaintenanceMonthFilter] = useState("all");

  const [invoiceForm, setInvoiceForm] = useState({
    invoiceDate: todayISO(),
    dueDate: todayISO(),
    propertyId: "P-001",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      await supabase
        .from("properties")
        .upsert(starterProperties.map(propertyToDb), { onConflict: "id" });

      await supabase
        .from("linen_items")
        .upsert(starterLinen.map(linenToDb), { onConflict: "id" });

      const [
        propertiesRes,
        linenRes,
        maintenanceRes,
        invoicesRes,
        invoiceItemsRes,
      ] = await Promise.all([
        supabase.from("properties").select("*").order("id"),
        supabase.from("linen_items").select("*").order("id"),
        supabase.from("maintenance_jobs").select("*").order("created_at", {
          ascending: false,
        }),
        supabase.from("invoices").select("*").order("created_at", {
          ascending: false,
        }),
        supabase.from("invoice_items").select("*"),
      ]);

      if (propertiesRes.error) console.error("Properties error:", propertiesRes.error);
      if (linenRes.error) console.error("Linen error:", linenRes.error);
      if (maintenanceRes.error) console.error("Maintenance error:", maintenanceRes.error);
      if (invoicesRes.error) console.error("Invoices error:", invoicesRes.error);
      if (invoiceItemsRes.error) console.error("Invoice items error:", invoiceItemsRes.error);

      const loadedProperties = (propertiesRes.data || []).map(propertyFromDb);
      const loadedLinen = (linenRes.data || []).map(linenFromDb);

      setProperties(loadedProperties);
      setLinen(loadedLinen);

      setMaintenance(
        (maintenanceRes.data || []).map((job) => {
          const crmPropertyId = job.crm_property_id || job.property_id || "";
          const matchedProperty = loadedProperties.find(
            (p) => p.id === crmPropertyId
          );

          return {
            id: job.id,
            createdAt: job.created_at || "",
            externalId: job.external_id || "",

            propertyId: matchedProperty ? matchedProperty.id : "",
            propertyName: matchedProperty
              ? matchedProperty.name
              : job.property_name || job.hostaway_listing_name || "Unmapped Property",
            propertyAddress: matchedProperty
              ? matchedProperty.address
              : job.property_address || "",

            crmPropertyId: matchedProperty ? matchedProperty.id : "",
            hostawayListingId: job.hostaway_listing_id || "",
            hostawayListingName: job.hostaway_listing_name || "",

            title: job.title || "Maintenance Job",
            description: job.description || "",
            taskName: job.task_name || "Hostaway Task",
            category: job.category || "Maintenance",
            jobDone: job.job_done || job.task_name || "",
            assignedTo: job.assigned_to || "Hostaway",
            status: job.status || "Completed",
            labourHours: Number(job.labour_hours || 1),
            labourRate: Number(job.labour_rate || 0),
            materialCost: Number(job.material_cost || 0),
            invoiceStatus: job.invoice_status || "Not Started",
          };
        })
      );

      setInvoices(
        (invoicesRes.data || []).map((inv) => ({
          id: inv.id,
          jobId: inv.job_id || "",
          source: inv.source || "",
          invoiceNumber: inv.invoice_number,
          invoiceDate: inv.invoice_date,
          dueDate: inv.due_date,
          propertyId: inv.property_id,
          propertyName: inv.property_name,
          propertyAddress: inv.property_address,
          labourSubtotal: Number(inv.labour_subtotal || 0),
          materialsTotal: Number(inv.materials_total || 0),
          total: Number(inv.total || 0),
          status: inv.status,
          notes: inv.notes || "Paid in full, thank you",
        }))
      );

      setInvoiceItems(
        (invoiceItemsRes.data || []).map((item) => ({
          id: item.id,
          invoiceId: item.invoice_id,
          jobId: item.job_id,
          title: item.title,
          taskName: item.task_name,
          labourHours: Number(item.labour_hours || 0),
          labourRate: Number(item.labour_rate || 0),
          labourCharge: Number(item.labour_charge || 0),
          materialCost: Number(item.material_cost || 0),
          totalCost: Number(item.total_cost || 0),
        }))
      );
    } catch (error) {
      console.error("CRM loading error:", error);
      alert("CRM loading error: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const selectedProperty =
    properties.find((p) => p.id === selectedPropertyId) || properties[0];

  const selectedLinen =
    linen.find((l) => l.id === selectedLinenId) || null;

  const selectedMaintenance =
    maintenance.find((m) => m.id === selectedMaintenanceId) || null;

  const selectedInvoice =
    invoices.find((i) => i.id === selectedInvoiceId) || null;

  const selectedInvoiceWithItems = selectedInvoice
    ? {
        ...selectedInvoice,
        items: invoiceItems.filter((item) => item.invoiceId === selectedInvoice.id),
      }
    : null;

  const maintenanceWithCost = useMemo(
    () =>
      maintenance.map((job) => ({
        ...job,
        labourCharge: calculateJobLabour(job),
        totalCost: calculateJobTotal(job),
      })),
    [maintenance]
  );

  const invoiceJobs = useMemo(
    () =>
      maintenanceWithCost.filter(
        (job) =>
          job.propertyId === invoiceForm.propertyId &&
          job.status === "Completed" &&
          job.invoiceStatus !== "Billed"
      ),
    [maintenanceWithCost, invoiceForm.propertyId]
  );

  const invoiceMonthOptions = useMemo(() => {
    const months = invoices
      .map((inv) => inv.invoiceDate?.slice(0, 7))
      .filter(Boolean);

    return ["all", ...Array.from(new Set(months))];
  }, [invoices]);

  const maintenanceMonthOptions = useMemo(() => {
    const months = maintenanceWithCost
      .map((job) => job.createdAt?.slice(0, 7))
      .filter(Boolean);

    return ["all", ...Array.from(new Set(months))];
  }, [maintenanceWithCost]);

  const filteredMaintenanceJobs = useMemo(() => {
    if (maintenanceMonthFilter === "all") return maintenanceWithCost;

    return maintenanceWithCost.filter(
      (job) => job.createdAt?.slice(0, 7) === maintenanceMonthFilter
    );
  }, [maintenanceWithCost, maintenanceMonthFilter]);

  const filteredDashboardInvoices = useMemo(() => {
    if (dashboardMonthFilter === "all") return invoices;

    return invoices.filter(
      (inv) => inv.invoiceDate?.slice(0, 7) === dashboardMonthFilter
    );
  }, [invoices, dashboardMonthFilter]);

  const dashboard = useMemo(
    () => ({
      maintenanceCostsCharged: filteredDashboardInvoices.reduce(
        (sum, inv) => sum + Number(inv.labourSubtotal || 0),
        0
      ),
      openMaintenance: maintenanceWithCost.filter((j) => j.status !== "Completed").length,
      invoices: filteredDashboardInvoices.length,
      lowLinen: linen.filter((l) => getLinenStatus(l) === "low").length,
      reorderLinen: linen.filter((l) => getLinenStatus(l) === "medium").length,
    }),
    [filteredDashboardInvoices, maintenanceWithCost, linen]
  );

  async function addMaintenance() {
    const property = selectedProperty || properties[0];
    const guide = priceGuide[0];

    if (!property) return;

    const job = {
      id: `JOB-${Date.now()}`,
      createdAt: new Date().toISOString(),
      externalId: "",
      propertyId: property.id,
      crmPropertyId: property.id,
      propertyName: property.name,
      propertyAddress: property.address,
      hostawayListingId: "",
      hostawayListingName: "",
      title: "New Maintenance Job",
      description: "",
      taskName: guide.task,
      category: guide.category,
      jobDone: guide.task,
      assignedTo: "Inhouse Handyman",
      status: "Open",
      labourHours: 1,
      labourRate: guide.hourlyRate,
      materialCost: 0,
      invoiceStatus: "Not Started",
    };

    const labourTotal = calculateJobLabour(job);
    const totalCost = calculateJobTotal(job);

    const { error } = await supabase.from("maintenance_jobs").insert({
      id: job.id,
      external_id: job.externalId,
      property_id: job.propertyId,
      crm_property_id: job.crmPropertyId,
      property_name: job.propertyName,
      property_address: job.propertyAddress,
      hostaway_listing_id: job.hostawayListingId,
      hostaway_listing_name: job.hostawayListingName,
      title: job.title,
      description: job.description,
      task_name: job.taskName,
      category: job.category,
      job_done: job.jobDone,
      assigned_to: job.assignedTo,
      status: job.status,
      labour_hours: job.labourHours,
      labour_rate: job.labourRate,
      labour_total: labourTotal,
      material_cost: job.materialCost,
      total_cost: totalCost,
      invoice_status: job.invoiceStatus,
    });

    if (error) return alert(error.message);

    setMaintenance((prev) => [job, ...prev]);
    setSelectedMaintenanceId(job.id);
  }

  async function updateMaintenance(field, value) {
    const numeric = ["labourHours", "labourRate", "materialCost"];
    const updatedValue = numeric.includes(field) ? Number(value) : value;

    const updated = maintenance.map((job) =>
      job.id === selectedMaintenanceId
        ? { ...job, [field]: updatedValue }
        : job
    );

    setMaintenance(updated);

    const job = updated.find((j) => j.id === selectedMaintenanceId);
    if (!job) return;

    const labourTotal = calculateJobLabour(job);
    const totalCost = calculateJobTotal(job);

    await supabase
      .from("maintenance_jobs")
      .update({
        property_id: job.propertyId || null,
        crm_property_id: job.crmPropertyId || job.propertyId || null,
        property_name: job.propertyName,
        property_address: job.propertyAddress,
        title: job.title,
        description: job.description || "",
        task_name: job.taskName,
        category: job.category,
        job_done: job.jobDone || job.taskName,
        assigned_to: job.assignedTo,
        status: job.status,
        labour_hours: job.labourHours,
        labour_rate: job.labourRate,
        labour_total: labourTotal,
        material_cost: job.materialCost,
        total_cost: totalCost,
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
      crmPropertyId: property.id,
      propertyName: property.name,
      propertyAddress: property.address,
    };

    setMaintenance((prev) =>
      prev.map((job) =>
        job.id === selectedMaintenanceId ? updatedJob : job
      )
    );

    await supabase
      .from("maintenance_jobs")
      .update({
        property_id: updatedJob.propertyId,
        crm_property_id: updatedJob.crmPropertyId,
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
      jobDone: guide.task,
      labourRate: guide.hourlyRate,
    };

    const labourTotal = calculateJobLabour(updatedJob);
    const totalCost = calculateJobTotal(updatedJob);

    setMaintenance((prev) =>
      prev.map((job) =>
        job.id === selectedMaintenanceId ? updatedJob : job
      )
    );

    await supabase
      .from("maintenance_jobs")
      .update({
        task_name: updatedJob.taskName,
        category: updatedJob.category,
        job_done: updatedJob.jobDone,
        labour_rate: updatedJob.labourRate,
        labour_total: labourTotal,
        total_cost: totalCost,
      })
      .eq("id", updatedJob.id);
  }

  async function deleteMaintenanceJob(jobId) {
    const job = maintenance.find((m) => m.id === jobId);

    if (job?.invoiceStatus === "Billed") {
      return alert("Delete the invoice first before removing this maintenance job.");
    }

    await supabase.from("maintenance_jobs").delete().eq("id", jobId);

    setMaintenance((prev) => prev.filter((job) => job.id !== jobId));

    if (selectedMaintenanceId === jobId) {
      setSelectedMaintenanceId("");
    }
  }

  async function createInvoiceForJob(job) {
    if (!job) {
      return alert("No job selected.");
    }

    if (job.status !== "Completed") {
      return alert("Only completed jobs can be invoiced.");
    }

    if (job.invoiceStatus === "Billed") {
      return alert("This task has already been invoiced.");
    }

    if (!job.propertyId && !job.crmPropertyId) {
      return alert("This job is not mapped to a CRM property.");
    }

    const propertyId = job.crmPropertyId || job.propertyId;

    const property =
      properties.find((p) => p.id === propertyId) || {
        id: propertyId,
        name: job.propertyName,
        address: job.propertyAddress,
      };

    const existingLocalInvoice = invoices.find((inv) => inv.jobId === job.id);

    if (existingLocalInvoice) {
      setSelectedInvoiceId(existingLocalInvoice.id);
      setActiveTab("invoices");
      return alert("An invoice already exists for this task.");
    }

    const { data: existingDbInvoice, error: existingError } = await supabase
      .from("invoices")
      .select("*")
      .eq("job_id", job.id)
      .maybeSingle();

    if (existingError) {
      return alert(existingError.message);
    }

    if (existingDbInvoice) {
      alert("An invoice already exists for this task.");
      await loadData();
      setSelectedInvoiceId(existingDbInvoice.id);
      setActiveTab("invoices");
      return;
    }

    const labourSubtotal = calculateJobLabour(job);
    const materialsTotal = Number(job.materialCost || 0);
    const total = labourSubtotal + materialsTotal;

    const invoice = {
      id: `INVREC-${Date.now()}-${job.id}`,
      jobId: job.id,
      source: "maintenance_job",
      invoiceNumber: generateInvoiceNumber(invoices),
      invoiceDate: todayISO(),
      dueDate: todayISO(),
      propertyId: property.id,
      propertyName: property.name,
      propertyAddress: property.address,
      labourSubtotal,
      materialsTotal,
      total,
      status: "Draft",
      notes: "Paid in full, thank you",
    };

    const { error: invoiceError } = await supabase.from("invoices").insert({
      id: invoice.id,
      job_id: invoice.jobId,
      source: invoice.source,
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
      notes: invoice.notes,
    });

    if (invoiceError) {
      return alert(invoiceError.message);
    }

    const item = {
      id: `ITEM-${job.id}-${Date.now()}`,
      invoiceId: invoice.id,
      jobId: job.id,
      title: job.title,
      taskName: job.taskName,
      labourHours: job.labourHours,
      labourRate: job.labourRate,
      labourCharge: labourSubtotal,
      materialCost: materialsTotal,
      totalCost: total,
    };

    const { error: itemError } = await supabase.from("invoice_items").insert({
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
    });

    if (itemError) {
      await supabase.from("invoices").delete().eq("id", invoice.id);
      return alert(itemError.message);
    }

    await supabase
      .from("maintenance_jobs")
      .update({ invoice_status: "Billed" })
      .eq("id", job.id);

    setInvoices((prev) => [invoice, ...prev]);
    setInvoiceItems((prev) => [item, ...prev]);

    setMaintenance((prev) =>
      prev.map((m) =>
        m.id === job.id ? { ...m, invoiceStatus: "Billed" } : m
      )
    );

    setSelectedInvoiceId(invoice.id);
    setActiveTab("invoices");
  }

  async function deleteInvoice(invoiceId) {
    const relatedItems = invoiceItems.filter((item) => item.invoiceId === invoiceId);
    const jobIds = relatedItems.map((item) => item.jobId);

    await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);
    await supabase.from("invoices").delete().eq("id", invoiceId);

    if (jobIds.length) {
      await supabase
        .from("maintenance_jobs")
        .update({ invoice_status: "Ready to Invoice" })
        .in("id", jobIds);
    }

    setInvoiceItems((prev) =>
      prev.filter((item) => item.invoiceId !== invoiceId)
    );

    setInvoices((prev) =>
      prev.filter((invoice) => invoice.id !== invoiceId)
    );

    setMaintenance((prev) =>
      prev.map((job) =>
        jobIds.includes(job.id)
          ? { ...job, invoiceStatus: "Ready to Invoice" }
          : job
      )
    );

    setSelectedInvoiceId("");
  }

  async function updateInvoiceStatus(invoiceId, status) {
    await supabase.from("invoices").update({ status }).eq("id", invoiceId);

    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === invoiceId ? { ...invoice, status } : invoice
      )
    );
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

    const updated = properties.map((p) =>
      p.id === selectedPropertyId ? { ...p, [field]: updatedValue } : p
    );

    setProperties(updated);

    const property = updated.find((p) => p.id === selectedPropertyId);

    if (property) {
      await supabase
        .from("properties")
        .update(propertyToDb(property))
        .eq("id", property.id);
    }
  }

  async function addLinenItem() {
    const item = {
      id: `LIN-${Date.now()}`,
      item: "New Linen Item",
      category: "General",
      currentStock: 0,
      minimumStock: 5,
      healthyStock: 20,
      notes: "",
    };

    const { error } = await supabase.from("linen_items").insert(linenToDb(item));

    if (error) return alert(error.message);

    setLinen((prev) => [...prev, item]);
    setSelectedLinenId(item.id);
  }

  async function updateLinen(field, value) {
    const numeric = ["currentStock", "minimumStock", "healthyStock"];
    const updatedValue = numeric.includes(field) ? Number(value) : value;

    const updated = linen.map((l) =>
      l.id === selectedLinenId ? { ...l, [field]: updatedValue } : l
    );

    setLinen(updated);

    const item = updated.find((l) => l.id === selectedLinenId);

    if (item) {
      await supabase
        .from("linen_items")
        .update(linenToDb(item))
        .eq("id", item.id);
    }
  }

  async function adjustLinenStock(id, amount) {
    const item = linen.find((l) => l.id === id);

    if (!item) return;

    const updatedItem = {
      ...item,
      currentStock: Math.max(0, Number(item.currentStock || 0) + amount),
    };

    setLinen((prev) =>
      prev.map((l) => (l.id === id ? updatedItem : l))
    );

    await supabase
      .from("linen_items")
      .update(linenToDb(updatedItem))
      .eq("id", id);
  }

  async function deleteLinenItem(id) {
    await supabase.from("linen_items").delete().eq("id", id);

    setLinen((prev) => prev.filter((item) => item.id !== id));

    if (selectedLinenId === id) {
      setSelectedLinenId("");
    }
  }

  if (loading) return <div className="loading-screen">Loading CRM...</div>;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <h2>OPS CRM</h2>
          <p>STR Cost Control</p>
        </div>

        {["dashboard", "linen", "maintenance", "invoices", "properties"].map(
          (tab) => (
            <button
              key={tab}
              type="button"
              className={activeTab === tab ? "nav-btn active" : "nav-btn"}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          )
        )}
      </aside>

      <main className="main-content">
        <header className="topbar no-print">
          <div>
            <h1>Internal CRM Dashboard</h1>
            <p>
              Premium operations control for linen, maintenance, invoices and
              properties.
            </p>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <>
            <div className="dashboard-filter-card">
              <label>Filter invoices by month</label>
              <select
                value={dashboardMonthFilter}
                onChange={(e) => setDashboardMonthFilter(e.target.value)}
              >
                {invoiceMonthOptions.map((month) => (
                  <option key={month} value={month}>
                    {formatMonth(month)}
                  </option>
                ))}
              </select>
            </div>

            <section className="stats-grid">
              <StatCard
                title="Maintenance Charged"
                value={money(dashboard.maintenanceCostsCharged)}
              />
              <StatCard
                title="Open Maintenance"
                value={dashboard.openMaintenance}
              />
              <StatCard title="Invoices" value={dashboard.invoices} />
              <StatCard title="Low Linen" value={dashboard.lowLinen} />
              <StatCard title="Reorder Soon" value={dashboard.reorderLinen} />
            </section>
          </>
        )}

        {activeTab === "linen" && (
          <div className="editor-grid">
            <section className="panel list-panel">
              <div className="section-head">
                <h3>Linen Inventory</h3>
                <button className="action-btn" onClick={addLinenItem}>
                  Add Linen
                </button>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Current</th>
                      <th>Minimum</th>
                      <th>Healthy</th>
                      <th>Status</th>
                      <th>Adjust</th>
                    </tr>
                  </thead>

                  <tbody>
                    {linen.map((item) => {
                      const status = getLinenStatus(item);

                      return (
                        <tr
                          key={item.id}
                          className={
                            selectedLinenId === item.id ? "selected-row" : ""
                          }
                          onClick={() => setSelectedLinenId(item.id)}
                        >
                          <td>{item.item}</td>
                          <td>{item.category}</td>
                          <td>{item.currentStock}</td>
                          <td>{item.minimumStock}</td>
                          <td>{item.healthyStock}</td>
                          <td>
                            <span className={`badge ${status}`}>
                              {getLinenLabel(status)}
                            </span>
                          </td>
                          <td>
                            <button
                              className="mini-action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                adjustLinenStock(item.id, -1);
                              }}
                            >
                              -
                            </button>

                            <button
                              className="mini-action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                adjustLinenStock(item.id, 1);
                              }}
                            >
                              +
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel form-panel">
              <h3>Edit Linen</h3>

              {selectedLinen ? (
                <div className="form-grid">
                  <Field label="Item">
                    <input
                      value={selectedLinen.item}
                      onChange={(e) => updateLinen("item", e.target.value)}
                    />
                  </Field>

                  <Field label="Category">
                    <input
                      value={selectedLinen.category}
                      onChange={(e) => updateLinen("category", e.target.value)}
                    />
                  </Field>

                  <Field label="Current Stock">
                    <input
                      type="number"
                      value={selectedLinen.currentStock}
                      onChange={(e) =>
                        updateLinen("currentStock", e.target.value)
                      }
                    />
                  </Field>

                  <Field label="Minimum Stock">
                    <input
                      type="number"
                      value={selectedLinen.minimumStock}
                      onChange={(e) =>
                        updateLinen("minimumStock", e.target.value)
                      }
                    />
                  </Field>

                  <Field label="Healthy Stock">
                    <input
                      type="number"
                      value={selectedLinen.healthyStock}
                      onChange={(e) =>
                        updateLinen("healthyStock", e.target.value)
                      }
                    />
                  </Field>

                  <Field label="Notes">
                    <input
                      value={selectedLinen.notes}
                      onChange={(e) => updateLinen("notes", e.target.value)}
                    />
                  </Field>

                  <div className="full-width">
                    <button
                      className="action-btn danger"
                      onClick={() => deleteLinenItem(selectedLinen.id)}
                    >
                      Delete Linen Item
                    </button>
                  </div>
                </div>
              ) : (
                <div className="empty-state">Select a linen item.</div>
              )}
            </section>
          </div>
        )}

        {activeTab === "maintenance" && (
          <div className="editor-grid">
            <section className="panel list-panel">
              <div className="section-head">
                <h3>Maintenance Jobs</h3>
                <button className="action-btn" onClick={addMaintenance}>
                  Add Job
                </button>
              </div>

              <div className="dashboard-filter-card">
                <label>Filter maintenance by month</label>
                <select
                  value={maintenanceMonthFilter}
                  onChange={(e) => setMaintenanceMonthFilter(e.target.value)}
                >
                  {maintenanceMonthOptions.map((month) => (
                    <option key={month} value={month}>
                      {formatMonth(month)}
                    </option>
                  ))}
                </select>
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
                      <th>Invoice</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMaintenanceJobs.length === 0 ? (
                      <tr>
                        <td colSpan="7">No maintenance jobs found for this month.</td>
                      </tr>
                    ) : (
                      filteredMaintenanceJobs.map((job) => (
                        <tr
                          key={job.id}
                          className={
                            selectedMaintenanceId === job.id ? "selected-row" : ""
                          }
                          onClick={() => setSelectedMaintenanceId(job.id)}
                        >
                          <td>{job.title}</td>
                          <td>{job.propertyName || "Unmapped Property"}</td>
                          <td>{job.taskName}</td>
                          <td>{job.status}</td>
                          <td>{money(job.totalCost)}</td>
                          <td>
                            {job.status === "Completed" && job.invoiceStatus !== "Billed" ? (
                              <button
                                className="mini-action-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  createInvoiceForJob(job);
                                }}
                              >
                                Invoice
                              </button>
                            ) : (
                              <span className="badge healthy">
                                {job.invoiceStatus || "Not Started"}
                              </span>
                            )}
                          </td>
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel form-panel">
              <h3>Edit Maintenance</h3>

              {selectedMaintenance ? (
                <div className="form-grid">
                  <Field label="Property">
                    <select
                      value={selectedMaintenance.propertyId || ""}
                      onChange={(e) =>
                        changeMaintenanceProperty(e.target.value)
                      }
                    >
                      <option value="">Select property</option>

                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Title">
                    <input
                      value={selectedMaintenance.title}
                      onChange={(e) =>
                        updateMaintenance("title", e.target.value)
                      }
                    />
                  </Field>

                  <Field label="Task">
                    <select
                      value={selectedMaintenance.taskName}
                      onChange={(e) => applyPriceGuide(e.target.value)}
                    >
                      {priceGuide.map((p) => (
                        <option key={p.task} value={p.task}>
                          {p.task}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Category">
                    <input value={selectedMaintenance.category} readOnly />
                  </Field>

                  <Field label="Status">
                    <select
                      value={selectedMaintenance.status}
                      onChange={(e) =>
                        updateMaintenance("status", e.target.value)
                      }
                    >
                      <option>Open</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  </Field>

                  <Field label="Labour Hours">
                    <input
                      type="number"
                      step="0.25"
                      value={selectedMaintenance.labourHours}
                      onChange={(e) =>
                        updateMaintenance("labourHours", e.target.value)
                      }
                    />
                  </Field>

                  <Field label="Hourly Rate">
                    <input value={selectedMaintenance.labourRate} readOnly />
                  </Field>

                  <Field label="Materials">
                    <input
                      type="number"
                      value={selectedMaintenance.materialCost}
                      onChange={(e) =>
                        updateMaintenance("materialCost", e.target.value)
                      }
                    />
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
                <button
                  className="action-btn"
                  onClick={() => {
                    const firstJob = invoiceJobs[0];

                    if (!firstJob) {
                      return alert("No completed jobs ready to invoice for this property.");
                    }

                    createInvoiceForJob(firstJob);
                  }}
                >
                  Generate First Ready Task Invoice
                </button>
              </div>

              <div className="form-grid">
                <Field label="Property">
                  <select
                    value={invoiceForm.propertyId}
                    onChange={(e) =>
                      setInvoiceForm((p) => ({
                        ...p,
                        propertyId: e.target.value,
                      }))
                    }
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Invoice Date">
                  <input
                    type="date"
                    value={invoiceForm.invoiceDate}
                    onChange={(e) =>
                      setInvoiceForm((p) => ({
                        ...p,
                        invoiceDate: e.target.value,
                      }))
                    }
                  />
                </Field>

                <Field label="Due Date">
                  <input
                    type="date"
                    value={invoiceForm.dueDate}
                    onChange={(e) =>
                      setInvoiceForm((p) => ({
                        ...p,
                        dueDate: e.target.value,
                      }))
                    }
                  />
                </Field>
              </div>

              <div className="calc-box">
                <h4>Jobs Ready to Bill Separately</h4>

                <div className="table-wrap small">
                  <table>
                    <thead>
                      <tr>
                        <th>Job</th>
                        <th>Task</th>
                        <th>Total</th>
                        <th>Invoice</th>
                      </tr>
                    </thead>

                    <tbody>
                      {invoiceJobs.length === 0 ? (
                        <tr>
                          <td colSpan="4">No completed jobs ready.</td>
                        </tr>
                      ) : (
                        invoiceJobs.map((job) => (
                          <tr key={job.id}>
                            <td>{job.title}</td>
                            <td>{job.taskName}</td>
                            <td>{money(job.totalCost)}</td>
                            <td>
                              <button
                                className="mini-action-btn"
                                onClick={() => createInvoiceForJob(job)}
                              >
                                Invoice
                              </button>
                            </td>
                          </tr>
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
                    <thead>
                      <tr>
                        <th>Invoice</th>
                        <th>Property</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {invoices.map((invoice) => (
                        <tr
                          key={invoice.id}
                          className={
                            selectedInvoiceId === invoice.id
                              ? "selected-row"
                              : ""
                          }
                          onClick={() => setSelectedInvoiceId(invoice.id)}
                        >
                          <td>{invoice.invoiceNumber}</td>
                          <td>{invoice.propertyName}</td>
                          <td>{invoice.status}</td>
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
                    <select
                      value={selectedInvoiceWithItems.status}
                      onChange={(e) =>
                        updateInvoiceStatus(
                          selectedInvoiceWithItems.id,
                          e.target.value
                        )
                      }
                    >
                      <option>Draft</option>
                      <option>Sent</option>
                      <option>Paid</option>
                    </select>

                    <button
                      className="action-btn danger"
                      onClick={() => deleteInvoice(selectedInvoiceWithItems.id)}
                    >
                      Delete
                    </button>

                    <button
                      className="action-btn secondary"
                      onClick={() => window.print()}
                    >
                      Print
                    </button>
                  </div>

                  <div className="invoice-paper">
                    <div className="invoice-header">
                      <img
                        src="/logo.png"
                        alt="Logo"
                        className="invoice-logo"
                      />

                      <div className="invoice-meta">
                        <h2>Maintenance Invoice</h2>
                        <div>
                          <strong>Invoice No:</strong>{" "}
                          {selectedInvoiceWithItems.invoiceNumber}
                        </div>
                        <div>
                          <strong>Date:</strong>{" "}
                          {formatDate(selectedInvoiceWithItems.invoiceDate)}
                        </div>
                        <div>
                          <strong>Due:</strong>{" "}
                          {formatDate(selectedInvoiceWithItems.dueDate)}
                        </div>
                        <div>
                          <strong>Status:</strong>{" "}
                          {selectedInvoiceWithItems.status}
                        </div>
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
                          {selectedInvoiceWithItems.items.map((item) => (
                            <tr key={item.id}>
                              <td>
                                {item.title} - {item.taskName}
                              </td>
                              <td>{item.labourHours}</td>
                              <td>{money(item.labourRate)}</td>
                              <td>{money(item.labourCharge)}</td>
                              <td>{money(item.materialCost)}</td>
                              <td>{money(item.totalCost)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="invoice-totals">
                      <div className="metric-row">
                        <span>Labour Subtotal</span>
                        <strong>
                          {money(selectedInvoiceWithItems.labourSubtotal)}
                        </strong>
                      </div>

                      <div className="metric-row">
                        <span>Materials Total</span>
                        <strong>
                          {money(selectedInvoiceWithItems.materialsTotal)}
                        </strong>
                      </div>

                      <div className="metric-row total-line">
                        <span>Grand Total</span>
                        <strong>{money(selectedInvoiceWithItems.total)}</strong>
                      </div>
                    </div>

                    <div className="invoice-notes">
                      <div className="bill-label">Notes</div>
                      <p>{selectedInvoiceWithItems.notes || "Paid in full, thank you"}</p>
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
                <button className="action-btn" onClick={addProperty}>
                  Add Property
                </button>
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
                    {properties.map((property) => (
                      <tr
                        key={property.id}
                        className={
                          selectedPropertyId === property.id
                            ? "selected-row"
                            : ""
                        }
                        onClick={() => setSelectedPropertyId(property.id)}
                      >
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
                    <input
                      value={selectedProperty.name}
                      onChange={(e) =>
                        updateProperty("name", e.target.value)
                      }
                    />
                  </Field>

                  <Field label="Address">
                    <input
                      value={selectedProperty.address}
                      onChange={(e) =>
                        updateProperty("address", e.target.value)
                      }
                    />
                  </Field>

                  <Field label="Beds">
                    <input
                      type="number"
                      value={selectedProperty.beds}
                      onChange={(e) =>
                        updateProperty("beds", e.target.value)
                      }
                    />
                  </Field>

                  <Field label="Approval Limit">
                    <input
                      type="number"
                      value={selectedProperty.approvalLimit}
                      onChange={(e) =>
                        updateProperty("approvalLimit", e.target.value)
                      }
                    />
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