/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: SupabaseClient<any> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabase(): SupabaseClient<any> {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error(`Supabase env vars missing at runtime (URL=${url ? "set" : "UNSET"}, KEY=${key ? "set" : "UNSET"})`);
    _supabase = createClient(url, key, { auth: { persistSession: false } });
  }
  return _supabase!;
}

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
  const catSlug = args.where?.categories?.some?.slug;
  const { categories: _cat, ...restWhere } = args.where ?? {};

  let q = getSupabase().from("Product").select(PRODUCT_SELECT);

  if (catSlug) {
    const { data: cat } = await getSupabase().from("Category").select("id").eq("slug", catSlug).maybeSingle();
    if (!cat) return [];
    const { data: links } = await getSupabase().from("_ProductCategories").select("B").eq("A", (cat as any).id);
    const ids = (links ?? []).map((l: any) => l.B);
    if (!ids.length) return [];
    q = (q as any).in("id", ids);
  }

  q = applyWhere(q, catSlug ? restWhere : args.where);
  q = applyOrder(q, args.orderBy);
  if (args.take) q = (q as any).limit(args.take);
  if (args.skip && args.take) q = (q as any).range(args.skip, args.skip + args.take - 1);
  const { data, error } = await q;
  throwIfError(data, error, "product.findMany");
  return (data ?? []).map(parseProduct);
}

async function productFindUnique(args: any) {
  let q = getSupabase().from("Product").select(PRODUCT_SELECT);
  q = applyWhere(q, args.where);
  const { data, error } = await (q as any).maybeSingle();
  throwIfError(data, error, "product.findUnique");
  return data ? parseProduct(data) : null;
}

async function productFindManyByCategory(slug: string, args: any = {}) {
  const { data: cat } = await getSupabase().from("Category").select("id").eq("slug", slug).maybeSingle();
  if (!cat) return [];
  const { data: links } = await getSupabase().from("_ProductCategories").select("B").eq("A", (cat as any).id);
  const ids = (links ?? []).map((l: any) => l.B);
  if (!ids.length) return [];
  let q = getSupabase().from("Product").select(PRODUCT_SELECT).in("id", ids).eq("isActive", true);
  q = applyOrder(q, args.orderBy ?? { name: "asc" });
  const { data, error } = await q;
  throwIfError(data, error, "product.findManyByCategory");
  return (data ?? []).map(parseProduct);
}

async function productCount(args: any = {}) {
  const catSlug = args.where?.categories?.some?.slug;
  const { categories: _cat, ...restWhere } = args.where ?? {};

  let q: any = getSupabase().from("Product").select("id", { count: "exact", head: true });

  if (catSlug) {
    const { data: cat } = await getSupabase().from("Category").select("id").eq("slug", catSlug).maybeSingle();
    if (!cat) return 0;
    const { data: links } = await getSupabase().from("_ProductCategories").select("B").eq("A", (cat as any).id);
    const ids = (links ?? []).map((l: any) => l.B);
    if (!ids.length) return 0;
    q = q.in("id", ids);
    q = applyWhere(q, restWhere);
  } else {
    q = applyWhere(q, args.where);
  }

  const { count, error } = await q;
  throwIfError(count, error, "product.count");
  return count ?? 0;
}

async function productCreate(args: any) {
  const { categories, ...data } = args.data;
  const now = new Date().toISOString();
  const { data: row, error } = await getSupabase().from("Product").insert({ id: crypto.randomUUID(), createdAt: now, updatedAt: now, ...data }).select().single();
  throwIfError(row, error, "product.create");
  if (categories?.connect?.length) {
    await getSupabase().from("_ProductCategories").insert(
      categories.connect.map((c: any) => ({ A: c.id, B: (row as any).id }))
    );
  }
  return row;
}

async function productUpdate(args: any) {
  const { categories, ...data } = args.data;
  let uq: any = getSupabase().from("Product").update({ ...data, updatedAt: new Date().toISOString() });
  for (const [k, v] of Object.entries(args.where)) uq = uq.eq(k, v);
  const { data: row, error } = await uq.select().single();
  throwIfError(row, error, "product.update");
  if (categories) {
    const id = (row as any).id;
    await getSupabase().from("_ProductCategories").delete().eq("B", id);
    const toInsert = (categories.set ?? categories.connect ?? []) as any[];
    if (toInsert.length) {
      await getSupabase().from("_ProductCategories").insert(
        toInsert.map((c: any) => ({ A: c.id, B: id }))
      );
    }
  }
  return row;
}

async function productDelete(args: any) {
  let q: any = getSupabase().from("Product").delete();
  for (const [k, v] of Object.entries(args.where)) q = q.eq(k, v);
  const { error } = await q;
  throwIfError(true, error, "product.delete");
  return { id: args.where.id };
}

// ─── category ──────────────────────────────────────────────────────────────

async function categoryFindMany(args: any = {}) {
  let q: any = getSupabase().from("Category").select("*");
  q = applyWhere(q, args.where);
  q = applyOrder(q, args.orderBy);
  const { data, error } = await q;
  throwIfError(data, error, "category.findMany");
  const rows = data ?? [];

  if (args.include?._count) {
    return await Promise.all(
      rows.map(async (cat: any) => {
        const { count } = await getSupabase()
          .from("_ProductCategories")
          .select("A", { count: "exact", head: true })
          .eq("A", cat.id);
        return { ...cat, _count: { products: count ?? 0 } };
      })
    );
  }
  return rows;
}

async function categoryFindUnique(args: any) {
  let q: any = getSupabase().from("Category").select("*");
  q = applyWhere(q, args.where);
  const { data, error } = await q.maybeSingle();
  throwIfError(data, error, "category.findUnique");
  return data ?? null;
}

async function categoryCount(args: any = {}) {
  let q: any = getSupabase().from("Category").select("id", { count: "exact", head: true });
  q = applyWhere(q, args.where);
  const { count, error } = await q;
  throwIfError(count, error, "category.count");
  return count ?? 0;
}

async function categoryCreate(args: any) {
  const { data, error } = await getSupabase()
    .from("Category")
    .insert({ id: crypto.randomUUID(), ...args.data })
    .select()
    .single();
  throwIfError(data, error, "category.create");
  return data;
}

async function categoryUpdate(args: any) {
  let q: any = getSupabase().from("Category").update(args.data);
  for (const [k, v] of Object.entries(args.where)) q = q.eq(k, v);
  const { data, error } = await q.select().single();
  throwIfError(data, error, "category.update");
  return data;
}

async function categoryDelete(args: any) {
  let q: any = getSupabase().from("Category").delete();
  for (const [k, v] of Object.entries(args.where)) q = q.eq(k, v);
  const { error } = await q;
  throwIfError(true, error, "category.delete");
  return { id: args.where.id };
}

// ─── review ────────────────────────────────────────────────────────────────

async function reviewFindMany(args: any = {}) {
  const incProduct = args.include?.product;
  const select = incProduct ? "*, product:Product(id,name,slug,images)" : "*";
  let q: any = getSupabase().from("Review").select(select);
  q = applyWhere(q, args.where);
  q = applyOrder(q, args.orderBy);
  if (args.take) q = q.limit(args.take);
  const { data, error } = await q;
  throwIfError(data, error, "review.findMany");
  return data ?? [];
}

async function reviewCreate(args: any) {
  const { data, error } = await getSupabase().from("Review").insert({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...args.data }).select().single();
  throwIfError(data, error, "review.create");
  return data;
}

async function reviewCount(args: any = {}) {
  let q: any = getSupabase().from("Review").select("id", { count: "exact", head: true });
  q = applyWhere(q, args.where);
  const { count, error } = await q;
  throwIfError(count, error, "review.count");
  return count ?? 0;
}

// ─── blog ──────────────────────────────────────────────────────────────────

async function blogFindMany(args: any = {}) {
  let q: any = getSupabase().from("Blog").select("*");
  q = applyWhere(q, args.where);
  q = applyOrder(q, args.orderBy);
  if (args.take) q = q.limit(args.take);
  const { data, error } = await q;
  throwIfError(data, error, "blog.findMany");
  return data ?? [];
}

async function blogFindUnique(args: any) {
  let q: any = getSupabase().from("Blog").select("*");
  q = applyWhere(q, args.where);
  const { data, error } = await q.maybeSingle();
  throwIfError(data, error, "blog.findUnique");
  return data ?? null;
}

async function blogCreate(args: any) {
  const now = new Date().toISOString();
  const { data, error } = await getSupabase().from("Blog").insert({ id: crypto.randomUUID(), createdAt: now, updatedAt: now, ...args.data }).select().single();
  throwIfError(data, error, "blog.create");
  return data;
}

async function blogUpdate(args: any) {
  let q: any = getSupabase().from("Blog").update({ ...args.data, updatedAt: new Date().toISOString() });
  for (const [k, v] of Object.entries(args.where)) q = q.eq(k, v);
  const { data, error } = await q.select().single();
  throwIfError(data, error, "blog.update");
  return data;
}

async function blogDelete(args: any) {
  let q: any = getSupabase().from("Blog").delete();
  for (const [k, v] of Object.entries(args.where)) q = q.eq(k, v);
  const { error } = await q;
  throwIfError(true, error, "blog.delete");
  return { id: args.where.id };
}

async function blogCount(args: any = {}) {
  let q: any = getSupabase().from("Blog").select("id", { count: "exact", head: true });
  q = applyWhere(q, args.where);
  const { count, error } = await q;
  throwIfError(count, error, "blog.count");
  return count ?? 0;
}

// ─── routine ───────────────────────────────────────────────────────────────

async function routineFindMany(args: any = {}) {
  let q: any = getSupabase().from("Routine").select("*");
  q = applyWhere(q, args.where);
  q = applyOrder(q, args.orderBy);
  if (args.take) q = q.limit(args.take);
  const { data, error } = await q;
  throwIfError(data, error, "routine.findMany");
  return data ?? [];
}

async function routineFindUnique(args: any) {
  let q: any = getSupabase().from("Routine").select("*");
  q = applyWhere(q, args.where);
  const { data, error } = await q.maybeSingle();
  throwIfError(data, error, "routine.findUnique");
  return data ?? null;
}

async function routineCreate(args: any) {
  const now = new Date().toISOString();
  const { data, error } = await getSupabase()
    .from("Routine")
    .insert({ id: crypto.randomUUID(), createdAt: now, updatedAt: now, ...args.data })
    .select()
    .single();
  throwIfError(data, error, "routine.create");
  return data;
}

async function routineUpdate(args: any) {
  let q: any = getSupabase().from("Routine").update({ ...args.data, updatedAt: new Date().toISOString() });
  for (const [k, v] of Object.entries(args.where)) q = q.eq(k, v);
  const { data, error } = await q.select().single();
  throwIfError(data, error, "routine.update");
  return data;
}

async function routineDelete(args: any) {
  let q: any = getSupabase().from("Routine").delete();
  for (const [k, v] of Object.entries(args.where)) q = q.eq(k, v);
  const { error } = await q;
  throwIfError(true, error, "routine.delete");
  return { id: args.where.id };
}

async function routineCount(args: any = {}) {
  let q: any = getSupabase().from("Routine").select("id", { count: "exact", head: true });
  q = applyWhere(q, args.where);
  const { count, error } = await q;
  throwIfError(count, error, "routine.count");
  return count ?? 0;
}

// ─── order ─────────────────────────────────────────────────────────────────

function buildOrderSelect(include: any) {
  const incItems = include?.items;
  const incCustomer = include?.customer;
  const incProduct = typeof incItems === "object" && incItems?.include?.product;
  let select = "*";
  if (incCustomer) select += ", customer:Customer(id,name,email,phone)";
  if (incItems) {
    select += incProduct
      ? ", items:OrderItem(*, product:Product(id,name,slug,images))"
      : ", items:OrderItem(*)";
  }
  return select;
}

async function orderFindMany(args: any = {}) {
  let q: any = getSupabase().from("Order").select(buildOrderSelect(args.include));
  q = applyWhere(q, args.where);
  q = applyOrder(q, args.orderBy);
  if (args.take) q = q.limit(args.take);
  if (args.skip && args.take) q = q.range(args.skip, args.skip + args.take - 1);
  const { data, error } = await q;
  throwIfError(data, error, "order.findMany");
  return data ?? [];
}

async function orderFindUnique(args: any) {
  let q: any = getSupabase().from("Order").select(buildOrderSelect(args.include));
  q = applyWhere(q, args.where);
  const { data, error } = await q.maybeSingle();
  throwIfError(data, error, "order.findUnique");
  return data ?? null;
}

async function orderCreate(args: any) {
  const { items, ...orderData } = args.data;
  const orderId = crypto.randomUUID();
  const now = new Date().toISOString();
  const { data: order, error } = await getSupabase()
    .from("Order")
    .insert({ id: orderId, createdAt: now, updatedAt: now, ...orderData })
    .select()
    .single();
  throwIfError(order, error, "order.create");
  if (items?.create?.length) {
    await getSupabase().from("OrderItem").insert(
      items.create.map((item: any) => ({ id: crypto.randomUUID(), ...item, orderId }))
    );
  }
  return order;
}

async function orderUpdate(args: any) {
  let q: any = getSupabase().from("Order").update({ ...args.data, updatedAt: new Date().toISOString() });
  for (const [k, v] of Object.entries(args.where)) q = q.eq(k, v);
  const { data, error } = await q.select().single();
  throwIfError(data, error, "order.update");
  return data;
}

async function orderCount(args: any = {}) {
  let q: any = getSupabase().from("Order").select("id", { count: "exact", head: true });
  q = applyWhere(q, args.where);
  const { count, error } = await q;
  throwIfError(count, error, "order.count");
  return count ?? 0;
}

// ─── customer ──────────────────────────────────────────────────────────────

async function customerFindMany(args: any = {}) {
  let q: any = getSupabase().from("Customer").select("*");
  q = applyWhere(q, args.where);
  q = applyOrder(q, args.orderBy);
  if (args.take) q = q.limit(args.take);
  const { data, error } = await q;
  throwIfError(data, error, "customer.findMany");
  const rows = data ?? [];

  if (args.include?._count) {
    return await Promise.all(
      rows.map(async (c: any) => {
        const { count } = await getSupabase()
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
  let q: any = getSupabase().from("Customer").select("*");
  q = applyWhere(q, args.where);
  const { data, error } = await q.maybeSingle();
  throwIfError(data, error, "customer.findUnique");
  if (!data) return null;

  const incOrders = args.include?.orders;
  if (incOrders) {
    const incItems = typeof incOrders === "object" && incOrders?.include?.items;
    const select = incItems ? "*, items:OrderItem(*)" : "*";
    const { data: orders } = await getSupabase()
      .from("Order")
      .select(select)
      .eq("customerId", data.id)
      .order("createdAt", { ascending: false });
    return { ...data, orders: orders ?? [] };
  }
  return data;
}

async function customerUpsert(args: any) {
  const { data: existing } = await getSupabase()
    .from("Customer")
    .select("id")
    .eq("email", args.where.email)
    .maybeSingle();

  if (existing) {
    const { data, error } = await getSupabase()
      .from("Customer")
      .update(args.update)
      .eq("id", (existing as any).id)
      .select()
      .single();
    throwIfError(data, error, "customer.upsert(update)");
    return data;
  } else {
    const now = new Date().toISOString();
    const { data, error } = await getSupabase()
      .from("Customer")
      .insert({ id: crypto.randomUUID(), createdAt: now, addresses: [], ...args.create })
      .select()
      .single();
    throwIfError(data, error, "customer.upsert(create)");
    return data;
  }
}

async function customerUpdate(args: any) {
  const { data, error } = await getSupabase()
    .from("Customer")
    .update(args.data)
    .eq("id", args.where.id)
    .select()
    .single();
  throwIfError(data, error, "customer.update");
  return data;
}

async function customerCount(args: any = {}) {
  let q: any = getSupabase().from("Customer").select("id", { count: "exact", head: true });
  q = applyWhere(q, args.where);
  const { count, error } = await q;
  throwIfError(count, error, "customer.count");
  return count ?? 0;
}

// ─── featured events ───────────────────────────────────────────────────────

async function featuredEventFindMany(args: any = {}) {
  let q: any = getSupabase().from("FeaturedEvent").select("*");
  q = applyWhere(q, args.where);
  q = applyOrder(q, args.orderBy ?? { sortOrder: "asc" });
  const { data, error } = await q;
  throwIfError(data, error, "featuredEvent.findMany");
  return data ?? [];
}

async function featuredEventFindUnique(args: any) {
  let q: any = getSupabase().from("FeaturedEvent").select("*");
  q = applyWhere(q, args.where);
  const { data, error } = await q.maybeSingle();
  throwIfError(data, error, "featuredEvent.findUnique");
  return data ?? null;
}

async function featuredEventCreate(args: any) {
  const now = new Date().toISOString();
  const { data, error } = await getSupabase().from("FeaturedEvent").insert({ id: crypto.randomUUID(), createdAt: now, updatedAt: now, enabled: false, sortOrder: 0, ...args.data }).select().single();
  throwIfError(data, error, "featuredEvent.create");
  return data;
}

async function featuredEventUpdate(args: any) {
  const now = new Date().toISOString();
  let q: any = getSupabase().from("FeaturedEvent").update({ ...args.data, updatedAt: now });
  q = applyWhere(q, args.where);
  const { data, error } = await q.select().single();
  throwIfError(data, error, "featuredEvent.update");
  return data;
}

async function featuredEventDelete(args: any) {
  let q: any = getSupabase().from("FeaturedEvent").delete();
  q = applyWhere(q, args.where);
  const { error } = await q;
  throwIfError(true, error, "featuredEvent.delete");
}

async function featuredEventProductFindMany(args: any = {}) {
  let q: any = getSupabase().from("FeaturedEventProduct").select("*");
  q = applyWhere(q, args.where);
  q = applyOrder(q, args.orderBy ?? { sortOrder: "asc" });
  const { data, error } = await q;
  throwIfError(data, error, "featuredEventProduct.findMany");
  return data ?? [];
}

async function featuredEventProductCreate(args: any) {
  const { data, error } = await getSupabase().from("FeaturedEventProduct").insert({ id: crypto.randomUUID(), sortOrder: 0, ...args.data }).select().single();
  throwIfError(data, error, "featuredEventProduct.create");
  return data;
}

async function featuredEventProductDelete(args: any) {
  let q: any = getSupabase().from("FeaturedEventProduct").delete();
  q = applyWhere(q, args.where);
  const { error } = await q;
  throwIfError(true, error, "featuredEventProduct.delete");
}

async function featuredEventProductDeleteMany(args: any) {
  let q: any = getSupabase().from("FeaturedEventProduct").delete();
  q = applyWhere(q, args.where);
  const { error } = await q;
  throwIfError(true, error, "featuredEventProduct.deleteMany");
}

// ─── chat ──────────────────────────────────────────────────────────────────

async function chatSessionUpsert(sessionId: string, email?: string) {
  const { data: existing } = await getSupabase().from("ChatSession").select("id").eq("sessionId", sessionId).maybeSingle();
  if (existing) {
    if (email) await getSupabase().from("ChatSession").update({ userEmail: email }).eq("sessionId", sessionId);
    return existing;
  }
  const { data, error } = await getSupabase().from("ChatSession").insert({ id: crypto.randomUUID(), sessionId, userEmail: email ?? null, createdAt: new Date().toISOString() }).select().single();
  throwIfError(data, error, "chatSession.upsert");
  return data;
}

async function chatSessionFindMany(args: any = {}) {
  let q: any = getSupabase().from("ChatSession").select("*");
  q = applyOrder(q, args.orderBy ?? { createdAt: "desc" });
  if (args.take) q = q.limit(args.take);
  const { data, error } = await q;
  throwIfError(data, error, "chatSession.findMany");
  return data ?? [];
}

async function chatMessageCreate(args: any) {
  const { data, error } = await getSupabase().from("ChatMessage").insert({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...args.data }).select().single();
  throwIfError(data, error, "chatMessage.create");
  return data;
}

async function chatMessageFindMany(args: any = {}) {
  let q: any = getSupabase().from("ChatMessage").select("*");
  q = applyWhere(q, args.where);
  q = applyOrder(q, args.orderBy ?? { createdAt: "asc" });
  if (args.take) q = q.limit(args.take);
  const { data, error } = await q;
  throwIfError(data, error, "chatMessage.findMany");
  return data ?? [];
}

// ─── lead ──────────────────────────────────────────────────────────────────

async function leadFindMany(args: any = {}) {
  let q: any = getSupabase().from("Lead").select("*");
  q = applyWhere(q, args.where);
  q = applyOrder(q, args.orderBy);
  if (args.take) q = q.limit(args.take);
  const { data, error } = await q;
  throwIfError(data, error, "lead.findMany");
  return data ?? [];
}

async function leadCreate(args: any) {
  const { data, error } = await getSupabase().from("Lead").insert({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), reviewed: false, ...args.data }).select().single();
  throwIfError(data, error, "lead.create");
  return data;
}

async function leadCount(args: any = {}) {
  let q: any = getSupabase().from("Lead").select("id", { count: "exact", head: true });
  q = applyWhere(q, args.where);
  const { count, error } = await q;
  throwIfError(count, error, "lead.count");
  return count ?? 0;
}

// ─── admin ─────────────────────────────────────────────────────────────────

async function adminFindUnique(args: any) {
  let q: any = getSupabase().from("Admin").select("*");
  q = applyWhere(q, args.where);
  const { data, error } = await q.maybeSingle();
  throwIfError(data, error, "admin.findUnique");
  return data ?? null;
}

async function adminCreate(args: any) {
  const { data, error } = await getSupabase().from("Admin").insert(args.data).select().single();
  throwIfError(data, error, "admin.create");
  return data;
}

// ─── content ───────────────────────────────────────────────────────────────

async function contentFindMany(args: any = {}) {
  let q: any = getSupabase().from("Content").select("*");
  q = applyWhere(q, args.where);
  const { data, error } = await q;
  throwIfError(data, error, "content.findMany");
  return data ?? [];
}

async function contentUpsert(args: any) {
  const { data: existing } = await getSupabase()
    .from("Content")
    .select("id")
    .eq("key", args.where.key)
    .maybeSingle();

  const now = new Date().toISOString();
  if (existing) {
    const { data, error } = await getSupabase()
      .from("Content")
      .update({ ...args.update, updatedAt: now })
      .eq("id", (existing as any).id)
      .select()
      .single();
    throwIfError(data, error, "content.upsert(update)");
    return data;
  } else {
    const { data, error } = await getSupabase()
      .from("Content")
      .insert({ id: crypto.randomUUID(), updatedAt: now, ...args.create })
      .select()
      .single();
    throwIfError(data, error, "content.upsert(create)");
    return data;
  }
}

// ─── subscriber ────────────────────────────────────────────────────────────

async function subscriberUpsert(args: any) {
  const { data: existing } = await getSupabase()
    .from("Subscriber")
    .select("id")
    .eq("email", args.where.email)
    .maybeSingle();

  if (existing) {
    const { data, error } = await getSupabase()
      .from("Subscriber")
      .update(args.update)
      .eq("id", (existing as any).id)
      .select()
      .single();
    throwIfError(data, error, "subscriber.upsert(update)");
    return data;
  } else {
    const { data, error } = await getSupabase()
      .from("Subscriber")
      .insert({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...args.create })
      .select()
      .single();
    throwIfError(data, error, "subscriber.upsert(create)");
    return data;
  }
}

// ─── skin profile ──────────────────────────────────────────────────────────

async function skinProfileFindUnique(args: any) {
  let q: any = getSupabase().from("SkinProfile").select("*");
  q = applyWhere(q, args.where);
  const { data, error } = await q.maybeSingle();
  throwIfError(data, error, "skinProfile.findUnique");
  return data ?? null;
}

async function skinProfileUpsert(args: any) {
  const { data: existing } = await getSupabase()
    .from("SkinProfile")
    .select("id")
    .eq("userEmail", args.where.userEmail)
    .maybeSingle();

  if (existing) {
    const { data, error } = await getSupabase()
      .from("SkinProfile")
      .update({ ...args.update, updatedAt: new Date().toISOString() })
      .eq("id", (existing as any).id)
      .select()
      .single();
    throwIfError(data, error, "skinProfile.upsert(update)");
    return data;
  } else {
    const { data, error } = await getSupabase().from("SkinProfile").insert(args.create).select().single();
    throwIfError(data, error, "skinProfile.upsert(create)");
    return data;
  }
}

// ─── gift card ─────────────────────────────────────────────────────────────

async function giftCardCreate(args: any) {
  const now = new Date().toISOString();
  const { data, error } = await getSupabase().from("GiftCard").insert({ id: crypto.randomUUID(), createdAt: now, updatedAt: now, ...args.data }).select().single();
  throwIfError(data, error, "giftCard.create");
  return data;
}

async function giftCardFindMany(args: any = {}) {
  let q: any = getSupabase().from("GiftCard").select("*");
  q = applyWhere(q, args.where);
  q = applyOrder(q, args.orderBy);
  if (args.take) q = q.limit(args.take);
  const { data, error } = await q;
  throwIfError(data, error, "giftCard.findMany");
  return data ?? [];
}

async function giftCardFindUnique(args: any) {
  let q: any = getSupabase().from("GiftCard").select("*");
  q = applyWhere(q, args.where);
  const { data, error } = await q.maybeSingle();
  throwIfError(data, error, "giftCard.findUnique");
  return data ?? null;
}

async function giftCardUpdate(args: any) {
  let q: any = getSupabase().from("GiftCard").update(args.data);
  for (const [k, v] of Object.entries(args.where)) q = q.eq(k, v);
  const { data, error } = await q.select().single();
  throwIfError(data, error, "giftCard.update");
  return data;
}

async function giftCardCount(args: any = {}) {
  let q: any = getSupabase().from("GiftCard").select("id", { count: "exact", head: true });
  q = applyWhere(q, args.where);
  const { count, error } = await q;
  throwIfError(count, error, "giftCard.count");
  return count ?? 0;
}

// ─── coupon ────────────────────────────────────────────────────────────────

async function couponFindMany(args: any = {}) {
  let q: any = getSupabase().from("Coupon").select("*");
  q = applyWhere(q, args.where);
  q = applyOrder(q, args.orderBy);
  if (args.take) q = q.limit(args.take);
  const { data, error } = await q;
  throwIfError(data, error, "coupon.findMany");
  return data ?? [];
}

async function couponFindUnique(args: any) {
  let q: any = getSupabase().from("Coupon").select("*");
  q = applyWhere(q, args.where);
  const { data, error } = await q.maybeSingle();
  throwIfError(data, error, "coupon.findUnique");
  return data ?? null;
}

async function couponCreate(args: any) {
  const now = new Date().toISOString();
  const { data, error } = await getSupabase().from("Coupon").insert({ id: crypto.randomUUID(), createdAt: now, updatedAt: now, ...args.data }).select().single();
  throwIfError(data, error, "coupon.create");
  return data;
}

async function couponUpdate(args: any) {
  let q: any = getSupabase().from("Coupon").update({ ...args.data, updatedAt: new Date().toISOString() });
  for (const [k, v] of Object.entries(args.where)) q = q.eq(k, v);
  const { data, error } = await q.select().single();
  throwIfError(data, error, "coupon.update");
  return data;
}

async function couponDelete(args: any) {
  let q: any = getSupabase().from("Coupon").delete();
  for (const [k, v] of Object.entries(args.where)) q = q.eq(k, v);
  const { error } = await q;
  throwIfError(true, error, "coupon.delete");
  return { id: args.where.id };
}

async function couponCount(args: any = {}) {
  let q: any = getSupabase().from("Coupon").select("id", { count: "exact", head: true });
  q = applyWhere(q, args.where);
  const { count, error } = await q;
  throwIfError(count, error, "coupon.count");
  return count ?? 0;
}

// ─── exported db object ────────────────────────────────────────────────────

export const db = {
  product: {
    findMany: productFindMany,
    findManyByCategory: productFindManyByCategory,
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
    create: categoryCreate,
    update: categoryUpdate,
    delete: categoryDelete,
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
  routine: {
    findMany: routineFindMany,
    findUnique: routineFindUnique,
    create: routineCreate,
    update: routineUpdate,
    delete: routineDelete,
    count: routineCount,
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
    update: customerUpdate,
    count: customerCount,
  },
  lead: {
    findMany: leadFindMany,
    create: leadCreate,
    count: leadCount,
  },
  featuredEvent: {
    findMany: featuredEventFindMany,
    findUnique: featuredEventFindUnique,
    create: featuredEventCreate,
    update: featuredEventUpdate,
    delete: featuredEventDelete,
  },
  featuredEventProduct: {
    findMany: featuredEventProductFindMany,
    create: featuredEventProductCreate,
    delete: featuredEventProductDelete,
    deleteMany: featuredEventProductDeleteMany,
  },
  chatSession: {
    upsert: chatSessionUpsert,
    findMany: chatSessionFindMany,
  },
  chatMessage: {
    create: chatMessageCreate,
    findMany: chatMessageFindMany,
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
  skinProfile: {
    findUnique: skinProfileFindUnique,
    upsert: skinProfileUpsert,
  },
  giftCard: {
    create: giftCardCreate,
    findMany: giftCardFindMany,
    findUnique: giftCardFindUnique,
    update: giftCardUpdate,
    count: giftCardCount,
  },
  coupon: {
    findMany: couponFindMany,
    findUnique: couponFindUnique,
    create: couponCreate,
    update: couponUpdate,
    delete: couponDelete,
    count: couponCount,
  },
};
