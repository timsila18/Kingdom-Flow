create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  account_code text not null,
  account_name text not null,
  account_type text not null check (account_type in ('asset','liability','equity','income','expense')),
  subtype text not null,
  parent_account_id uuid references public.accounts(id),
  currency text not null default 'KES',
  control_account boolean not null default false,
  restricted_fund_compatible boolean not null default false,
  project_compatible boolean not null default false,
  department_compatible boolean not null default false,
  active boolean not null default true,
  posting_allowed boolean not null default true,
  opening_balance numeric(14,2) not null default 0,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, account_code)
);

create table public.accounting_periods (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  period_type text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'open' check (status in ('open','soft_closed','closed','locked')),
  closed_by uuid references public.profiles(id),
  close_date timestamptz,
  reopen_approval_id uuid,
  lock_reason text,
  unique (tenant_id, start_date, end_date)
);

create table public.journals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  department_id uuid,
  project_id uuid,
  fund_id uuid references public.funds(id),
  period_id uuid not null references public.accounting_periods(id),
  journal_number text not null,
  journal_date date not null,
  source text not null,
  reference text,
  description text not null,
  status text not null default 'draft',
  created_by uuid references public.profiles(id),
  reviewed_by uuid references public.profiles(id),
  approved_by uuid references public.profiles(id),
  posted_by uuid references public.profiles(id),
  posting_date timestamptz,
  reversal_reference_id uuid references public.journals(id),
  attachments text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, journal_number)
);

create table public.journal_lines (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  journal_id uuid not null references public.journals(id) on delete cascade,
  account_id uuid not null references public.accounts(id),
  debit numeric(14,2) not null default 0 check (debit >= 0),
  credit numeric(14,2) not null default 0 check (credit >= 0),
  currency text not null default 'KES',
  exchange_rate numeric(18,8),
  branch_id uuid references public.branches(id),
  department_id uuid,
  project_id uuid,
  fund_id uuid references public.funds(id),
  person_id uuid references public.people(id),
  supplier_id uuid,
  customer_id uuid,
  memo text,
  restricted_fund_reference uuid references public.funds(id),
  source_transaction_type text,
  source_transaction_id uuid,
  check (not (debit > 0 and credit > 0)),
  check (debit > 0 or credit > 0)
);

create table public.posting_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  source text not null,
  debit_account_id uuid not null references public.accounts(id),
  credit_account_id uuid not null references public.accounts(id),
  active boolean not null default true,
  preview_required boolean not null default true,
  approval_required boolean not null default true,
  created_by uuid references public.profiles(id)
);

create table public.fund_balances (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  fund_id uuid not null references public.funds(id) on delete cascade,
  branch_id uuid references public.branches(id),
  project_id uuid,
  inflows numeric(14,2) not null default 0,
  outflows numeric(14,2) not null default 0,
  commitments numeric(14,2) not null default 0,
  restricted boolean not null default false,
  unique (tenant_id, fund_id, branch_id, project_id)
);

create table public.financial_accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  label text not null,
  account_type text not null,
  account_id uuid not null references public.accounts(id),
  payment_destination_id uuid references public.payment_destinations(id),
  custodian_user_id uuid references public.profiles(id),
  signatory_user_ids uuid[] not null default '{}',
  currency text not null default 'KES',
  opening_balance numeric(14,2) not null default 0,
  active boolean not null default true,
  reconciliation_required boolean not null default true,
  statement_format text,
  approval_rule text
);

create table public.bank_statements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  financial_account_id uuid not null references public.financial_accounts(id),
  statement_reference text not null,
  opening_balance numeric(14,2) not null default 0,
  closing_balance numeric(14,2) not null default 0,
  imported_by uuid references public.profiles(id),
  imported_at timestamptz not null default now(),
  status text not null default 'imported'
);

create table public.bank_statement_rows (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  bank_statement_id uuid references public.bank_statements(id) on delete cascade,
  financial_account_id uuid not null references public.financial_accounts(id),
  transaction_date date not null,
  description text,
  reference text,
  amount numeric(14,2) not null,
  matched_journal_id uuid references public.journals(id),
  status text not null default 'unmatched'
);

create table public.bank_reconciliations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  financial_account_id uuid not null references public.financial_accounts(id),
  period_id uuid not null references public.accounting_periods(id),
  opening_balance numeric(14,2) not null default 0,
  statement_closing_balance numeric(14,2) not null default 0,
  system_closing_balance numeric(14,2) not null default 0,
  unmatched_total numeric(14,2) not null default 0,
  status text not null default 'draft',
  prepared_by uuid references public.profiles(id),
  approved_by uuid references public.profiles(id),
  locked_at timestamptz
);

create table public.reconciliation_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  reconciliation_id uuid not null references public.bank_reconciliations(id) on delete cascade,
  item_type text not null,
  statement_row_id uuid references public.bank_statement_rows(id),
  journal_id uuid references public.journals(id),
  amount numeric(14,2) not null,
  status text not null default 'open'
);

create table public.petty_cash_accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  account_id uuid references public.accounts(id),
  custodian_user_id uuid references public.profiles(id),
  float_amount numeric(14,2) not null default 0,
  status text not null default 'active'
);

create table public.petty_cash_transactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  petty_cash_account_id uuid not null references public.petty_cash_accounts(id),
  transaction_type text not null,
  amount numeric(14,2) not null check (amount >= 0),
  expense_account_id uuid references public.accounts(id),
  receipt_path text,
  requested_by uuid references public.profiles(id),
  approved_by uuid references public.profiles(id),
  status text not null default 'draft'
);

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  financial_year text not null,
  branch_id uuid references public.branches(id),
  department_id uuid,
  project_id uuid,
  fund_id uuid references public.funds(id),
  owner_user_id uuid references public.profiles(id),
  status text not null default 'draft',
  version integer not null default 1,
  approval_id uuid,
  notes text,
  created_at timestamptz not null default now()
);

create table public.budget_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  budget_id uuid not null references public.budgets(id) on delete cascade,
  version integer not null,
  scenario_name text,
  status text not null default 'draft',
  created_by uuid references public.profiles(id)
);

create table public.budget_lines (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  budget_id uuid not null references public.budgets(id) on delete cascade,
  account_id uuid references public.accounts(id),
  category text not null,
  period_key text not null,
  amount numeric(14,2) not null default 0,
  committed_amount numeric(14,2) not null default 0,
  actual_amount numeric(14,2) not null default 0,
  branch_id uuid references public.branches(id),
  department_id uuid,
  project_id uuid,
  fund_id uuid references public.funds(id),
  justification text,
  assumptions text,
  owner_user_id uuid references public.profiles(id),
  notes text
);

create table public.budget_controls (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  budget_id uuid references public.budgets(id) on delete cascade,
  warning_percent numeric(5,2) not null default 80,
  block_above_budget boolean not null default false,
  allow_override boolean not null default true,
  require_supplementary_approval boolean not null default false,
  emergency_override_allowed boolean not null default true
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  supplier_name text not null,
  supplier_type text not null,
  registration_number text,
  tax_number_placeholder text,
  contact_email text,
  contact_phone text,
  address text,
  categories_supplied text[] not null default '{}',
  branch_scope uuid references public.branches(id),
  approval_status text not null default 'draft',
  risk_status text not null default 'low',
  active boolean not null default true,
  related_person_conflict_declaration text,
  review_date date,
  created_at timestamptz not null default now()
);

create table public.supplier_documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  document_type text not null,
  document_path text not null,
  verified_by uuid references public.profiles(id),
  verified_at timestamptz
);

create table public.supplier_bank_accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  bank_name text,
  account_name text,
  account_number text,
  payment_reference text,
  verification_status text not null default 'unverified',
  approved_by uuid references public.profiles(id),
  active boolean not null default true
);

create table public.purchase_requisitions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  requester_user_id uuid references public.profiles(id),
  branch_id uuid references public.branches(id),
  department_id uuid,
  item_or_service text not null,
  quantity numeric(14,2) not null default 1,
  specification text,
  estimated_cost numeric(14,2) not null default 0,
  budget_line_id uuid references public.budget_lines(id),
  fund_id uuid references public.funds(id),
  required_date date,
  urgency text not null default 'normal',
  preferred_supplier_id uuid references public.suppliers(id),
  justification text,
  status text not null default 'draft'
);

create table public.quotation_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  purchase_requisition_id uuid not null references public.purchase_requisitions(id),
  due_date date,
  status text not null default 'open'
);

create table public.supplier_quotations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  quotation_request_id uuid references public.quotation_requests(id),
  supplier_id uuid references public.suppliers(id),
  price numeric(14,2) not null default 0,
  delivery_days integer,
  compliance_score numeric(5,2),
  document_path text,
  status text not null default 'submitted'
);

create table public.quotation_evaluations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  quotation_request_id uuid references public.quotation_requests(id),
  criteria text[] not null default '{}',
  evaluation_panel_user_ids uuid[] not null default '{}',
  recommendation_supplier_id uuid references public.suppliers(id),
  conflict_declarations text,
  status text not null default 'draft',
  approved_by uuid references public.profiles(id)
);

create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  po_number text not null,
  supplier_id uuid references public.suppliers(id),
  purchase_requisition_id uuid references public.purchase_requisitions(id),
  total numeric(14,2) not null default 0,
  delivery_location text,
  delivery_date date,
  payment_terms text,
  fund_id uuid references public.funds(id),
  project_id uuid,
  approval_id uuid,
  status text not null default 'draft',
  unique (tenant_id, po_number)
);

create table public.purchase_order_lines (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  description text not null,
  quantity numeric(14,2) not null default 1,
  unit_price numeric(14,2) not null default 0,
  tax_placeholder numeric(14,2) not null default 0,
  line_total numeric(14,2) generated always as ((quantity * unit_price) + tax_placeholder) stored
);

create table public.goods_receipts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  purchase_order_id uuid references public.purchase_orders(id),
  supplier_id uuid references public.suppliers(id),
  received_by uuid references public.profiles(id),
  received_date date not null,
  item_description text,
  quantity_ordered numeric(14,2) not null default 0,
  quantity_received numeric(14,2) not null default 0,
  condition text,
  rejected_quantity numeric(14,2) not null default 0,
  delivery_note text,
  store_location text,
  discrepancy text,
  service_completion boolean not null default false,
  accepted boolean not null default false
);

create table public.service_receipts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  purchase_order_id uuid references public.purchase_orders(id),
  confirmed_by uuid references public.profiles(id),
  service_completion_date date,
  acceptance_notes text,
  status text not null default 'draft'
);

create table public.supplier_invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id),
  invoice_number text not null,
  invoice_date date not null,
  purchase_order_id uuid references public.purchase_orders(id),
  goods_receipt_id uuid references public.goods_receipts(id),
  amount numeric(14,2) not null default 0,
  tax_placeholder numeric(14,2) not null default 0,
  due_date date,
  branch_id uuid references public.branches(id),
  project_id uuid,
  fund_id uuid references public.funds(id),
  expense_account_id uuid references public.accounts(id),
  approval_status text not null default 'draft',
  payment_status text not null default 'unpaid',
  journal_status text not null default 'not_posted',
  unique (tenant_id, supplier_id, invoice_number)
);

create table public.accounts_payable (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  supplier_invoice_id uuid not null references public.supplier_invoices(id),
  supplier_id uuid not null references public.suppliers(id),
  amount_due numeric(14,2) not null default 0,
  amount_paid numeric(14,2) not null default 0,
  due_date date,
  status text not null default 'open'
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_name text not null,
  customer_type text not null,
  contact_email text,
  active boolean not null default true
);

create table public.sales_invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid references public.customers(id),
  source text not null,
  invoice_number text not null,
  invoice_date date not null,
  due_date date,
  amount numeric(14,2) not null default 0,
  paid_amount numeric(14,2) not null default 0,
  status text not null default 'draft',
  unique (tenant_id, invoice_number)
);

create table public.sales_invoice_lines (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  sales_invoice_id uuid not null references public.sales_invoices(id) on delete cascade,
  description text not null,
  quantity numeric(14,2) not null default 1,
  unit_price numeric(14,2) not null default 0
);

create table public.accounts_receivable (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  sales_invoice_id uuid references public.sales_invoices(id),
  customer_id uuid references public.customers(id),
  amount_due numeric(14,2) not null default 0,
  amount_received numeric(14,2) not null default 0,
  status text not null default 'open'
);

create table public.credit_notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  sales_invoice_id uuid references public.sales_invoices(id),
  amount numeric(14,2) not null default 0,
  reason text not null,
  approved_by uuid references public.profiles(id)
);

create table public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  requester_user_id uuid references public.profiles(id),
  branch_id uuid references public.branches(id),
  department_id uuid,
  project_id uuid,
  fund_id uuid references public.funds(id),
  budget_line_id uuid references public.budget_lines(id),
  supplier_id uuid references public.suppliers(id),
  payee_name text not null,
  purpose text not null,
  amount numeric(14,2) not null default 0,
  currency text not null default 'KES',
  due_date date,
  payment_method text,
  procurement_reference_id uuid,
  welfare_reference_id uuid,
  status text not null default 'draft',
  approval_workflow_id uuid,
  attachments text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.payment_vouchers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  voucher_number text not null,
  payment_request_id uuid references public.payment_requests(id),
  payee_name text not null,
  amount numeric(14,2) not null default 0,
  deductions numeric(14,2) not null default 0,
  net_amount numeric(14,2) not null default 0,
  payment_account_id uuid references public.financial_accounts(id),
  payment_method text,
  transaction_reference text,
  voucher_date date,
  prepared_by uuid references public.profiles(id),
  checked_by uuid references public.profiles(id),
  approved_by uuid references public.profiles(id),
  paid_by uuid references public.profiles(id),
  journal_id uuid references public.journals(id),
  status text not null default 'draft',
  unique (tenant_id, voucher_number)
);

create table public.payment_executions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  payment_voucher_id uuid references public.payment_vouchers(id),
  executed_by uuid references public.profiles(id),
  transaction_reference text not null,
  executed_at timestamptz not null default now(),
  status text not null default 'executed'
);

create table public.inventory_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  active boolean not null default true
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  store_name text not null,
  store_type text not null,
  custodian_user_id uuid references public.profiles(id),
  branch_id uuid references public.branches(id),
  location text,
  active boolean not null default true,
  count_schedule text
);

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  sku text not null,
  item_name text not null,
  category_id uuid references public.inventory_categories(id),
  description text,
  unit text not null,
  branch_id uuid references public.branches(id),
  store_id uuid references public.stores(id),
  reorder_level numeric(14,2) not null default 0,
  cost numeric(14,2) not null default 0,
  quantity_on_hand numeric(14,2) not null default 0,
  reserved_quantity numeric(14,2) not null default 0,
  expiry_tracking boolean not null default false,
  batch_tracking boolean not null default false,
  serial_tracking boolean not null default false,
  active boolean not null default true,
  unique (tenant_id, sku)
);

create table public.inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  item_id uuid references public.inventory_items(id),
  transaction_type text not null,
  quantity numeric(14,2) not null check (quantity >= 0),
  source_store_id uuid references public.stores(id),
  destination_store_id uuid references public.stores(id),
  reason text,
  related_event_id uuid,
  related_service_id uuid,
  related_project_id uuid,
  related_department_id uuid,
  authorized_by uuid references public.profiles(id),
  transaction_date date not null,
  cost numeric(14,2) not null default 0,
  evidence_path text
);

create table public.stock_counts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  store_id uuid references public.stores(id),
  count_type text not null,
  status text not null default 'draft',
  counted_by_user_ids uuid[] not null default '{}',
  approved_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.stock_count_lines (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  stock_count_id uuid references public.stock_counts(id) on delete cascade,
  item_id uuid references public.inventory_items(id),
  system_quantity numeric(14,2) not null default 0,
  counted_quantity numeric(14,2) not null default 0,
  discrepancy_reason text
);

create table public.asset_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  useful_life_months integer,
  active boolean not null default true
);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  asset_number text not null,
  asset_name text not null,
  category_id uuid references public.asset_categories(id),
  description text,
  serial_number text,
  branch_id uuid references public.branches(id),
  location text,
  custodian_user_id uuid references public.profiles(id),
  department_id uuid,
  acquisition_date date,
  acquisition_cost numeric(14,2) not null default 0,
  supplier_id uuid references public.suppliers(id),
  funding_source text,
  fund_id uuid references public.funds(id),
  project_id uuid,
  condition text,
  status text not null default 'available',
  warranty_expiry date,
  insurance_reference text,
  useful_life_months integer,
  depreciation_method text,
  residual_value numeric(14,2) not null default 0,
  documents text[] not null default '{}',
  photo_path text,
  disposal_status text,
  unique (tenant_id, asset_number)
);

create table public.asset_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  asset_id uuid references public.assets(id),
  assigned_user_id uuid references public.profiles(id),
  assigned_department_id uuid,
  assigned_at timestamptz not null default now(),
  returned_at timestamptz
);

create table public.asset_transfers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  asset_id uuid references public.assets(id),
  from_location text,
  to_location text,
  from_custodian_user_id uuid references public.profiles(id),
  to_custodian_user_id uuid references public.profiles(id),
  approved_by uuid references public.profiles(id),
  status text not null default 'pending'
);

create table public.asset_maintenance (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  asset_id uuid references public.assets(id),
  maintenance_type text not null,
  due_date date,
  completed_date date,
  cost numeric(14,2) not null default 0,
  status text not null default 'open'
);

create table public.asset_depreciation_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  period_id uuid references public.accounting_periods(id),
  status text not null default 'draft',
  proposed_total numeric(14,2) not null default 0,
  journal_id uuid references public.journals(id)
);

create table public.asset_disposals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  asset_id uuid references public.assets(id),
  disposal_method text,
  proceeds numeric(14,2) not null default 0,
  reason text,
  approved_by uuid references public.profiles(id),
  status text not null default 'pending'
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  project_name text not null,
  branch_id uuid references public.branches(id),
  fund_id uuid references public.funds(id),
  budget_id uuid references public.budgets(id),
  manager_user_id uuid references public.profiles(id),
  status text not null default 'draft',
  public_updates boolean not null default false
);

create table public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  due_date date,
  status text not null default 'open'
);

create table public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  assigned_user_id uuid references public.profiles(id),
  status text not null default 'open'
);

create table public.project_risks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  risk_summary text not null,
  severity text,
  mitigation text,
  status text not null default 'open'
);

create table public.project_change_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  change_summary text not null,
  budget_impact numeric(14,2) not null default 0,
  approved_by uuid references public.profiles(id),
  status text not null default 'pending'
);

create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  facility_name text not null,
  branch_id uuid references public.branches(id),
  capacity integer,
  location text,
  active boolean not null default true
);

create table public.facility_bookings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  facility_id uuid references public.facilities(id),
  requester_user_id uuid references public.profiles(id),
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  setup_requirements text[] not null default '{}',
  approval_id uuid,
  status text not null default 'requested'
);

create table public.maintenance_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  facility_id uuid references public.facilities(id),
  asset_id uuid references public.assets(id),
  requested_by uuid references public.profiles(id),
  issue_summary text not null,
  priority text not null default 'normal',
  status text not null default 'open'
);

create table public.utility_accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  facility_id uuid references public.facilities(id),
  utility_type text not null,
  account_reference text,
  supplier_id uuid references public.suppliers(id),
  active boolean not null default true
);

create table public.utility_bills (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  utility_account_id uuid references public.utility_accounts(id),
  bill_date date,
  due_date date,
  amount numeric(14,2) not null default 0,
  payment_request_id uuid references public.payment_requests(id),
  status text not null default 'unpaid'
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  registration_number text not null,
  branch_id uuid references public.branches(id),
  custodian_user_id uuid references public.profiles(id),
  status text not null default 'available',
  unique (tenant_id, registration_number)
);

create table public.driver_profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid references public.profiles(id),
  license_number_placeholder text,
  authorized_vehicle_classes text[] not null default '{}',
  status text not null default 'active'
);

create table public.transport_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  requester_user_id uuid references public.profiles(id),
  vehicle_id uuid references public.vehicles(id),
  purpose text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'requested'
);

create table public.trip_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id),
  driver_user_id uuid references public.profiles(id),
  trip_date date,
  origin text,
  destination text,
  odometer_start numeric(14,2),
  odometer_end numeric(14,2),
  incident_notes text
);

create table public.fuel_transactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id),
  transaction_date date,
  litres numeric(14,2),
  amount numeric(14,2),
  receipt_path text
);

create table public.positions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  branch_id uuid references public.branches(id),
  department_id uuid,
  supervisor_position_id uuid references public.positions(id),
  active boolean not null default true
);

create table public.position_establishments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  position_id uuid references public.positions(id),
  approved_headcount numeric(14,2) not null default 1,
  budget_id uuid references public.budgets(id)
);

create table public.vacancies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  position_id uuid references public.positions(id),
  status text not null default 'open',
  opened_at timestamptz not null default now()
);

create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  vacancy_id uuid references public.vacancies(id),
  applicant_person_id uuid references public.people(id),
  status text not null default 'received'
);

create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  job_application_id uuid references public.job_applications(id),
  scheduled_at timestamptz,
  panel_user_ids uuid[] not null default '{}',
  outcome text
);

create table public.employment_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid references public.people(id),
  user_id uuid references public.profiles(id),
  employee_number text not null,
  position_id uuid references public.positions(id),
  branch_id uuid references public.branches(id),
  department_id uuid,
  employment_type text not null,
  status text not null default 'active',
  salary_restricted boolean not null default true,
  unique (tenant_id, employee_number)
);

create table public.employment_contracts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  employment_record_id uuid references public.employment_records(id),
  contract_type text not null,
  starts_at date,
  ends_at date,
  document_path text,
  status text not null default 'draft'
);

create table public.onboarding_checklists (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  employment_record_id uuid references public.employment_records(id),
  item text not null,
  completed_at timestamptz
);

create table public.leave_types (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  annual_entitlement numeric(14,2) not null default 0,
  active boolean not null default true
);

create table public.leave_balances (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  employment_record_id uuid references public.employment_records(id),
  leave_type_id uuid references public.leave_types(id),
  balance numeric(14,2) not null default 0
);

create table public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  employment_record_id uuid references public.employment_records(id),
  requester_user_id uuid references public.profiles(id),
  leave_type_id uuid references public.leave_types(id),
  starts_at date,
  ends_at date,
  acting_user_id uuid references public.profiles(id),
  approval_id uuid,
  status text not null default 'draft'
);

create table public.staff_attendance (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  employment_record_id uuid references public.employment_records(id),
  attendance_date date,
  status text not null,
  captured_by uuid references public.profiles(id)
);

create table public.timesheets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  employment_record_id uuid references public.employment_records(id),
  period_start date,
  period_end date,
  hours numeric(14,2) not null default 0,
  status text not null default 'draft'
);

create table public.payroll_periods (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  starts_at date,
  ends_at date,
  status text not null default 'open'
);

create table public.payroll_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  payroll_period_id uuid references public.payroll_periods(id),
  status text not null default 'open',
  prepared_by uuid references public.profiles(id),
  reviewed_by uuid references public.profiles(id),
  approved_by uuid references public.profiles(id),
  gross_pay numeric(14,2) not null default 0,
  deductions numeric(14,2) not null default 0,
  net_pay numeric(14,2) not null default 0,
  journal_id uuid references public.journals(id)
);

create table public.payroll_employees (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  payroll_run_id uuid references public.payroll_runs(id),
  employment_record_id uuid references public.employment_records(id),
  status text not null default 'loaded'
);

create table public.payroll_earning_types (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  taxable_placeholder boolean not null default true,
  pensionable boolean not null default false,
  recurring boolean not null default true,
  formula text,
  effective_from date,
  effective_to date,
  approval_id uuid
);

create table public.payroll_deduction_types (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  rule text,
  effective_from date,
  effective_to date,
  approval_id uuid
);

create table public.payroll_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  payroll_run_id uuid references public.payroll_runs(id),
  employment_record_id uuid references public.employment_records(id),
  item_type text not null,
  earning_type_id uuid references public.payroll_earning_types(id),
  deduction_type_id uuid references public.payroll_deduction_types(id),
  amount numeric(14,2) not null default 0,
  approved_by uuid references public.profiles(id)
);

create table public.payroll_results (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  payroll_run_id uuid references public.payroll_runs(id),
  employment_record_id uuid references public.employment_records(id),
  gross_pay numeric(14,2) not null default 0,
  deductions numeric(14,2) not null default 0,
  net_pay numeric(14,2) not null default 0,
  journal_id uuid references public.journals(id)
);

create table public.payslips (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  payroll_run_id uuid references public.payroll_runs(id),
  employment_record_id uuid references public.employment_records(id),
  issue_date date,
  gross_pay numeric(14,2) not null default 0,
  deductions numeric(14,2) not null default 0,
  net_pay numeric(14,2) not null default 0,
  secure_file_path text,
  status text not null default 'draft'
);

create table public.salary_advances (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  employment_record_id uuid references public.employment_records(id),
  amount numeric(14,2) not null default 0,
  reason text,
  repayment_schedule text,
  balance numeric(14,2) not null default 0,
  approval_id uuid,
  status text not null default 'requested'
);

create table public.performance_cycles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  starts_at date,
  ends_at date,
  status text not null default 'draft'
);

create table public.performance_goals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  employment_record_id uuid references public.employment_records(id),
  cycle_id uuid references public.performance_cycles(id),
  goal text not null,
  status text not null default 'open'
);

create table public.performance_reviews (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  employment_record_id uuid references public.employment_records(id),
  supervisor_user_id uuid references public.profiles(id),
  cycle_id uuid references public.performance_cycles(id),
  self_review text,
  manager_review text,
  development_plan text,
  status text not null default 'draft'
);

create table public.disciplinary_cases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  employment_record_id uuid references public.employment_records(id),
  case_type text not null,
  allegation text,
  status text not null default 'reported',
  safeguarding_case_id uuid,
  restricted boolean not null default true,
  created_by uuid references public.profiles(id)
);

create table public.disciplinary_actions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  disciplinary_case_id uuid references public.disciplinary_cases(id),
  action_type text not null,
  decision_summary text,
  issued_by uuid references public.profiles(id),
  issued_at timestamptz
);

create table public.staff_training_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  employment_record_id uuid references public.employment_records(id),
  programme_id uuid references public.programmes(id),
  completion_status text not null default 'required',
  expiry_date date
);

create table public.administration_exports (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  export_type text not null,
  reason text not null,
  requested_by uuid references public.profiles(id),
  approval_id uuid,
  expires_at timestamptz,
  audit_summary_redacted boolean not null default true
);

create table public.administration_audit_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  actor_user_id uuid references public.profiles(id),
  event_type text not null,
  entity_table text not null,
  entity_id uuid,
  redacted_summary text not null,
  created_at timestamptz not null default now()
);

create index journals_tenant_status_idx on public.journals(tenant_id, status);
create index journal_lines_account_idx on public.journal_lines(tenant_id, account_id);
create index payment_requests_status_idx on public.payment_requests(tenant_id, status);
create index supplier_invoices_due_idx on public.supplier_invoices(tenant_id, due_date, payment_status);
create index inventory_items_store_idx on public.inventory_items(tenant_id, store_id);
create index assets_status_idx on public.assets(tenant_id, status);
create index employment_records_user_idx on public.employment_records(tenant_id, user_id);
create index payslips_employee_idx on public.payslips(tenant_id, employment_record_id);

insert into public.permission_groups (key, label, sort_order) values
('administration_backbone', 'Finance, Operations, HR & Payroll', 100)
on conflict (key) do update set label = excluded.label, sort_order = excluded.sort_order;

insert into public.permissions (key, description, group_key, label, sensitive) values
('accounting.account.view','View chart of accounts.','administration_backbone','View accounts',false),
('accounting.account.manage','Manage chart of accounts.','administration_backbone','Manage accounts',true),
('accounting.journal.create','Create accounting journals.','administration_backbone','Create journals',true),
('accounting.journal.review','Review accounting journals.','administration_backbone','Review journals',true),
('accounting.journal.approve','Approve accounting journals.','administration_backbone','Approve journals',true),
('accounting.journal.post','Post accounting journals.','administration_backbone','Post journals',true),
('accounting.period.manage','Manage accounting periods.','administration_backbone','Manage periods',true),
('accounting.report.view','View accounting reports.','administration_backbone','View accounting reports',true),
('accounting.report.export','Export accounting reports.','administration_backbone','Export accounting reports',true),
('accounting.reconciliation.manage','Manage reconciliations.','administration_backbone','Manage reconciliations',true),
('budget.view','View budgets.','administration_backbone','View budgets',false),
('budget.create','Create budgets.','administration_backbone','Create budgets',true),
('budget.review','Review budgets.','administration_backbone','Review budgets',true),
('budget.approve','Approve budgets.','administration_backbone','Approve budgets',true),
('budget.revise','Revise budgets.','administration_backbone','Revise budgets',true),
('budget.override','Override budgets.','administration_backbone','Override budgets',true),
('payment_request.create','Create payment requests.','administration_backbone','Create payment requests',true),
('payment_request.review','Review payment requests.','administration_backbone','Review payment requests',true),
('payment_request.approve','Approve payment requests.','administration_backbone','Approve payment requests',true),
('payment_voucher.prepare','Prepare payment vouchers.','administration_backbone','Prepare vouchers',true),
('payment_voucher.approve','Approve payment vouchers.','administration_backbone','Approve vouchers',true),
('payment.execute','Execute payments.','administration_backbone','Execute payments',true),
('procurement.request.create','Create requisitions.','administration_backbone','Create requisitions',true),
('procurement.request.approve','Approve requisitions.','administration_backbone','Approve requisitions',true),
('procurement.quotation.manage','Manage quotations.','administration_backbone','Manage quotations',true),
('procurement.evaluate','Evaluate quotations.','administration_backbone','Evaluate quotations',true),
('procurement.po.manage','Manage purchase orders.','administration_backbone','Manage POs',true),
('procurement.receipt.manage','Manage goods receipts.','administration_backbone','Manage receipts',true),
('supplier.view','View suppliers.','administration_backbone','View suppliers',true),
('supplier.manage','Manage suppliers.','administration_backbone','Manage suppliers',true),
('supplier.approve','Approve suppliers.','administration_backbone','Approve suppliers',true),
('inventory.view','View inventory.','administration_backbone','View inventory',false),
('inventory.manage','Manage inventory.','administration_backbone','Manage inventory',true),
('inventory.adjust','Adjust inventory.','administration_backbone','Adjust inventory',true),
('asset.view','View assets.','administration_backbone','View assets',false),
('asset.manage','Manage assets.','administration_backbone','Manage assets',true),
('asset.transfer','Transfer assets.','administration_backbone','Transfer assets',true),
('asset.dispose','Dispose assets.','administration_backbone','Dispose assets',true),
('facility.view','View facilities.','administration_backbone','View facilities',false),
('facility.manage','Manage facilities.','administration_backbone','Manage facilities',true),
('facility.booking.manage','Manage bookings.','administration_backbone','Manage bookings',true),
('maintenance.manage','Manage maintenance.','administration_backbone','Manage maintenance',true),
('project.view','View projects.','administration_backbone','View projects',false),
('project.manage','Manage projects.','administration_backbone','Manage projects',true),
('project.approve','Approve projects.','administration_backbone','Approve projects',true),
('transport.view','View transport.','administration_backbone','View transport',false),
('transport.manage','Manage transport.','administration_backbone','Manage transport',true),
('fleet.manage','Manage fleet.','administration_backbone','Manage fleet',true),
('hr.employee.view','View employees.','administration_backbone','View employees',true),
('hr.employee.manage','Manage employees.','administration_backbone','Manage employees',true),
('hr.contract.manage','Manage contracts.','administration_backbone','Manage contracts',true),
('hr.recruitment.manage','Manage recruitment.','administration_backbone','Manage recruitment',true),
('hr.leave.view','View leave.','administration_backbone','View leave',true),
('hr.leave.manage','Manage leave.','administration_backbone','Manage leave',true),
('hr.leave.approve','Approve leave.','administration_backbone','Approve leave',true),
('hr.attendance.manage','Manage attendance.','administration_backbone','Manage attendance',true),
('payroll.view','View payroll.','administration_backbone','View payroll',true),
('payroll.manage','Manage payroll.','administration_backbone','Manage payroll',true),
('payroll.review','Review payroll.','administration_backbone','Review payroll',true),
('payroll.approve','Approve payroll.','administration_backbone','Approve payroll',true),
('payroll.post','Post payroll.','administration_backbone','Post payroll',true),
('payroll.payslip.view_all','View all payslips.','administration_backbone','View all payslips',true),
('hr.performance.manage','Manage performance.','administration_backbone','Manage performance',true),
('hr.discipline.manage','Manage discipline.','administration_backbone','Manage discipline',true),
('hr.report.export','Export HR reports.','administration_backbone','Export HR reports',true)
on conflict (key) do nothing;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'accounts','accounting_periods','journals','journal_lines','posting_rules','fund_balances','financial_accounts','bank_statements','bank_statement_rows','bank_reconciliations','reconciliation_items','petty_cash_accounts','petty_cash_transactions','budgets','budget_versions','budget_lines','budget_controls','suppliers','supplier_documents','purchase_requisitions','quotation_requests','supplier_quotations','quotation_evaluations','purchase_orders','purchase_order_lines','goods_receipts','service_receipts','supplier_invoices','accounts_payable','customers','sales_invoices','sales_invoice_lines','accounts_receivable','credit_notes','payment_requests','payment_vouchers','payment_executions','inventory_categories','stores','inventory_items','inventory_transactions','stock_counts','stock_count_lines','asset_categories','assets','asset_assignments','asset_transfers','asset_maintenance','asset_depreciation_runs','asset_disposals','projects','project_milestones','project_tasks','project_risks','project_change_requests','facilities','facility_bookings','maintenance_requests','utility_accounts','utility_bills','vehicles','driver_profiles','transport_requests','trip_logs','fuel_transactions','positions','position_establishments','vacancies','job_applications','interviews','employment_contracts','onboarding_checklists','leave_types','leave_balances','leave_requests','staff_attendance','timesheets','payroll_periods','payroll_runs','payroll_employees','payroll_earning_types','payroll_deduction_types','payroll_items','payroll_results','salary_advances','performance_cycles','performance_goals','performance_reviews','staff_training_records','administration_exports','administration_audit_events'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('create policy %I on public.%I for select to authenticated using (public.has_permission(tenant_id, ''accounting.report.view'') or public.has_permission(tenant_id, ''accounting.account.view'') or public.has_permission(tenant_id, ''budget.view'') or public.has_permission(tenant_id, ''supplier.view'') or public.has_permission(tenant_id, ''inventory.view'') or public.has_permission(tenant_id, ''asset.view'') or public.has_permission(tenant_id, ''facility.view'') or public.has_permission(tenant_id, ''project.view'') or public.has_permission(tenant_id, ''transport.view'') or public.has_permission(tenant_id, ''hr.employee.view''))', table_name || '_read', table_name);
    execute format('create policy %I on public.%I for all to authenticated using (public.has_permission(tenant_id, ''accounting.journal.create'') or public.has_permission(tenant_id, ''accounting.account.manage'') or public.has_permission(tenant_id, ''budget.create'') or public.has_permission(tenant_id, ''payment_request.create'') or public.has_permission(tenant_id, ''procurement.request.create'') or public.has_permission(tenant_id, ''inventory.manage'') or public.has_permission(tenant_id, ''asset.manage'') or public.has_permission(tenant_id, ''facility.manage'') or public.has_permission(tenant_id, ''project.manage'') or public.has_permission(tenant_id, ''transport.manage'') or public.has_permission(tenant_id, ''hr.employee.manage'') or public.has_permission(tenant_id, ''payroll.manage'')) with check (public.has_permission(tenant_id, ''accounting.journal.create'') or public.has_permission(tenant_id, ''accounting.account.manage'') or public.has_permission(tenant_id, ''budget.create'') or public.has_permission(tenant_id, ''payment_request.create'') or public.has_permission(tenant_id, ''procurement.request.create'') or public.has_permission(tenant_id, ''inventory.manage'') or public.has_permission(tenant_id, ''asset.manage'') or public.has_permission(tenant_id, ''facility.manage'') or public.has_permission(tenant_id, ''project.manage'') or public.has_permission(tenant_id, ''transport.manage'') or public.has_permission(tenant_id, ''hr.employee.manage'') or public.has_permission(tenant_id, ''payroll.manage''))', table_name || '_manage', table_name);
  end loop;
end $$;

alter table public.supplier_bank_accounts enable row level security;
create policy "supplier bank accounts restricted read" on public.supplier_bank_accounts for select to authenticated using (public.has_permission(tenant_id, 'supplier.approve') or public.has_permission(tenant_id, 'supplier.manage'));
create policy "supplier bank accounts restricted manage" on public.supplier_bank_accounts for all to authenticated using (public.has_permission(tenant_id, 'supplier.manage') or public.has_permission(tenant_id, 'supplier.approve')) with check (public.has_permission(tenant_id, 'supplier.manage') or public.has_permission(tenant_id, 'supplier.approve'));

alter table public.employment_records enable row level security;
create policy "employment own or hr read" on public.employment_records for select to authenticated using (user_id = auth.uid() or public.has_permission(tenant_id, 'hr.employee.view'));
create policy "employment hr manage" on public.employment_records for all to authenticated using (public.has_permission(tenant_id, 'hr.employee.manage')) with check (public.has_permission(tenant_id, 'hr.employee.manage'));

alter table public.payslips enable row level security;
create policy "payslips own or payroll read" on public.payslips for select to authenticated using (public.has_permission(tenant_id, 'payroll.payslip.view_all') or exists (select 1 from public.employment_records e where e.id = payslips.employment_record_id and e.user_id = auth.uid()));
create policy "payslips payroll manage" on public.payslips for all to authenticated using (public.has_permission(tenant_id, 'payroll.manage')) with check (public.has_permission(tenant_id, 'payroll.manage'));

alter table public.disciplinary_cases enable row level security;
create policy "discipline restricted read" on public.disciplinary_cases for select to authenticated using (public.has_permission(tenant_id, 'hr.discipline.manage'));
create policy "discipline restricted manage" on public.disciplinary_cases for all to authenticated using (public.has_permission(tenant_id, 'hr.discipline.manage')) with check (public.has_permission(tenant_id, 'hr.discipline.manage'));

alter table public.disciplinary_actions enable row level security;
create policy "discipline actions restricted read" on public.disciplinary_actions for select to authenticated using (public.has_permission(tenant_id, 'hr.discipline.manage'));
create policy "discipline actions restricted manage" on public.disciplinary_actions for all to authenticated using (public.has_permission(tenant_id, 'hr.discipline.manage')) with check (public.has_permission(tenant_id, 'hr.discipline.manage'));
