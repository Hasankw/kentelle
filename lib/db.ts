import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// ─── helpers ───────────────────────────────────────────────────────────────

function applyWhere(query: ReturnType<typeof supabase.from>, where: Record<string, unknown> = {}) {
  for (const [col, val] of Object.entries(where)) {
    if (val === undefined || val === null) continue;
    if (typeof val === "object" && !Array.isArray(val)) {
      const v = val as Record<string, unknown>;
      if ("gt"  in v) query = (query as any).gt(col, v.gt);
      if ("gte" in v) query = (query as any).gte(col, v.gte);
      if ("lt"  in v) query = (query as any).lt(col, v.lt);
      if ("lte" in v) query = (query as any).lte(col, v.lte);
      if ("not" in v) query = (query as any).neq(col, v.not);
      if ("in"  in v) query = (query as any).in(col, v.in as unknown[]);
      if ("contains" in v) query = (query as any).ilike(col, `%${v.contains}%`);
    } else if (Array.isArray(val)) {
      query = (query as any).in(col, val);
    } else {
      query = (query as any).eq(col, val);
    }
  }
  return query;
}

function applyOrder(
  query: ReturnType<typeof supabase.from>,
  orderBy: Record<string, "asc" | "desc"> | Record<string, "asc" | "desc">[] = {}
) {
  const entries = Array.isArray(orderBy)
    ? orderBy.flatMap((o) => Object.entries(o))
    : Object.entries(orderBy);
  for (const [col, dir] of entries) {
    query = (query as any).order(col, { ascending: dir === "asc" });
  }
  return query;
}

function throwIfError<T>(data: T | null, error: { message: string } | null, label: string): T {
  if (error) throw new Error(`[db:${label}] ${error.message}`);
  return data as T;
}

function flattenCategories(raw: { category: Record<string, unknown> }[] = []) {
  return raw.map((r) => r.category);
}

function parseProduct(p: Record<string, unknown>) {
  if (!p) return p;
  const cats = Array.isArray(p.categories)
    ? flattenCategories(p.categories as { category: Record<string, unknown> }[])
    : [];
  return { ...p, categories: cats };
}

// ─── product ───────────────────────────────────────────────────────────────

const PRODUCT_SELECT =
  "*, categories:_ProductCategories(category:Category(*))";

async function productFindMany(args: {
  where?: Record<string, unknown>;
  orderBy?: Record<string, "asc" | "desc"> | Record<string, "asc" | "desc">[];
  take?: number;
  skip?: number;
  include?: Record<string, unknown>;
} = {}) {
  let q = supabase.from("Product").select(PRODUCT_SELECT);
  q = applyWhere(q, args.where) as any;
  q = applyOrder(q, args.orderBy) as any;
  if (args.take) (q as any).limit(args.take);
  if (args.skip) (q as any).range(args.skip, args.skip + (args.take ?? 1000) - 1);
  const { data, error } = await (q as any);
  throwIfError(data, error, "product.findMany");
  return ((data as Record<string, unknown>[]) ?? []).map(parseProduct);
}

async function productFindUnique(args: { where: Record<string, unknown>; include?: Record<string, unknown> }) {
  let q = supabase.from("Product").select(PRODUCT_SELECT);
  q = applyWhere(q, args.where) as any;
  const { data, error } = await (q as any).maybeSingle();
  throwIfError(data, error, "product.findUnique");
  return data ? parseProduct(data as Record<string, unknown>) : null;
}

async function productCount(args: { where?: Record<string, unknown> } = {}) {
  let q = supabase.from("Product").select("id", { count: "exact", head: true });
  q = applyWhere(q, args.where) as any;
  const { count, error } = await (q as any);
  throwIfError(count, error, "product.count");
  return count ?? 0;
}

async function productCreate(args: { data: Record<string, unknown> }) {
  const { categories, ...data } = args.data as any;
  const { data: row, error } = await supabase.from("Product").insert(data).select().single();
  throwIfError(row, error, "product.create");
  if (categories?.connect?.length) {
    await supabase.from("_ProductCategories").insert(
      categories.connect.map((c: { id: string }) => ({ A: c.id, B: (row as any).id }))
    );
  }
  return row;
}

async function productUpdate(args: { where: Record<string, unknown>; data: Record<string, unknown> }) {
  const { categories, ...data } = args.data as any;
  let q = supabase.from("Product").update(data).select().single();
  (q as any).eq = undefined; // workaround — rebuild properly
  // Re-apply where manually
  const whereEntries = Object.entries(args.where);
  let uq: any = supabase.from("Product").update(data);
  for (const [k, v] of whereEntries) uq = uq.eq(k, v);
  const { data: row, error } = await uq.select().single();
  throwIfError(row, error, "product.update");
  if (categories) {
    const id = (row as any).id;
    await supabase.from("_ProductCategories").delete().eq("B", id);
    if (categories.set?.length) {
      await supabase.from("_ProductCategories").insert(
        categories.set.map((c: { id: string }) => ({ A: c.id, B: id }))
      );
    }
  }
  return row;
}

async function productDelete(args: { where: Record<string, unknown> }) {
  let q: any = supabase.from("Product").delete();
  for (const [k, v] of Object.entries(args.where)) q = q.eq(k, v);
  const { error } = await q;
  throwIfError(true, error, "product.delete");
  return { id: args.where.id };
}

// ─── category ──────────────────────────────────────────────────────────────

async function categoryFindMany(args: {
  where?: Record<string, unknown>;
  orderBy?: Record<string, "asc" | "desc">;
  include?: Record<string, unknown>;
} = {}) {
  let q: any = supabase.from("Category").select("*");
  q = applyWhere(q, args.where);
  q = applyOrder(q, args.orderBy);
  const { data, error } = await q;
  throwIfError(data, error, "category.findMany");
  return data ?? [];
}

async function categoryFindUnique(args: { where: Record<string, unknown> }) {
  let q: any = supabase.from("Category").select("*");
  q = applyWhere(q, args.where);
  const { data, error } = await q.maybeSingle();
  throwIfError(data, error, "category.findUnique");
  return data ?? null;
}

async function categoryCount(args: { where?: Record<string, unknown> } = {}) {
  let q: any = supabase.from("Category").select("id", { count: "exact", head: true });
  q = applyWhere(q, args.where);
  const { count, error } = await q;
  throwIfError(count, error, "category.count");
  return count ?? 0;
}

// ─── review ────────────────────────────────────────────────────────────────

async function reviewFindMany(args: {
  where?: Record<string, unknown>;
  orderBy?: Record<string, "asc" | "desc"> | Record<string, "asc" | "desc">[];
  take?: number;
  skip?: number;
  include?: { product?: boolean };
} = {}) {
  const select = args.include?.product ? "*, product:Product(id,name,slug,images)" : "*";
  let q: any = supabase.from("Review").select(select);
  q = applyWhere(q, args.where);
  q = applyOrder(q, args.orderBy);
  if (args.take) q = q.limit(args.take);
  const { data, error } = await q;
  throwIfError(data, error, "review.findMany");
  return data ?? [];
}

async function reviewCreate(args: { data: Record<string, unknown> }) {
  const { data, error } = await supabase.from("Review").insert(args.data).select().single();
  throwIfError(data, error, "review.create");
  return data;
}

async function reviewCount(args: { where?: Record<string, unknown> } = {}) {
  let q: any = supabase.from("Review").select("id", { count: "exact", head: true });
  q = applyWhere(q, args.where);
  const { count, error } = await q;
  throwIfError(count, error, "review.count");
  return count ?? 0;
}

// ─── blog ──────────────────────────────────────────────────────────────────

async function blogFindMany(args: {
  where?: Record<string, unknown>;
  orderBy?: Record<string, "asc" | "desc"> | Record<string, "asc" | "desc">[];
  take?: number;
  skip?: number;
} = {}) {
  let q: any = supabase.from("Blog").select("*");
  q = applyWhere(q, args.where);
  q = applyOrder(q, args.orderBy);
  if (args.take) q = q.limit(args.take);
  const { data, error } = await q;
  throwIfError(data, error, "blog.findMany");
  return data ?? [];
}

async function blogFindUnique(args: { where: Record<string, unknown> }) {
  let q: any = supabase.from("Blog").select("*");
  q = applyWhere(q, args.where);
  const { data, error } = await q.maybeSingle();
  throwIfError(data, error, "blog.findUnique");
  return data ?? null;
}

async function blogCreate(args: { data: Record<string, unknown> }) {
  const { data, error } = await supabase.from("Blog").insert(args.data).select().single();
  throwIfError(data, error, "blog.create");
  return data;
}

async function blogUpdate(args: { where: Record<string, unknown>; data: Record<string, unknown> }) {
  let q: any = supabase.from("Blog").update(args.data);
  for (const [k, v] of Object.entries(args.where)) q = q.eq(k, v);
  const { data, error } = await q.select().single();
  throwIfError(data, error, "blog.update");
  return data;
}

async function blogDelete(args: { where: Record<string, unknown> }) {
  let q: any = supabase.from("Blog").delete();
  for (const [k, v] of Object.entries(args.where)) q = q.eq(k, v);
  const { error } = await q;
  throwIfError(true, error, "blog.delete");
  return { id: args.where.id };
}

async function blogCount(args: { where?: Record<string, unknown> } = {}) {
  let q: any = supabase.from("Blog").select("id", { count: "exact", head: true });
  q = applyWhere(q, args.where);
  const { count, error } = await q;
  throwIfError(count, error, "blog.count");
  return count ?? 0;
}

// ─── order ─────────────────────────────────────────────────────────────────

async function orderFindMany(args: {
  where?: Record<string, unknown>;
  orderBy?: Record<string, "asc" | "desc"> | Record<string, "asc" | "desc">[];
  take?: number;
  skip?: number;
  include?: { items?: boolean | { include?: { product?: boolean } }; customer?: boolean };
} = {}) {
  const incItems = args.include?.items;
  const incCustomer = args.include?.customer;
  const incProduct = typeof incItems === "object" && incItems?.include?.product;

  let select = "*";
  if (incCustomer) select += ", customer:Customer(id,firstName,lastName,email)";
  if (incItems) {
    select += incProduct
      ? ", items:OrderItem(*, product:Product(id,name,slug,images))"
      : ", items:OrderItem(*)";
  }

  let q: any = supabase.from("Order").select(select);
  q = applyWhere(q, args.where);
  q = applyOrder(q, args.orderBy);
  if (args.take) q = q.limit(args.take);
  if (args.skip && args.take) q = q.range(args.skip, args.skip + args.take - 1);
  const { data, error } = await q;
  throwIfError(data, error, "order.findMany");
  return data ?? [];
}

async function orderFindUnique(args: {
  where: Record<string, unknown>;
  include?: { items?: boolean | { include?: { product?: boolean } }; customer?: boolean };
}) {
  const incItems = args.include?.items;
  const incCustomer = args.include?.customer;
  const incProduct = typeof incItems === "object" && incItems?.include?.product;

  let select = "*";
  if (incCustomer) select += ", customer:Customer(id,firstName,lastName,email)";
  if (incItems) {
    select += incProduct
      ? ", items:OrderItem(*, product:Product(id,name,slug,images))"
      : ", items:OrderItem(*)";
  }

  let q: any = supabase.from("Order").select(select);
  q = applyWhere(q, args.where);
  const { data, error } = await q.maybeSingle();
  throwIfError(data, error, "order.findUnique");
  return data ?? null;
}

async function orderCreate(args: { data: Record<string, unknown>; include?: Record<string, unknown> }) {
  const { items, ...orderData } = args.data as any;
  const { data: order, error } = await supabase.from("Order").insert(orderData).select().single();
  throwIfError(order, error, "order.create");
  if (items?.create?.length) {
    await supabase.from("OrderItem").insert(
      items.create.map((item: Record<string, unknown>) => ({ ...item, orderId: (order as any).id }))
    );
  }
  return order;
}

async function orderUpdate(args: { where: Record<string, unknown>; data: Record<string, unknown> }) {
  let q: any = supabase.from("Order").update(args.data);
  for (const [k, v] of Object.entries(args.where)) q = q.eq(k, v);
  const { data, error } = await q.select().single();
  throwIfError(data, error, "order.update");
  return data;
}

async function orderCount(args: { where?: Record<string, unknown> } = {}) {
  let q: any = supabase.from("Order").select("id", { count: "exact", head: true });
  q = applyWhere(q, args.where);
  const { count, error } = await q;
  throwIfError(count, error, "order.count");
  return count ?? 0;
}

// ─── customer ──────────────────────────────────────────────────────────────

async function customerFindMany(args: {
  where?: Record<string, unknown>;
  orderBy?: Record<string, "asc" | "desc"> | Record<string, "asc" | "desc">[];
  take?: number;
  include?: { _count?: { select?: Record<string, boolean> } };
} = {}) {
  let q: any = supabase.from("Customer").select("*");
  q = applyWhere(q, args.where);
  q = applyOrder(q, args.orderBy);
  if (args.take) q = q.limit(args.take);
  const { data, error } = await q;
  throwIfError(data, error, "customer.findMany");
  const rows = (data ?? []) as Record<string, unknown>[];

  if (args.include?._count) {
    return await Promise.all(
      rows.map(async (c) => {
        const { count } = await supabase
          .from("Order")
          .select("id", { count: "exact", head: true })
          .eq("customerId", c.id);
        return { ...c, _count: { orders: count ?? 0 } };
      })
    );
  }
  return rows;
}

async function customerFindUnique(args: {
  where: Record<string, unknown>;
  include?: { orders?: boolean | { include?: { items?: boolean } } };
}) {
  let q: any = supabase.from("Customer").select("*");
  q = applyWhere(q, args.where);
  const { data, error } = await q.maybeSingle();
  throwIfError(data, error, "customer.findUnique");
  if (!data) return null;

  const incOrders = args.include?.orders;
  if (incOrders) {
    const incItems = typeof incOrders === "object" && incOrders?.include?.items;
    const select = incItems ? "*, items:OrderItem(*)" : "*";
    const { data: orders } = await supabase
      .from("Order")
      .select(select)
      .eq("customerId", (data as any).id)
      .order("createdAt", { ascending: false });
    return { ...data, orders: orders ?? [] };
  }
  return data;
}

async function customerUpsert(args: {
  where: Record<string, unknown>;
  create: Record<string, unknown>;
  update: Record<string, unknown>;
}) {
  const { data: existing } = await supabase
    .from("Customer")
    .select("id")
    .eq("email", args.where.email as string)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("Customer")
      .update(args.update)
      .eq("id", (existing as any).id)
      .select()
      .single();
    throwIfError(data, error, "customer.upsert(update)");
    return data;
  } else {
    const { data, error } = await supabase
      .from("Customer")
      .insert(args.create)
      .select()
      .single();
    throwIfError(data, error, "customer.upsert(create)");
    return data;
  }
}

async function customerCount(args: { where?: Record<string, unknown> } = {}) {
  let q: any = supabase.from("Customer").select("id", { count: "exact", head: true });
  q = applyWhere(q, args.where);
  const { count, error } = await q;
  throwIfError(count, error, "customer.count");
  return count ?? 0;
}

// ─── lead ──────────────────────────────────────────────────────────────────

async function leadFindMany(args: {
  where?: Record<string, unknown>;
  orderBy?: Record<string, "asc" | "desc"> | Record<string, "asc" | "desc">[];
  take?: number;
} = {}) {
  let q: any = supabase.from("Lead").select("*");
  q = applyWhere(q, args.where);
  q = applyOrder(q, args.orderBy);
  if (args.take) q = q.limit(args.take);
  const { data, error } = await q;
  throwIfError(data, error, "lead.findMany");
  return data ?? [];
}

async function leadCreate(args: { data: Record<string, unknown> }) {
  const { data, error } = await supabase.from("Lead").insert(args.data).select().single();
  throwIfError(data, error, "lead.create");
  return data;
}

async function leadCount(args: { where?: Record<string, unknown> } = {}) {
  let q: any = supabase.from("Lead").select("id", { count: "exact", head: true });
  q = applyWhere(q, args.where);
  const { count, error } = await q;
  throwIfError(count, error, "lead.count");
  return count ?? 0;
}

// ─── admin ─────────────────────────────────────────────────────────────────

async function adminFindUnique(args: { where: Record<string, unknown> }) {
  let q: any = supabase.from("Admin").select("*");
  q = applyWhere(q, args.where);
  const { data, error } = await q.maybeSingle();
  throwIfError(data, error, "admin.findUnique");
  return data ?? null;
}

async function adminCreate(args: { data: Record<string, unknown> }) {
  const { data, error } = await supabase.from("Admin").insert(args.data).select().single();
  throwIfError(data, error, "admin.create");
  return data;
}

// ─── content ───────────────────────────────────────────────────────────────

async function contentFindMany(args: { where?: Record<string, unknown> } = {}) {
  let q: any = supabase.from("Content").select("*");
  q = applyWhere(q, args.where);
  const { data, error } = await q;
  throwIfError(data, error, "content.findMany");
  return data ?? [];
}

async function contentUpsert(args: {
  where: Record<string, unknown>;
  create: Record<string, unknown>;
  update: Record<string, unknown>;
}) {
  const { data: existing } = await (supabase.from("Content").select("id") as any)
    .eq("key", args.where.key)
    .maybeSingle();

  if (existing) {
    const { data, error } = await (supabase.from("Content").update(args.update) as any)
      .eq("id", (existing as any).id)
      .select()
      .single();
    throwIfError(data, error, "content.upsert(update)");
    return data;
  } else {
    const { data, error } = await supabase.from("Content").insert(args.create).select().single();
    throwIfError(data, error, "content.upsert(create)");
    return data;
  }
}

// ─── subscriber ────────────────────────────────────────────────────────────

async function subscriberUpsert(args: {
  where: Record<string, unknown>;
  create: Record<string, unknown>;
  update: Record<string, unknown>;
}) {
  const { data: existing } = await (supabase.from("Subscriber").select("id") as any)
    .eq("email", args.where.email)
    .maybeSingle();

  if (existing) {
    const { data, error } = await (supabase.from("Subscriber").update(args.update) as any)
      .eq("id", (existing as any).id)
      .select()
      .single();
    throwIfError(data, error, "subscriber.upsert(update)");
    return data;
  } else {
    const { data, error } = await supabase
      .from("Subscriber")
      .insert(args.create)
      .select()
      .single();
    throwIfError(data, error, "subscriber.upsert(create)");
    return data;
  }
}

// ─── exported db object (Prisma-compatible surface) ────────────────────────

export const db = {
  product: {
    findMany: productFindMany,
    findUnique: productFindUnique,
    count: productCount,
    create: productCreate,
    update: productUpdate,
    delete: productDelete,
  },
  category: {
    findMany: categoryFindMany,
    findUnique: categoryFindUnique,
    count: categoryCount,
  },
  review: {
    findMany: reviewFindMany,
    create: reviewCreate,
    count: reviewCount,
  },
  blog: {
    findMany: blogFindMany,
    findUnique: blogFindUnique,
    create: blogCreate,
    update: blogUpdate,
    delete: blogDelete,
    count: blogCount,
  },
  order: {
    findMany: orderFindMany,
    findUnique: orderFindUnique,
    create: orderCreate,
    update: orderUpdate,
    count: orderCount,
  },
  customer: {
    findMany: customerFindMany,
    findUnique: customerFindUnique,
    upsert: customerUpsert,
    count: customerCount,
  },
  lead: {
    findMany: leadFindMany,
    create: leadCreate,
    count: leadCount,
  },
  admin: {
    findUnique: adminFindUnique,
    create: adminCreate,
  },
  content: {
    findMany: contentFindMany,
    upsert: contentUpsert,
  },
  subscriber: {
    upsert: subscriberUpsert,
  },
};
