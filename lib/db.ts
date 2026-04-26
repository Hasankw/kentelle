/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// ─── helpers ───────────────────────────────────────────────────────────────

function applyWhere(query: any, where: Record<string, unknown> = {}) {
  for (const [col, val] of Object.entries(where)) {
    if (val === undefined || val === null) continue;
    // Skip Prisma-specific relation filters
    if (col === "OR" || col === "AND" || col === "NOT") continue;
    if (typeof val === "object" && !Array.isArray(val)) {
      const v = val as Record<string, unknown>;
      if ("gt"  in v) query = query.gt(col, v.gt);
      if ("gte" in v) query = query.gte(col, v.gte);
      if ("lt"  in v) query = query.lt(col, v.lt);
      if ("lte" in v) query = query.lte(col, v.lte);
      if ("not" in v) query = query.neq(col, v.not);
      if ("in"  in v) query = query.in(col, v.in as unknown[]);
      if ("contains" in v) query = query.ilike(col, `%${v.contains}%`);
      // skip relation filters like { some: ... }
    } else if (Array.isArray(val)) {
      query = query.in(col, val);
    } else {
      query = query.eq(col, val);
    }
  }
  return query;
}

function applyOrder(query: any, orderBy: any = {}) {
  const entries = Array.isArray(orderBy)
    ? orderBy.flatMap((o: any) => Object.entries(o))
    : Object.entries(orderBy);
  for (const [col, dir] of entries) {
    query = query.order(col, { ascending: dir === "asc" });
  }
  return query;
}

function throwIfError(data: any, error: any, label: string) {
  if (error) throw new Error(`[db:${label}] ${error.message}`);
  return data;
}

function flattenCategories(raw: any[] = []) {
  return raw.map((r: any) => r.category);
}

function parseProduct(p: any) {
  if (!p) return p;
  const cats = Array.isArray(p.categories) ? flattenCategories(p.categories) : [];
  return { ...p, categories: cats };
}

// ─── product ───────────────────────────────────────────────────────────────

const PRODUCT_SELECT = "*, categories:_ProductCategories(category:Category(*))";

async function productFindMany(args: any = {}) {
  let q = supabase.from("Product").select(PRODUCT_SELECT);
  q = applyWhere(q, args.where);
  q = applyOrder(q, args.orderBy);
  if (args.take) q = (q as any).limit(args.take);
  if (args.skip && args.take) q = (q as any).range(args.skip, args.skip + args.take - 1);
  const { data, error } = await q;
  throwIfError(data, error, "product.findMany");
  return (data ?? []).map(parseProduct);
}

async function productFindUnique(args: any) {
  let q = supabase.from("Product").select(PRODUCT_SELECT);
  q = applyWhere(q, args.where);
  const { data, error } = await (q as any).maybeSingle();
  throwIfError(data, error, "product.findUnique");
  return data ? parseProduct(data) : null;
}

async function productCount(args: any = {}) {
  let q: any = supabase.from("Product").select("id", { count: "exact", head: true });
  q = applyWhere(q, args.where);
  const { count, error } = await q;
  throwIfError(count, error, "product.count");
  return count ?? 0;
}

async function productCreate(args: any) {
  const { categories, ...data } = args.data;
  const { data: row, error } = await supabase.from("Product").insert(data).select().single();
  throwIfError(row, error, "product.create");
  if (categories?.connect?.length) {
    await supabase.from("_ProductCategories").insert(
      categories.connect.map((c: any) => ({ A: c.id, B: (row as any).id }))
    );
  }
  return row;
}

async function productUpdate(args: any) {
  const { categories, ...data } = args.data;
  let uq: any = supabase.from("Product").update(data);
  for (const [k, v] of Object.entries(args.where)) uq = uq.eq(k, v);
  const { data: row, error } = await uq.select().single();
  throwIfError(row, error, "product.update");
  if (categories) {
    const id = (row as any).id;
    await supabase.from("_ProductCategories").delete().eq("B", id);
    const toInsert = (categories.set ?? categories.connect ?? []) as any[];
    if (toInsert.length) {
      await supabase.from("_ProductCategories").insert(
        toInsert.map((c: any) => ({ A: c.id, B: id }))
      );
    }
  }
  return row;
}

async function productDelete(args: any) {
  let q: any = supabase.from("Product").delete();
  for (const [k, v] of Object.entries(args.where)) q = q.eq(k, v);
  const { error } = await q;
  throwIfError(true, error, "product.delete");
  return { id: args.where.id };
}

// ─── category ──────────────────────────────────────────────────────────────

async function categoryFindMany(args: any = {}) {
  let q: any = supabase.from("Category").select("*");
  q = applyWhere(q, args.where);
  q = applyOrder(q, args.orderBy);
  const { data, error } = await q;
  throwIfError(data, error, "category.findMany");
  return data ?? [];
}

async function categoryFindUnique(args: any) {
  let q: any = supabase.from("Category").select("*");
  q = applyWhere(q, args.where);
  const { data, error } = await q.maybeSingle();
  throwIfError(data, error, "category.findUnique");
  return data ?? null;
}

async function categoryCount(args: any = {}) {
  let q: any = supabase.from("Category").select("id", { count: "exact", head: true });
  q = applyWhere(q, args.where);
  const { count, error } = await q;
  throwIfError(count, error, "category.count");
  return count ?? 0;
}

// ─── review ────────────────────────────────────────────────────────────────

async function reviewFindMany(args: any = {}) {
  const incProduct = args.include?.product;
  const select = incProduct ? "*, product:Product(id,name,slug,images)" : "*";
  let q: any = supabase.from("Review").select(select);
  q = applyWhere(q, args.where);
  q = applyOrder(q, args.orderBy);
  if (args.take) q = q.limit(args.take);
  const { data, error } = await q;
  throwIfError(data, error, "review.findMany");
  return data ?? [];
}

async function reviewCreate(args: any) {
  const { data, error } = await supabase.from("Review").insert(args.data).select().single();
  throwIfError(data, error, "review.create");
  return data;
}

async function reviewCount(args: any = {}) {
  let q: any = supabase.from("Review").select("id", { count: "exact", head: true });
  q = applyWhere(q, args.where);
  const { count, error } = await q;
  throwIfError(count, error, "review.count");
  return count ?? 0;
}

// ─── blog ──────────────────────────────────────────────────────────────────

async function blogFindMany(args: any = {}) {
  let q: any = supabase.from("Blog").select("*");
  q = applyWhere(q, args.where);
  q = applyOrder(q, args.orderBy);
  if (args.take) q = q.limit(args.take);
  const { data, error } = await q;
  throwIfError(data, error, "blog.findMany");
  return data ?? [];
}

async function blogFindUnique(args: any) {
  let q: any = supabase.from("Blog").select("*");
  q = applyWhere(q, args.where);
  const { data, error } = await q.maybeSingle();
  throwIfError(data, error, "blog.findUnique");
  return data ?? null;
}

async function blogCreate(args: any) {
  const { data, error } = await supabase.from("Blog").insert(args.data).select().single();
  throwIfError(data, error, "blog.create");
  return data;
}

async function blogUpdate(args: any) {
  let q: any = supabase.from("Blog").update(args.data);
  for (const [k, v] of Object.entries(args.where)) q = q.eq(k, v);
  const { data, error } = await q.select().single();
  throwIfError(data, error, "blog.update");
  return data;
}

async function blogDelete(args: any) {
  let q: any = supabase.from("Blog").delete();
  for (const [k, v] of Object.entries(args.where)) q = q.eq(k, v);
  const { error } = await q;
  throwIfError(true, error, "blog.delete");
  return { id: args.where.id };
}

async function blogCount(args: any = {}) {
  let q: any = supabase.from("Blog").select("id", { count: "exact", head: true });
  q = applyWhere(q, args.where);
  const { count, error } = await q;
  throwIfError(count, error, "blog.count");
  return count ?? 0;
}

// ─── order ─────────────────────────────────────────────────────────────────

function buildOrderSelect(include: any) {
  const incItems = include?.items;
  const incCustomer = include?.customer;
  const incProduct = typeof incItems === "object" && incItems?.include?.product;
  let select = "*";
  if (incCustomer) select += ", customer:Customer(id,firstName,lastName,email)";
  if (incItems) {
    select += incProduct
      ? ", items:OrderItem(*, product:Product(id,name,slug,images))"
      : ", items:OrderItem(*)";
  }
  return select;
}

async function orderFindMany(args: any = {}) {
  let q: any = supabase.from("Order").select(buildOrderSelect(args.include));
  q = applyWhere(q, args.where);
  q = applyOrder(q, args.orderBy);
  if (args.take) q = q.limit(args.take);
  if (args.skip && args.take) q = q.range(args.skip, args.skip + args.take - 1);
  const { data, error } = await q;
  throwIfError(data, error, "order.findMany");
  return data ?? [];
}

async function orderFindUnique(args: any) {
  let q: any = supabase.from("Order").select(buildOrderSelect(args.include));
  q = applyWhere(q, args.where);
  const { data, error } = await q.maybeSingle();
  throwIfError(data, error, "order.findUnique");
  return data ?? null;
}

async function orderCreate(args: any) {
  const { items, ...orderData } = args.data;
  const { data: order, error } = await supabase.from("Order").insert(orderData).select().single();
  throwIfError(order, error, "order.create");
  if (items?.create?.length) {
    await supabase.from("OrderItem").insert(
      items.create.map((item: any) => ({ ...item, orderId: (order as any).id }))
    );
  }
  return order;
}

async function orderUpdate(args: any) {
  let q: any = supabase.from("Order").update(args.data);
  for (const [k, v] of Object.entries(args.where)) q = q.eq(k, v);
  const { data, error } = await q.select().single();
  throwIfError(data, error, "order.update");
  return data;
}

async function orderCount(args: any = {}) {
  let q: any = supabase.from("Order").select("id", { count: "exact", head: true });
  q = applyWhere(q, args.where);
  const { count, error } = await q;
  throwIfError(count, error, "order.count");
  return count ?? 0;
}

// ─── customer ──────────────────────────────────────────────────────────────

async function customerFindMany(args: any = {}) {
  let q: any = supabase.from("Customer").select("*");
  q = applyWhere(q, args.where);
  q = applyOrder(q, args.orderBy);
  if (args.take) q = q.limit(args.take);
  const { data, error } = await q;
  throwIfError(data, error, "customer.findMany");
  const rows = data ?? [];

  if (args.include?._count) {
    return await Promise.all(
      rows.map(async (c: any) => {
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

async function customerFindUnique(args: any) {
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
      .eq("customerId", data.id)
      .order("createdAt", { ascending: false });
    return { ...data, orders: orders ?? [] };
  }
  return data;
}

async function customerUpsert(args: any) {
  const { data: existing } = await supabase
    .from("Customer")
    .select("id")
    .eq("email", args.where.email)
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

async function customerCount(args: any = {}) {
  let q: any = supabase.from("Customer").select("id", { count: "exact", head: true });
  q = applyWhere(q, args.where);
  const { count, error } = await q;
  throwIfError(count, error, "customer.count");
  return count ?? 0;
}

// ─── lead ──────────────────────────────────────────────────────────────────

async function leadFindMany(args: any = {}) {
  let q: any = supabase.from("Lead").select("*");
  q = applyWhere(q, args.where);
  q = applyOrder(q, args.orderBy);
  if (args.take) q = q.limit(args.take);
  const { data, error } = await q;
  throwIfError(data, error, "lead.findMany");
  return data ?? [];
}

async function leadCreate(args: any) {
  const { data, error } = await supabase.from("Lead").insert(args.data).select().single();
  throwIfError(data, error, "lead.create");
  return data;
}

async function leadCount(args: any = {}) {
  let q: any = supabase.from("Lead").select("id", { count: "exact", head: true });
  q = applyWhere(q, args.where);
  const { count, error } = await q;
  throwIfError(count, error, "lead.count");
  return count ?? 0;
}

// ─── admin ─────────────────────────────────────────────────────────────────

async function adminFindUnique(args: any) {
  let q: any = supabase.from("Admin").select("*");
  q = applyWhere(q, args.where);
  const { data, error } = await q.maybeSingle();
  throwIfError(data, error, "admin.findUnique");
  return data ?? null;
}

async function adminCreate(args: any) {
  const { data, error } = await supabase.from("Admin").insert(args.data).select().single();
  throwIfError(data, error, "admin.create");
  return data;
}

// ─── content ───────────────────────────────────────────────────────────────

async function contentFindMany(args: any = {}) {
  let q: any = supabase.from("Content").select("*");
  q = applyWhere(q, args.where);
  const { data, error } = await q;
  throwIfError(data, error, "content.findMany");
  return data ?? [];
}

async function contentUpsert(args: any) {
  const { data: existing } = await supabase
    .from("Content")
    .select("id")
    .eq("key", args.where.key)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("Content")
      .update(args.update)
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

async function subscriberUpsert(args: any) {
  const { data: existing } = await supabase
    .from("Subscriber")
    .select("id")
    .eq("email", args.where.email)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("Subscriber")
      .update(args.update)
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

// ─── exported db object ────────────────────────────────────────────────────

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
