import type { ApprovalTaskForm } from '@/api/demo/approvalTask/types';

export class ApprovalTaskClass implements ApprovalTaskForm {
  businessType?: string;
  taskName?: string;
  approvalStatus?: string;
  comments?: string;
  businessKey?: string;

  constructor(overrides?: Partial<ApprovalTaskForm>) {
    Object.assign(this, overrides);
  }
}
