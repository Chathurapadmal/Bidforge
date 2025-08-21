import PhotoSlider from "./components/slider";

export default function Page() {
  return (
    <div className="p-6">

      <PhotoSlider images={["/bidf.png", "/bidf.jpg", "photo2.webp", "photo1.webp"]} />
    </div>
  );
}
