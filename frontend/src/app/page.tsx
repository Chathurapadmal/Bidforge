import PhotoSlider from "./components/slider";
import ProductGrid, { Product } from "./components/ProductGrid";

const API_BASE = process.env.API_BASE_URL!; 

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/api/products?skip=0&take=12`, {
      next: { revalidate: 60 }, 
    });

    if (!res.ok) {
      console.error("Failed to fetch products:", res.status);
      return [];
    }

    const data = await res.json();
    return (data.items ?? data) as Product[];
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
}

export default async function Page() {
  const products = await getProducts();

  return (
    <main className="p-6 space-y-10">
      <PhotoSlider images={["/sliderpic1.jpg", "/sliderpic2.jpg", "/sliderpic3.jpg"]} />
      <ProductGrid items={products} />
    </main>
  );
}
