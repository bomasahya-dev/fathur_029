import express from "express";

const starterProducts = [
  { id: 1, name: "Pulpen", price: 5000 },
  { id: 2, name: "Buku Tulis", price: 12000 },
  { id: 3, name: "Spidol", price: 8000 },
  { id: 4, name: "Penggaris", price: 6000 },
  { id: 5, name: "Penghapus", price: 3000 },
];

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateProduct(body) {
  if (!isRecord(body)) {
    return { error: "Body request harus berupa object JSON" };
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const price = body.price;

  if (!name) return { error: "Nama produk wajib diisi" };
  if (!Number.isSafeInteger(price) || price < 0) {
    return { error: "Harga harus bilangan bulat tidak negatif" };
  }

  return { value: { name, price } };
}

function positiveId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function createApp(initialProducts = starterProducts) {
  const app = express();
  let products = initialProducts.map((product) => ({ ...product }));

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: true, message: "Server berjalan dengan baik" });
  });

  app.get("/api/products", (req, res) => {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const data = search
      ? products.filter((product) =>
          product.name.toLocaleLowerCase("id-ID").includes(search.toLocaleLowerCase("id-ID")),
        )
      : products;

    res.json({
      status: true,
      message: "Berhasil mengambil daftar produk",
      data,
      metadata: { totalItems: data.length },
    });
  });

  app.get("/api/products/:id", (req, res) => {
    const id = positiveId(req.params.id);
    if (id === null) {
      return res.status(400).json({ status: false, message: "ID produk tidak valid" });
    }

    const product = products.find((item) => item.id === id);
    if (!product) {
      return res.status(404).json({ status: false, message: "Produk tidak ditemukan" });
    }

    return res.json({ status: true, message: "Berhasil mengambil detail produk", data: product });
  });

  app.post("/api/products", (req, res) => {
    const result = validateProduct(req.body);
    if (result.error) {
      return res.status(400).json({ status: false, message: result.error });
    }

    const id = products.reduce((highest, product) => Math.max(highest, product.id), 0) + 1;
    const product = { id, ...result.value };
    products.push(product);

    return res.status(201).json({ status: true, message: "Produk berhasil dibuat", data: product });
  });

  app.put("/api/products/:id", updateProduct);
  app.patch("/api/products/:id", updateProduct);

  function updateProduct(req, res) {
    const id = positiveId(req.params.id);
    if (id === null) {
      return res.status(400).json({ status: false, message: "ID produk tidak valid" });
    }

    const index = products.findIndex((product) => product.id === id);
    if (index === -1) {
      return res.status(404).json({ status: false, message: "Produk tidak ditemukan" });
    }

    const result = validateProduct(req.body);
    if (result.error) {
      return res.status(400).json({ status: false, message: result.error });
    }

    products[index] = { id, ...result.value };
    return res.json({ status: true, message: "Produk berhasil diperbarui", data: products[index] });
  }

  app.delete("/api/products/:id", (req, res) => {
    const id = positiveId(req.params.id);
    if (id === null) {
      return res.status(400).json({ status: false, message: "ID produk tidak valid" });
    }

    const index = products.findIndex((product) => product.id === id);
    if (index === -1) {
      return res.status(404).json({ status: false, message: "Produk tidak ditemukan" });
    }

    products.splice(index, 1);
    return res.json({ status: true, message: "Produk berhasil dihapus", data: { productId: id } });
  });

  app.use((req, res) => {
    res.status(404).json({ status: false, message: "Endpoint tidak ditemukan" });
  });

  app.use((error, _req, res, _next) => {
    if (error instanceof SyntaxError && "body" in error) {
      return res.status(400).json({ status: false, message: "Body JSON tidak valid" });
    }

    return res.status(500).json({ status: false, message: "Terjadi kesalahan pada server" });
  });

  return app;
}

export const app = createApp();