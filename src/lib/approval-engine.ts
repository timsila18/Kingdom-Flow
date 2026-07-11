import { approvalActions, approvalRequests, approvalWorkflows, conflictDeclarations } from "./authority-data";
import { canApprove } from "./authority-engine";
import type { ApprovalRequest } from "./types";

export function getApprovalInbox(userId: string, tenantId: string) {
  return approvalRequests.filter((request) => {
    if (request.tenantId !== tenantId) return false;
    const workflow = approvalWorkflows.find((item) => item.id === request.workflowId);
    const step = workflow?.steps.find((item) => item.order === request.currentStepOrder);
    return Boolean(step && request.status !== "approved" && request.status !== "rejected");
  });
}

export function getSubmittedApprovals(userId: string, tenantId: string) {
  return approvalRequests.filter((request) => request.tenantId === tenantId && request.requesterUserId === userId);
}

export function decideApproval(request: ApprovalRequest, approverUserId: string, decision: "approved" | "rejected" | "returned") {
  const auth = canApprove(approverUserId, request.action, {
    tenantId: request.tenantId,
    scopeType: request.scopeType,
    scopeId: request.scopeId,
    actorUserId: request.requesterUserId,
  });
  if (!auth.allowed) return { request, allowed: false, reason: auth.reason };

  const workflow = approvalWorkflows.find((item) => item.id === request.workflowId);
  if (!workflow) return { request, allowed: false, reason: "Workflow version no longer exists." };

  if (decision === "rejected") return { request: { ...request, status: "rejected" as const, completedAt: "2026-07-11T12:30:00.000Z" }, allowed: true, reason: "Request rejected and audited." };
  if (decision === "returned") return { request: { ...request, status: "returned" as const }, allowed: true, reason: "Request returned for revision." };

  const nextStep = workflow.steps.find((step) => step.order > request.currentStepOrder);
  if (nextStep) {
    return { request: { ...request, currentStepOrder: nextStep.order, status: "partially_approved" as const }, allowed: true, reason: "Step approved; request advanced to the next approver." };
  }

  return { request: { ...request, status: "approved" as const, completedAt: "2026-07-11T12:30:00.000Z" }, allowed: true, reason: "Final step approved; request is complete." };
}

export function getApprovalHistory(requestId: string) {
  return approvalActions.filter((action) => action.requestId === requestId);
}

export function getConflictDeclarations(requestId: string) {
  return conflictDeclarations.filter((conflict) => conflict.requestId === requestId);
}
