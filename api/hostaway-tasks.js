import { createClient } from "@supabase/supabase-js";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const hostawayAccountId = Number(process.env.HOSTAWAY_ACCOUNT_ID);

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({
        step: "env_error",
        error: "Missing Supabase environment variables.",
      });
    }

    if (!process.env.HOSTAWAY_ACCOUNT_ID || !process.env.HOSTAWAY_API_KEY) {
      return res.status(500).json({
        step: "env_error",
        error: "Missing Hostaway environment variables.",
      });
    }

    if (!Number.isFinite(hostawayAccountId)) {
      return res.status(500).json({
        step: "env_error",
        error: "HOSTAWAY_ACCOUNT_ID must be a number.",
      });
    }

    // 1. GET HOSTAWAY TOKEN
    const tokenRes = await fetch("https://api.hostaway.com/v1/accessTokens", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.HOSTAWAY_ACCOUNT_ID,
        client_secret: process.env.HOSTAWAY_API_KEY,
        scope: "general",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      return res.status(500).json({
        step: "token_error",
        error: tokenData,
      });
    }

    const hostawayToken = tokenData.access_token;

    // 2. FETCH HOSTAWAY TASKS
    const tasksRes = await fetch("https://api.hostaway.com/v1/tasks", {
      headers: {
        Authorization: `Bearer ${hostawayToken}`,
      },
    });

    const tasksData = await tasksRes.json();

    if (!tasksRes.ok) {
      return res.status(500).json({
        step: "hostaway_tasks_error",
        error: tasksData,
      });
    }

    const tasks = tasksData.result || [];

    // 3. FETCH HOSTAWAY LISTINGS
    const listingsRes = await fetch("https://api.hostaway.com/v1/listings", {
      headers: {
        Authorization: `Bearer ${hostawayToken}`,
      },
    });

    const listingsData = await listingsRes.json();

    if (!listingsRes.ok) {
      return res.status(500).json({
        step: "hostaway_listings_error",
        error: listingsData,
      });
    }

    const listings = listingsData.result || [];

    const listingMap = {};
    listings.forEach((listing) => {
      listingMap[String(listing.id)] = listing.name;
    });

    // 4. FETCH HOSTAWAY → CRM PROPERTY MAP
    const { data: propertyMap, error: mapError } = await supabase
      .from("hostaway_property_map")
      .select("hostaway_listing_id, property_id");

    if (mapError) {
      return res.status(500).json({
        step: "property_map_error",
        error: mapError.message,
      });
    }

    // 5. FETCH CRM PROPERTIES
    const { data: properties, error: propertiesError } = await supabase
      .from("properties")
      .select("id, name, address");

    if (propertiesError) {
      return res.status(500).json({
        step: "properties_error",
        error: propertiesError.message,
      });
    }

    const mapByHostawayId = {};
    (propertyMap || []).forEach((row) => {
      mapByHostawayId[String(row.hostaway_listing_id)] = row.property_id;
    });

    const propertiesById = {};
    (properties || []).forEach((property) => {
      propertiesById[String(property.id)] = property;
    });

    // 6. FILTER COMPLETED TASKS ONLY
    const completedTasks = tasks.filter((task) =>
      ["completed", "done"].includes(
        String(task.status || "").trim().toLowerCase()
      )
    );

    // 7. MAP TASKS INTO CRM FORMAT
    const preparedRows = completedTasks.map((task) => {
      const description = task.description || "";
      const title = task.title || "";

      const parsedDetails = extractStructuredTaskDetails(description);

      const jobDoneText = parsedDetails.jobDone || title || description;
      const labourType = detectLabourType(jobDoneText, jobDoneText);
      const rate = getLabourRate(labourType);

      const labourHours = parsedDetails.labourHours || 1;
      const materialCost = parsedDetails.materialCost || 0;

      const labourTotal = labourHours * rate;
      const totalCost = labourTotal + materialCost;

      const hostawayListingId = String(
        task.listingMapId ||
          task.listingId ||
          task.listing?.id ||
          task.listing_map_id ||
          ""
      );

      const hostawayName = listingMap[hostawayListingId] || "";

      const crmPropertyId = mapByHostawayId[hostawayListingId] || null;

      const matchedProperty = crmPropertyId
        ? propertiesById[String(crmPropertyId)]
        : null;

      const completedAt =
        task.completedAt ||
        task.completed_at ||
        task.completionDate ||
        task.completion_date ||
        task.doneAt ||
        task.done_at ||
        task.updatedAt ||
        task.updated_at ||
        task.endDate ||
        task.end_date ||
        task.createdAt ||
        task.created_at ||
        null;

      const row = {
        id: `HA-${task.id}`,
        external_id: String(task.id),

        property_id: matchedProperty ? matchedProperty.id : null,

        hostaway_listing_id: hostawayListingId,
        hostaway_listing_name: hostawayName,

        crm_property_id: matchedProperty ? matchedProperty.id : null,

        property_name: matchedProperty ? matchedProperty.name : hostawayName,
        property_address: matchedProperty ? matchedProperty.address : "",

        title: title || "Hostaway Task",
        description: description,

        task_name: labourType,
        category: labourType,
        job_done: parsedDetails.jobDone || labourType,

        assigned_to: "Hostaway",
        status: "Completed",

        labour_hours: labourHours,
        labour_rate: rate,
        labour_total: labourTotal,
        material_cost: materialCost,
        total_cost: totalCost,

        completed_at: completedAt,
      };

      return {
        rawTask: task,
        row,
        autoInvoiceReady:
          Boolean(matchedProperty) &&
          Boolean(hostawayListingId) &&
          parsedDetails.hasLabourHours &&
          parsedDetails.hasJobDone &&
          parsedDetails.hasMaterialCost,
      };
    });

    const jobIds = preparedRows.map((item) => item.row.id);

    // 8. CHECK EXISTING MAINTENANCE JOB STATUSES
    const { data: existingJobs, error: existingJobsError } = await supabase
      .from("maintenance_jobs")
      .select("id, invoice_status")
      .in("id", jobIds.length ? jobIds : ["__none__"]);

    if (existingJobsError) {
      return res.status(500).json({
        step: "existing_jobs_error",
        error: existingJobsError.message,
      });
    }

    const existingJobStatusById = {};
    (existingJobs || []).forEach((job) => {
      existingJobStatusById[job.id] = job.invoice_status;
    });

    // 9. CHECK EXISTING INVOICES TO PREVENT DUPLICATES
    const { data: existingInvoices, error: existingInvoicesError } =
      await supabase
        .from("invoices")
        .select(
          "id, job_id, invoice_number, hostaway_expense_id, hostaway_expense_status"
        )
        .in("job_id", jobIds.length ? jobIds : ["__none__"]);

    if (existingInvoicesError) {
      return res.status(500).json({
        step: "existing_invoices_error",
        error: existingInvoicesError.message,
      });
    }

    const invoicedJobIds = new Set(
      (existingInvoices || []).map((invoice) => invoice.job_id)
    );

    // 10. UPSERT MAINTENANCE JOBS
    const rows = preparedRows.map((item) => {
      const existingStatus = existingJobStatusById[item.row.id];

      const invoiceStatus =
        invoicedJobIds.has(item.row.id) || existingStatus === "Billed"
          ? "Billed"
          : "Ready to Invoice";

      return {
        ...item.row,
        invoice_status: invoiceStatus,
      };
    });

    const { error: upsertError } = await supabase
      .from("maintenance_jobs")
      .upsert(rows, { onConflict: "id" });

    if (upsertError) {
      return res.status(500).json({
        step: "supabase_insert_error",
        error: upsertError.message,
      });
    }

    // 11. AUTO-CREATE CRM INVOICES
    const autoInvoiceCandidates = preparedRows
      .filter((item) => {
        const jobId = item.row.id;
        const existingStatus = existingJobStatusById[jobId];

        return (
          item.autoInvoiceReady &&
          !invoicedJobIds.has(jobId) &&
          existingStatus !== "Billed" &&
          item.row.crm_property_id &&
          item.row.status === "Completed"
        );
      })
      .map((item) => item.row);

    const createdInvoices = [];
    const createdInvoiceItems = [];

    if (autoInvoiceCandidates.length > 0) {
      let nextInvoiceSequence = await getNextInvoiceSequence(supabase);

      for (const job of autoInvoiceCandidates) {
        const invoiceNumber = makeInvoiceNumber(nextInvoiceSequence);
        nextInvoiceSequence += 1;

        const timestamp = Date.now();
        const invoiceId = `INVREC-${timestamp}-${job.id}`;
        const itemId = `ITEM-${job.id}-${timestamp}`;

        const invoiceDate = todayISO();
        const dueDate = todayISO();

        const labourSubtotal =
          Number(job.labour_total || 0) ||
          Number(job.labour_hours || 0) * Number(job.labour_rate || 0);

        const materialsTotal = Number(job.material_cost || 0);
        const total = labourSubtotal + materialsTotal;

        createdInvoices.push({
          id: invoiceId,
          job_id: job.id,
          source: "maintenance_job",
          invoice_number: invoiceNumber,
          invoice_date: invoiceDate,
          due_date: dueDate,
          property_id: job.crm_property_id || job.property_id,
          property_name: job.property_name,
          property_address: job.property_address,
          labour_subtotal: labourSubtotal,
          materials_total: materialsTotal,
          total: total,
          status: "Draft",
          notes: "Paid in full, thank you",
          hostaway_expense_status: "Pending",
          hostaway_expense_id: null,
          hostaway_expense_error: null,
          invoice_pdf_url: null,
        });

        createdInvoiceItems.push({
          id: itemId,
          invoice_id: invoiceId,
          job_id: job.id,
          title: job.title || job.job_done || job.task_name,
          task_name: job.task_name || job.job_done,
          labour_hours: Number(job.labour_hours || 0),
          labour_rate: Number(job.labour_rate || 0),
          labour_charge: labourSubtotal,
          material_cost: materialsTotal,
          total_cost: total,
        });
      }

      const { error: invoiceInsertError } = await supabase
        .from("invoices")
        .insert(createdInvoices);

      if (invoiceInsertError) {
        return res.status(500).json({
          step: "auto_invoice_insert_error",
          error: invoiceInsertError.message,
        });
      }

      const { error: itemInsertError } = await supabase
        .from("invoice_items")
        .insert(createdInvoiceItems);

      if (itemInsertError) {
        await supabase
          .from("invoices")
          .delete()
          .in(
            "id",
            createdInvoices.map((invoice) => invoice.id)
          );

        return res.status(500).json({
          step: "auto_invoice_items_insert_error",
          error: itemInsertError.message,
        });
      }

      const billedJobIds = autoInvoiceCandidates.map((job) => job.id);

      const { error: billedUpdateError } = await supabase
        .from("maintenance_jobs")
        .update({ invoice_status: "Billed" })
        .in("id", billedJobIds);

      if (billedUpdateError) {
        return res.status(500).json({
          step: "auto_invoice_job_status_error",
          error: billedUpdateError.message,
        });
      }
    }

    // 12. CREATE HOSTAWAY EXPENSES WITH PDF ATTACHMENT
    const hostawayExpenseResults = [];

    for (const invoice of createdInvoices) {
      const job = autoInvoiceCandidates.find((j) => j.id === invoice.job_id);

      if (!job) {
        continue;
      }

      if (!job.hostaway_listing_id) {
        hostawayExpenseResults.push({
          invoice_number: invoice.invoice_number,
          job_id: invoice.job_id,
          status: "Skipped",
          error: "Missing Hostaway listingMapId.",
        });

        await updateInvoiceExpenseStatus(supabase, invoice.id, {
          status: "Skipped",
          error: "Missing Hostaway listingMapId.",
        });

        continue;
      }

      const expenseDate = job.completed_at
        ? String(job.completed_at).slice(0, 10)
        : todayISO();

      const concept = makeHostawayExpenseConcept({
        invoiceNumber: invoice.invoice_number,
        jobTitle: job.title,
        jobDone: job.job_done,
        taskName: job.task_name,
      });

      const amount = -Math.abs(Number(invoice.total || 0));

      if (!amount || Number.isNaN(amount)) {
        hostawayExpenseResults.push({
          invoice_number: invoice.invoice_number,
          job_id: invoice.job_id,
          status: "Skipped",
          error: "Invoice total is zero or invalid.",
        });

        await updateInvoiceExpenseStatus(supabase, invoice.id, {
          status: "Skipped",
          error: "Invoice total is zero or invalid.",
        });

        continue;
      }

      let invoicePdfUrl = null;
      let pdfFileName = null;

      try {
        pdfFileName = `${invoice.invoice_number}-${job.id}.pdf`;

        const invoicePdfBuffer = await generateInvoicePdfBuffer({
          invoiceNumber: invoice.invoice_number,
          invoiceDate: invoice.invoice_date,
          dueDate: invoice.due_date,
          propertyName: invoice.property_name,
          propertyAddress: invoice.property_address,
          jobTitle: job.title,
          taskName: job.task_name,
          labourHours: Number(job.labour_hours || 0),
          labourRate: Number(job.labour_rate || 0),
          labourSubtotal: Number(invoice.labour_subtotal || 0),
          materialsTotal: Number(invoice.materials_total || 0),
          total: Number(invoice.total || 0),
        });

        invoicePdfUrl = await uploadInvoicePdfToSupabase({
          supabase,
          fileName: pdfFileName,
          pdfBuffer: invoicePdfBuffer,
        });

        await supabase
          .from("invoices")
          .update({ invoice_pdf_url: invoicePdfUrl })
          .eq("id", invoice.id);
      } catch (pdfError) {
        await updateInvoiceExpenseStatus(supabase, invoice.id, {
          status: "Failed",
          error: `PDF generation/upload failed: ${pdfError.message}`,
        });

        hostawayExpenseResults.push({
          invoice_number: invoice.invoice_number,
          job_id: invoice.job_id,
          status: "Failed",
          error: `PDF generation/upload failed: ${pdfError.message}`,
        });

        continue;
      }

      const expensePayload = {
        accountId: hostawayAccountId,
        ownerStatementId: null,
        listingMapId: Number(job.hostaway_listing_id),
        reservationId: null,
        expenseDate,
        concept,
        amount,
        isDeleted: 0,
        ownerUserId: null,
        ownerStatementIds: [],
        categories: [],
        categoriesNames: ["Maintenance"],

        // Hostaway docs show attachments as an array but do not show the exact file object format.
        // This sends a public PDF URL as an attachment object.
        attachments: [
          {
            name: pdfFileName,
            url: invoicePdfUrl,
          },
        ],
      };

      const expenseResult = await createHostawayExpense({
        token: hostawayToken,
        payload: expensePayload,
      });

      if (expenseResult.ok) {
        const expenseId = String(expenseResult.data?.result?.id || "");

        await updateInvoiceExpenseStatus(supabase, invoice.id, {
          status: "Created",
          expenseId,
          error: null,
        });

        hostawayExpenseResults.push({
          invoice_number: invoice.invoice_number,
          job_id: invoice.job_id,
          status: "Created",
          hostaway_expense_id: expenseId,
          amount,
          listingMapId: Number(job.hostaway_listing_id),
          invoice_pdf_url: invoicePdfUrl,
          attachment_format_sent: {
            name: pdfFileName,
            url: invoicePdfUrl,
          },
        });
      } else {
        await updateInvoiceExpenseStatus(supabase, invoice.id, {
          status: "Failed",
          error: JSON.stringify(expenseResult.data || expenseResult.error),
        });

        hostawayExpenseResults.push({
          invoice_number: invoice.invoice_number,
          job_id: invoice.job_id,
          status: "Failed",
          error: expenseResult.data || expenseResult.error,
          payload: expensePayload,
        });
      }

      await sleep(700);
    }

    return res.status(200).json({
      message: "Hostaway sync complete",
      total_tasks: tasks.length,
      completed_tasks: completedTasks.length,
      inserted_or_updated: rows.length,
      mapped_jobs: rows.filter((r) => r.crm_property_id).length,
      unmapped_jobs: rows.filter((r) => !r.crm_property_id).length,
      auto_invoice_candidates: autoInvoiceCandidates.length,
      auto_invoices_created: createdInvoices.length,
      hostaway_expenses_attempted: hostawayExpenseResults.length,
      hostaway_expenses_created: hostawayExpenseResults.filter(
        (r) => r.status === "Created"
      ).length,
      hostaway_expenses_failed: hostawayExpenseResults.filter(
        (r) => r.status === "Failed"
      ).length,
      sample_rows: rows.slice(0, 5).map((r) => ({
        id: r.id,
        hostaway_listing_id: r.hostaway_listing_id,
        hostaway_listing_name: r.hostaway_listing_name,
        crm_property_id: r.crm_property_id,
        property_name: r.property_name,
        completed_at: r.completed_at,
        job_done: r.job_done,
        labour_hours: r.labour_hours,
        labour_rate: r.labour_rate,
        labour_total: r.labour_total,
        material_cost: r.material_cost,
        total_cost: r.total_cost,
        invoice_status: r.invoice_status,
      })),
      sample_auto_invoices: createdInvoices.slice(0, 5).map((invoice) => ({
        invoice_number: invoice.invoice_number,
        job_id: invoice.job_id,
        property_name: invoice.property_name,
        total: invoice.total,
        hostaway_expense_status: invoice.hostaway_expense_status,
      })),
      sample_hostaway_expenses: hostawayExpenseResults.slice(0, 5),
    });
  } catch (error) {
    return res.status(500).json({
      step: "server_error",
      error: error.message,
    });
  }
}

/* ---------------- HELPERS ---------------- */

function extractStructuredTaskDetails(description = "") {
  const text = String(description || "");

  const labourHoursMatch = text.match(
    /labou?r\s*hours?\s*:\s*([0-9]+(?:\.[0-9]+)?)/i
  );

  const jobDoneMatch = text.match(
    /what\s*job\s*was\s*done\s*:\s*([\s\S]*?)(?=\n\s*materials?\s*cost\s*:|$)/i
  );

  const materialCostMatch = text.match(
    /materials?\s*cost\s*:\s*£?\s*([0-9]+(?:\.[0-9]+)?)/i
  );

  return {
    labourHours: labourHoursMatch ? Number(labourHoursMatch[1]) : 1,
    jobDone: jobDoneMatch ? jobDoneMatch[1].trim() : "",
    materialCost: materialCostMatch ? Number(materialCostMatch[1]) : 0,

    hasLabourHours: Boolean(labourHoursMatch),
    hasJobDone: Boolean(jobDoneMatch),
    hasMaterialCost: Boolean(materialCostMatch),
  };
}

function detectLabourType(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();

  if (text.includes("light") || text.includes("bulb"))
    return "Light bulb replacement";
  if (text.includes("appliance") || text.includes("reset"))
    return "Appliance check / reset";
  if (text.includes("paint") || text.includes("decor"))
    return "Painting and décor touch-up";
  if (text.includes("sink") || text.includes("clog"))
    return "Clogged sink";
  if (text.includes("lock")) return "Locks / lock adjustment";
  if (text.includes("plumb")) return "Misc plumbing";
  if (text.includes("electric")) return "Misc electrical";
  if (text.includes("floor")) return "Flooring repair";
  if (text.includes("toilet")) return "Toilet blockage";
  if (text.includes("shower") || text.includes("silicone"))
    return "Shower / silicone reseal";
  if (text.includes("door")) return "Door alignment / easing";
  if (text.includes("curtain") || text.includes("blind"))
    return "Curtain / blind fix";
  if (text.includes("smoke alarm"))
    return "Smoke alarm battery / replacement";
  if (text.includes("extractor"))
    return "Extractor fan clean / minor fix";
  if (text.includes("fridge") || text.includes("freezer"))
    return "Fridge / freezer defrost service";

  return "Misc handyman";
}

function getLabourRate(taskName) {
  const rates = {
    "Light bulb replacement": 10,
    "Appliance check / reset": 40,
    "Painting and décor touch-up": 40,
    "Clogged sink": 40,
    "Locks / lock adjustment": 30,
    "Misc plumbing": 40,
    "Misc electrical": 40,
    "Misc handyman": 40,
    "Flooring repair": 40,
    "Toilet blockage": 30,
    "Shower / silicone reseal": 40,
    "Door alignment / easing": 50,
    "Curtain / blind fix": 40,
    "Smoke alarm battery / replacement": 30,
    "Extractor fan clean / minor fix": 40,
    "Fridge / freezer defrost service": 40,
    "Freezer / fridge defrost service": 40,
  };

  return rates[taskName] || 40;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function makeInvoiceNumber(sequence) {
  const year = new Date().getFullYear();
  return `INV-${year}-${String(sequence).padStart(4, "0")}`;
}

async function getNextInvoiceSequence(supabase) {
  const year = new Date().getFullYear();

  const { data, error } = await supabase
    .from("invoices")
    .select("invoice_number")
    .ilike("invoice_number", `INV-${year}-%`);

  if (error) {
    throw new Error(error.message);
  }

  const numbers = (data || [])
    .map((invoice) => {
      const lastPart = String(invoice.invoice_number || "").split("-").pop();
      return Number(lastPart);
    })
    .filter((number) => Number.isFinite(number));

  const highest = numbers.length ? Math.max(...numbers) : 0;

  return highest + 1;
}

function makeHostawayExpenseConcept({
  invoiceNumber,
  jobTitle,
  jobDone,
  taskName,
}) {
  const cleanJob =
    String(jobDone || taskName || jobTitle || "Maintenance")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160) || "Maintenance";

  return `Maintenance - ${cleanJob} (${invoiceNumber})`.slice(0, 255);
}

async function createHostawayExpense({ token, payload }) {
  try {
    const response = await fetch("https://api.hostaway.com/v1/expenses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.status === "fail") {
      return {
        ok: false,
        status: response.status,
        data,
      };
    }

    return {
      ok: true,
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

async function updateInvoiceExpenseStatus(
  supabase,
  invoiceId,
  { status, expenseId = null, error = null }
) {
  const update = {
    hostaway_expense_status: status,
    hostaway_expense_error: error,
  };

  if (expenseId) {
    update.hostaway_expense_id = expenseId;
  }

  await supabase.from("invoices").update(update).eq("id", invoiceId);
}

async function generateInvoicePdfBuffer({
  invoiceNumber,
  invoiceDate,
  dueDate,
  propertyName,
  propertyAddress,
  jobTitle,
  taskName,
  labourHours,
  labourRate,
  labourSubtotal,
  materialsTotal,
  total,
}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const drawText = (text, x, y, size = 10, bold = false) => {
    page.drawText(String(text || ""), {
      x,
      y,
      size,
      font: bold ? boldFont : font,
      color: rgb(0.05, 0.08, 0.15),
    });
  };

  const drawMoney = (amount) => `£${Number(amount || 0).toFixed(2)}`;

  drawText("CAPITAL STAY", 50, 790, 20, true);
  drawText("Maintenance Invoice", 380, 790, 18, true);

  drawText(`Invoice No: ${invoiceNumber}`, 380, 760, 10, true);
  drawText(`Date: ${invoiceDate}`, 380, 745, 10);
  drawText(`Due: ${dueDate}`, 380, 730, 10);

  page.drawLine({
    start: { x: 50, y: 710 },
    end: { x: 545, y: 710 },
    thickness: 1,
    color: rgb(0.1, 0.25, 0.55),
  });

  drawText("PROPERTY", 50, 680, 9, true);
  drawText(propertyName, 50, 660, 12, true);
  drawText(propertyAddress, 50, 645, 10);

  drawText("DESCRIPTION", 50, 595, 9, true);
  drawText("HOURS", 290, 595, 9, true);
  drawText("RATE", 350, 595, 9, true);
  drawText("LABOUR", 410, 595, 9, true);
  drawText("MATERIALS", 470, 595, 9, true);
  drawText("TOTAL", 535, 595, 9, true);

  page.drawLine({
    start: { x: 50, y: 585 },
    end: { x: 545, y: 585 },
    thickness: 0.5,
    color: rgb(0.75, 0.78, 0.82),
  });

  drawText(`${jobTitle || "Maintenance"} - ${taskName || ""}`, 50, 560, 9);
  drawText(labourHours, 290, 560, 9);
  drawText(drawMoney(labourRate), 350, 560, 9);
  drawText(drawMoney(labourSubtotal), 410, 560, 9);
  drawText(drawMoney(materialsTotal), 470, 560, 9);
  drawText(drawMoney(total), 535, 560, 9);

  page.drawLine({
    start: { x: 50, y: 545 },
    end: { x: 545, y: 545 },
    thickness: 0.5,
    color: rgb(0.75, 0.78, 0.82),
  });

  drawText("Labour Subtotal", 360, 500, 10);
  drawText(drawMoney(labourSubtotal), 480, 500, 10, true);

  drawText("Materials Total", 360, 475, 10);
  drawText(drawMoney(materialsTotal), 480, 475, 10, true);

  page.drawLine({
    start: { x: 360, y: 460 },
    end: { x: 545, y: 460 },
    thickness: 1,
    color: rgb(0.1, 0.25, 0.55),
  });

  drawText("Grand Total", 360, 435, 12, true);
  drawText(drawMoney(total), 480, 435, 12, true);

  drawText("NOTES", 50, 390, 9, true);
  drawText("Paid in full, thank you", 50, 370, 10);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

async function uploadInvoicePdfToSupabase({ supabase, fileName, pdfBuffer }) {
  const safeFileName = fileName.replace(/[^a-zA-Z0-9-.]/g, "_");
  const filePath = `hostaway-invoices/${safeFileName}`;

  const { error: uploadError } = await supabase.storage
    .from("crm-invoices")
    .upload(filePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Invoice PDF upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from("crm-invoices")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}