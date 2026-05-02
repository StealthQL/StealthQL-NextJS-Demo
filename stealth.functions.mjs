export async function createProject(ctx, input = {}) {
  const result = await ctx.mutate("projects", "insert", {
    id: input.id,
    orgId: input.orgId ?? ctx.actor.activeOrgId,
    ownerId: ctx.actor.id,
    name: input.name ?? "Untitled project",
    visibility: input.visibility ?? "private",
    status: input.status ?? "active",
    createdAt: new Date().toISOString()
  });

  await ctx.ports.email.send({
    to: ctx.actor.email,
    subject: "Project created",
    text: "Your StealthQL project was materialized locally."
  });

  return { projectId: result.row.id };
}

export async function sendInvoiceReminder(ctx, input = {}) {
  const invoices = await ctx.query("invoices");
  const invoice = input.invoiceId
    ? invoices.find((candidate) => candidate.id === input.invoiceId)
    : invoices[0];
  if (!invoice) {
    return {
      sent: false,
      reason: input.invoiceId ? "invoice not found or not visible" : "no visible invoice",
    };
  }

  const email = await ctx.ports.email.send({
    to: ctx.actor.email,
    subject: `Invoice reminder: ${invoice.customerName}`,
    text: `Invoice ${invoice.id} is currently ${invoice.status}.`
  });

  return { sent: true, invoiceId: invoice.id, emailId: email.id };
}

export default {
  createProject,
  sendInvoiceReminder
};
